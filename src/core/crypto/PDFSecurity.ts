/**
 * Implementação de segurança PDF conforme especificação ISO 32000.
 * Suporta criptografia Standard (RC4 e AES) para PDFs versões 1.4-2.0.
 */

import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFArray from 'src/core/objects/PDFArray';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import { md5, md5Combined } from './md5';
import { rc4Encrypt } from './rc4';
import { aesCbcEncrypt, aesCbcDecrypt } from './aes';

/**
 * Permissões de documento PDF.
 */
export interface PDFPermissions {
  /** Permite impressão */
  printing?: boolean;
  /** Permite impressão em alta qualidade */
  printingHighQuality?: boolean;
  /** Permite modificar o documento */
  modifying?: boolean;
  /** Permite copiar conteúdo */
  copying?: boolean;
  /** Permite adicionar/modificar anotações e campos de formulário */
  annotating?: boolean;
  /** Permite preencher campos de formulário */
  fillingForms?: boolean;
  /** Permite extração de conteúdo para acessibilidade */
  contentAccessibility?: boolean;
  /** Permite montar o documento */
  documentAssembly?: boolean;
}

/**
 * Opções de criptografia para salvar PDFs.
 */
export interface EncryptionOptions {
  /** Senha do usuário (permite abrir o documento) */
  userPassword?: string;
  /** Senha do proprietário (permite acesso total) */
  ownerPassword: string;
  /** Permissões do documento */
  permissions?: PDFPermissions;
  /** Versão da criptografia: 1=40-bit RC4, 2=128-bit RC4, 4=128-bit AES, 5=256-bit AES */
  version?: 1 | 2 | 4 | 5;
}

/**
 * Opções para carregar PDFs criptografados.
 */
export interface DecryptionOptions {
  /** Senha para abrir o documento */
  password?: string;
}

// Constantes da especificação PDF
const PADDING = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff,
  0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c,
  0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

/**
 * Converte permissões em flags de bits conforme especificação PDF.
 */
function permissionsToFlags(permissions: PDFPermissions = {}): number {
  let flags = 0xfffff0c0; // Bits 1-2 devem ser 0, bits 7-8, 13-32 devem ser 1

  if (permissions.printing) flags |= 0x0004;
  if (permissions.modifying) flags |= 0x0008;
  if (permissions.copying) flags |= 0x0010;
  if (permissions.annotating) flags |= 0x0020;
  if (permissions.fillingForms) flags |= 0x0100;
  if (permissions.contentAccessibility) flags |= 0x0200;
  if (permissions.documentAssembly) flags |= 0x0400;
  if (permissions.printingHighQuality) flags |= 0x0800;

  return flags;
}

/**
 * Converte flags de bits em objeto de permissões.
 */
function flagsToPermissions(flags: number): PDFPermissions {
  return {
    printing: (flags & 0x0004) !== 0,
    modifying: (flags & 0x0008) !== 0,
    copying: (flags & 0x0010) !== 0,
    annotating: (flags & 0x0020) !== 0,
    fillingForms: (flags & 0x0100) !== 0,
    contentAccessibility: (flags & 0x0200) !== 0,
    documentAssembly: (flags & 0x0400) !== 0,
    printingHighQuality: (flags & 0x0800) !== 0,
  };
}

/**
 * Classe principal de segurança PDF.
 */
export class PDFSecurity {
  private encryptionKey: Uint8Array | null = null;
  private version: number;
  private revision: number;
  private keyLength: number;
  private permissions: number;
  private useAES: boolean;
  private ownerKey: Uint8Array | null = null;
  private userKey: Uint8Array | null = null;
  private documentId: Uint8Array;

  constructor(
    private context: PDFContext,
    documentId?: Uint8Array,
  ) {
    this.version = 0;
    this.revision = 0;
    this.keyLength = 0;
    this.permissions = 0;
    this.useAES = false;
    this.documentId = documentId || this.generateDocumentId();
  }

