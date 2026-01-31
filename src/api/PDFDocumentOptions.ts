import { EmbeddedFileOptions } from 'src/core/embedders/FileEmbedder';
import { TypeFeatures } from 'src/types/fontkit';
import { PDFPermissions } from 'src/core/crypto/PDFSecurity';

export enum ParseSpeeds {
  Fastest = Infinity,
  Fast = 1500,
  Medium = 500,
  Slow = 100,
}

export interface AttachmentOptions extends EmbeddedFileOptions {}

/**
 * Opções de criptografia para salvar PDFs protegidos.
 */
export interface EncryptOptions {
  /** Senha do usuário (permite abrir o documento) */
  userPassword?: string;
  /** Senha do proprietário (permite acesso total) */
  ownerPassword: string;
  /** Permissões do documento */
  permissions?: PDFPermissions;
  /**
   * Versão da criptografia:
   * - 1: 40-bit RC4 (PDF 1.1+)
   * - 2: 128-bit RC4 (PDF 1.4+)
   * - 4: 128-bit AES (PDF 1.5+)
   * - 5: 256-bit AES (PDF 1.7+)
   */
  version?: 1 | 2 | 4 | 5;
}

export interface SaveOptions {
  useObjectStreams?: boolean;
  addDefaultPage?: boolean;
  objectsPerTick?: number;
  updateFieldAppearances?: boolean;
  /** Opções de criptografia para proteger o documento */
  encrypt?: EncryptOptions;
}

/**
 * Opções para salvamento incremental.
 */
export interface IncrementalSaveOptions {
  /** Número de objetos processados por tick */
  objectsPerTick?: number;
  /** Atualiza aparências de campos de formulário */
  updateFieldAppearances?: boolean;
}

export interface Base64SaveOptions extends SaveOptions {
  dataUri?: boolean;
}

export interface LoadOptions {
  ignoreEncryption?: boolean;
  parseSpeed?: ParseSpeeds | number;
  throwOnInvalidObject?: boolean;
  updateMetadata?: boolean;
  capNumbers?: boolean;
  /** Senha para abrir o documento criptografado */
  password?: string;
}

export interface CreateOptions {
  updateMetadata?: boolean;
}

export interface EmbedFontOptions {
  subset?: boolean;
  customName?: string;
  features?: TypeFeatures;
}

export interface SetTitleOptions {
  showInWindowTitleBar: boolean;
}

export { PDFPermissions };