  /**
   * Gera um ID de documento único.
   */
  private generateDocumentId(): Uint8Array {
    const data = new Uint8Array(32);
    const timestamp = Date.now();
    const random = Math.random() * 0xffffffff;

    const view = new DataView(data.buffer);
    view.setFloat64(0, timestamp);
    view.setFloat64(8, random);
    view.setFloat64(16, Math.random() * 0xffffffff);
    view.setFloat64(24, Math.random() * 0xffffffff);

    return md5(data);
  }

  /**
   * Prepara a senha com padding conforme especificação PDF.
   */
  private padPassword(password: string): Uint8Array {
    const bytes = new TextEncoder().encode(password);
    const padded = new Uint8Array(32);

    const copyLength = Math.min(bytes.length, 32);
    padded.set(bytes.slice(0, copyLength));

    if (copyLength < 32) {
      padded.set(PADDING.slice(0, 32 - copyLength), copyLength);
    }

    return padded;
  }

  /**
   * Computa o valor O (owner key) para criptografia.
   */
  private computeOwnerKey(
    ownerPassword: string,
    userPassword: string,
  ): Uint8Array {
    const ownerPadded = this.padPassword(ownerPassword);
    let hash = md5(ownerPadded);

    if (this.revision >= 3) {
      for (let i = 0; i < 50; i++) {
        hash = md5(hash);
      }
    }

    const keyLength = this.keyLength / 8;
    const key = hash.slice(0, keyLength);

    const userPadded = this.padPassword(userPassword);

    if (this.revision === 2) {
      return rc4Encrypt(key, userPadded);
    } else {
      let result = rc4Encrypt(key, userPadded);
      for (let i = 1; i <= 19; i++) {
        const tempKey = new Uint8Array(keyLength);
        for (let j = 0; j < keyLength; j++) {
          tempKey[j] = key[j] ^ i;
        }
        result = rc4Encrypt(tempKey, result);
      }
      return result;
    }
  }

  /**
   * Computa a chave de criptografia do documento.
   */
  private computeEncryptionKey(password: string): Uint8Array {
    const paddedPassword = this.padPassword(password);

    const permBytes = new Uint8Array(4);
    const view = new DataView(permBytes.buffer);
    view.setInt32(0, this.permissions, true);

    let hash: Uint8Array;
    if (this.revision === 2) {
      hash = md5Combined(
        paddedPassword,
        this.ownerKey!,
        permBytes,
        this.documentId,
      );
    } else {
      const encryptMetadata = true; // Pode ser configurável
      const metadataPad = encryptMetadata
        ? new Uint8Array(0)
        : new Uint8Array([0xff, 0xff, 0xff, 0xff]);

      hash = md5Combined(
        paddedPassword,
        this.ownerKey!,
        permBytes,
        this.documentId,
        metadataPad,
      );

      if (this.revision >= 3) {
        const keyLength = this.keyLength / 8;
        for (let i = 0; i < 50; i++) {
          hash = md5(hash.slice(0, keyLength));
        }
      }
    }

    return hash.slice(0, this.keyLength / 8);
  }

  /**
   * Computa o valor U (user key) para criptografia.
   */
  private computeUserKey(): Uint8Array {
    if (this.revision === 2) {
      return rc4Encrypt(this.encryptionKey!, new Uint8Array(PADDING));
    } else {
      const hash = md5Combined(new Uint8Array(PADDING), this.documentId);
      let result = rc4Encrypt(this.encryptionKey!, hash);

      for (let i = 1; i <= 19; i++) {
        const tempKey = new Uint8Array(this.encryptionKey!.length);
        for (let j = 0; j < this.encryptionKey!.length; j++) {
          tempKey[j] = this.encryptionKey![j] ^ i;
        }
        result = rc4Encrypt(tempKey, result);
      }

      // Preenche com bytes aleatórios até 32 bytes
      const userKey = new Uint8Array(32);
      userKey.set(result);
      for (let i = result.length; i < 32; i++) {
        userKey[i] = Math.floor(Math.random() * 256);
      }

      return userKey;
    }
  }

  /**
   * Verifica se uma senha está correta.
   */
  private verifyPassword(password: string): boolean {
    const key = this.computeEncryptionKey(password);
    const computedUser = this.computeUserKeyForVerification(key);

    if (this.revision === 2) {
      return this.arraysEqual(computedUser, this.userKey!);
    } else {
      // Para rev 3+, apenas os primeiros 16 bytes precisam coincidir
      return this.arraysEqual(computedUser.slice(0, 16), this.userKey!.slice(0, 16));
    }
  }

  private computeUserKeyForVerification(key: Uint8Array): Uint8Array {
    if (this.revision === 2) {
      return rc4Encrypt(key, new Uint8Array(PADDING));
    } else {
      const hash = md5Combined(new Uint8Array(PADDING), this.documentId);
      let result = rc4Encrypt(key, hash);

      for (let i = 1; i <= 19; i++) {
        const tempKey = new Uint8Array(key.length);
        for (let j = 0; j < key.length; j++) {
          tempKey[j] = key[j] ^ i;
        }
        result = rc4Encrypt(tempKey, result);
      }

      return result;
    }
  }

  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Configura a criptografia para um novo documento.
   */
  setupEncryption(options: EncryptionOptions): void {
    const version = options.version || 4;

    switch (version) {
      case 1:
        this.version = 1;
        this.revision = 2;
        this.keyLength = 40;
        this.useAES = false;
        break;
      case 2:
        this.version = 2;
        this.revision = 3;
        this.keyLength = 128;
        this.useAES = false;
        break;
      case 4:
        this.version = 4;
        this.revision = 4;
        this.keyLength = 128;
        this.useAES = true;
        break;
      case 5:
        this.version = 5;
        this.revision = 6;
        this.keyLength = 256;
        this.useAES = true;
        break;
      default:
        throw new Error(`Versão de criptografia não suportada: ${version}`);
    }

    const userPassword = options.userPassword || '';
    const ownerPassword = options.ownerPassword;

    this.permissions = permissionsToFlags(options.permissions);
    this.ownerKey = this.computeOwnerKey(ownerPassword, userPassword);
    this.encryptionKey = this.computeEncryptionKey(userPassword);
    this.userKey = this.computeUserKey();
  }

  /**
   * Carrega configurações de criptografia de um dicionário Encrypt existente.
   */
  loadFromEncryptDict(encryptDict: PDFDict, password: string = ''): boolean {
    const filter = encryptDict.get(PDFName.of('Filter'));
    if (!(filter instanceof PDFName) || filter.asString() !== '/Standard') {
      throw new Error('Apenas o filtro Standard é suportado');
    }

    const versionObj = encryptDict.get(PDFName.of('V'));
    this.version = versionObj instanceof PDFNumber ? versionObj.asNumber() : 0;

    const revisionObj = encryptDict.get(PDFName.of('R'));
    this.revision = revisionObj instanceof PDFNumber ? revisionObj.asNumber() : 0;

    const lengthObj = encryptDict.get(PDFName.of('Length'));
    this.keyLength = lengthObj instanceof PDFNumber ? lengthObj.asNumber() : 40;

    const permObj = encryptDict.get(PDFName.of('P'));
    this.permissions = permObj instanceof PDFNumber ? permObj.asNumber() : 0;

    // Detecta se usa AES
    this.useAES = this.version >= 4;

    // Extrai O e U
    const oObj = encryptDict.get(PDFName.of('O'));
    if (oObj instanceof PDFString || oObj instanceof PDFHexString) {
      this.ownerKey = this.extractBytes(oObj);
    }

    const uObj = encryptDict.get(PDFName.of('U'));
    if (uObj instanceof PDFString || uObj instanceof PDFHexString) {
      this.userKey = this.extractBytes(uObj);
    }

    // Extrai ID do documento
    const idArray = this.context.trailerInfo.ID;
    if (idArray instanceof PDFArray && idArray.size() > 0) {
      const firstId = idArray.get(0);
      if (firstId instanceof PDFString || firstId instanceof PDFHexString) {
        this.documentId = this.extractBytes(firstId);
      }
    }

    // Tenta a senha vazia primeiro, depois a fornecida
    if (this.verifyPassword('')) {
      this.encryptionKey = this.computeEncryptionKey('');
      return true;
    }

    if (password && this.verifyPassword(password)) {
      this.encryptionKey = this.computeEncryptionKey(password);
      return true;
    }

    // Tenta como senha de proprietário
    if (password) {
      const userFromOwner = this.recoverUserPasswordFromOwner(password);
      if (userFromOwner !== null && this.verifyPassword(userFromOwner)) {
        this.encryptionKey = this.computeEncryptionKey(userFromOwner);
        return true;
      }
    }

    return false;
  }

  private extractBytes(obj: PDFString | PDFHexString): Uint8Array {
    return obj.asBytes();
  }

  private recoverUserPasswordFromOwner(ownerPassword: string): string | null {
    const ownerPadded = this.padPassword(ownerPassword);
    let hash = md5(ownerPadded);

    if (this.revision >= 3) {
      for (let i = 0; i < 50; i++) {
        hash = md5(hash);
      }
    }

    const keyLength = this.keyLength / 8;
    const key = hash.slice(0, keyLength);

    let result: Uint8Array = Uint8Array.from(this.ownerKey!);

    if (this.revision === 2) {
      result = Uint8Array.from(rc4Encrypt(key, result));
    } else {
      for (let i = 19; i >= 0; i--) {
        const tempKey = new Uint8Array(keyLength);
        for (let j = 0; j < keyLength; j++) {
          tempKey[j] = key[j] ^ i;
        }
        result = Uint8Array.from(rc4Encrypt(tempKey, result));
      }
    }

    // Remove padding e retorna
    let end = 32;
    for (let i = 0; i < 32; i++) {
      if (result[i] === PADDING[0] && this.isPadding(result, i)) {
        end = i;
        break;
      }
    }

    return new TextDecoder().decode(result.slice(0, end));
  }

  private isPadding(arr: Uint8Array, start: number): boolean {
    for (let i = 0; i < 32 - start && start + i < arr.length; i++) {
      if (arr[start + i] !== PADDING[i]) return false;
    }
    return true;
  }

  /**
   * Cria o dicionário Encrypt para o documento.
   */
  createEncryptDict(): PDFDict {
    const dict = PDFDict.withContext(this.context);

    dict.set(PDFName.of('Filter'), PDFName.of('Standard'));
    dict.set(PDFName.of('V'), PDFNumber.of(this.version));
    dict.set(PDFName.of('R'), PDFNumber.of(this.revision));
    dict.set(PDFName.of('Length'), PDFNumber.of(this.keyLength));
    dict.set(PDFName.of('P'), PDFNumber.of(this.permissions));
    dict.set(PDFName.of('O'), PDFHexString.fromBytes(this.ownerKey!));
    dict.set(PDFName.of('U'), PDFHexString.fromBytes(this.userKey!));

    if (this.version >= 4) {
      // Adiciona informações de cipher para AES
      const cf = PDFDict.withContext(this.context);
      const stdCF = PDFDict.withContext(this.context);
      stdCF.set(PDFName.of('CFM'), PDFName.of('AESV2'));
      stdCF.set(PDFName.of('AuthEvent'), PDFName.of('DocOpen'));
      stdCF.set(PDFName.of('Length'), PDFNumber.of(16));
      cf.set(PDFName.of('StdCF'), stdCF);

      dict.set(PDFName.of('CF'), cf);
      dict.set(PDFName.of('StmF'), PDFName.of('StdCF'));
      dict.set(PDFName.of('StrF'), PDFName.of('StdCF'));
    }

    return dict;
  }

  /**
   * Computa a chave para um objeto específico.
   */
  computeObjectKey(ref: PDFRef): Uint8Array {
    if (!this.encryptionKey) {
      throw new Error('Criptografia não configurada');
    }

    if (this.version === 5) {
      // AES-256 usa a chave diretamente
      return this.encryptionKey;
    }

    const objectNumber = ref.objectNumber;
    const generationNumber = ref.generationNumber;

    // Cria a chave do objeto
    const objKeyData = new Uint8Array(this.encryptionKey.length + 5);
    objKeyData.set(this.encryptionKey);

    const offset = this.encryptionKey.length;
    objKeyData[offset] = objectNumber & 0xff;
    objKeyData[offset + 1] = (objectNumber >> 8) & 0xff;
    objKeyData[offset + 2] = (objectNumber >> 16) & 0xff;
    objKeyData[offset + 3] = generationNumber & 0xff;
    objKeyData[offset + 4] = (generationNumber >> 8) & 0xff;

    let hash: Uint8Array;
    if (this.useAES) {
      // Para AES, adiciona "sAlT"
      const withSalt = new Uint8Array(objKeyData.length + 4);
      withSalt.set(objKeyData);
      withSalt[objKeyData.length] = 0x73; // 's'
      withSalt[objKeyData.length + 1] = 0x41; // 'A'
      withSalt[objKeyData.length + 2] = 0x6c; // 'l'
      withSalt[objKeyData.length + 3] = 0x54; // 'T'
      hash = md5(withSalt);
    } else {
      hash = md5(objKeyData);
    }

    // Limita a chave a no máximo 16 bytes
    const keyLength = Math.min(this.encryptionKey.length + 5, 16);
    return hash.slice(0, keyLength);
  }

  /**
   * Encripta dados de um objeto.
   */
  encryptData(ref: PDFRef, data: Uint8Array): Uint8Array {
    const objectKey = this.computeObjectKey(ref);

    if (this.useAES) {
      return aesCbcEncrypt(objectKey, data);
    } else {
      return rc4Encrypt(objectKey, data);
    }
  }

  /**
   * Decripta dados de um objeto.
   */
  decryptData(ref: PDFRef, data: Uint8Array): Uint8Array {
    const objectKey = this.computeObjectKey(ref);

    if (this.useAES) {
      return aesCbcDecrypt(objectKey, data);
    } else {
      return rc4Encrypt(objectKey, data); // RC4 é simétrico
    }
  }

  /**
   * Encripta uma string.
   */
  encryptString(ref: PDFRef, str: Uint8Array): Uint8Array {
    return this.encryptData(ref, str);
  }

  /**
   * Decripta uma string.
   */
  decryptString(ref: PDFRef, str: Uint8Array): Uint8Array {
    return this.decryptData(ref, str);
  }

  /**
   * Encripta um stream.
   */
  encryptStream(ref: PDFRef, data: Uint8Array): Uint8Array {
    return this.encryptData(ref, data);
  }

  /**
   * Decripta um stream.
   */
  decryptStream(ref: PDFRef, data: Uint8Array): Uint8Array {
    return this.decryptData(ref, data);
  }

  /**
   * Retorna o ID do documento.
   */
  getDocumentId(): Uint8Array {
    return this.documentId;
  }

  /**
   * Retorna as permissões do documento.
   */
  getPermissions(): PDFPermissions {
    return flagsToPermissions(this.permissions);
  }

  /**
   * Verifica se a criptografia está configurada.
   */
  isEncrypted(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Retorna a versão da criptografia.
   */
  getVersion(): number {
    return this.version;
  }

  /**
   * Retorna se usa AES.
   */
  usesAES(): boolean {
    return this.useAES;
  }
}

export default PDFSecurity;
