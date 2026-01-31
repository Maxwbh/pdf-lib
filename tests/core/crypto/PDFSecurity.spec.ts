import { md5 } from 'src/core/crypto/md5';
import { rc4Encrypt } from 'src/core/crypto/rc4';
import { AES, aesCbcEncrypt, aesCbcDecrypt } from 'src/core/crypto/aes';
import { PDFSecurity } from 'src/core/crypto/PDFSecurity';
import PDFContext from 'src/core/PDFContext';

describe('md5', () => {
  it('computa hash MD5 corretamente para string vazia', () => {
    const result = md5(new Uint8Array(0));
    expect(result.length).toBe(16);
  });

  it('computa hash MD5 corretamente para dados conhecidos', () => {
    const input = new TextEncoder().encode('hello');
    const result = md5(input);
    expect(result.length).toBe(16);
    // MD5 de "hello" = 5d41402abc4b2a76b9719d911017c592
    const expected = new Uint8Array([
      0x5d, 0x41, 0x40, 0x2a, 0xbc, 0x4b, 0x2a, 0x76, 0xb9, 0x71, 0x9d, 0x91,
      0x10, 0x17, 0xc5, 0x92,
    ]);
    expect(Array.from(result)).toEqual(Array.from(expected));
  });
});

describe('RC4', () => {
  it('encripta e decripta dados corretamente', () => {
    const key = new TextEncoder().encode('secret');
    const data = new TextEncoder().encode('Hello, World!');

    const encrypted = rc4Encrypt(key, data);
    expect(encrypted).not.toEqual(data);

    // RC4 é simétrico
    const decrypted = rc4Encrypt(key, encrypted);
    expect(Array.from(decrypted)).toEqual(Array.from(data));
  });

  it('produz saída diferente para chaves diferentes', () => {
    const data = new TextEncoder().encode('Hello, World!');
    const key1 = new TextEncoder().encode('key1');
    const key2 = new TextEncoder().encode('key2');

    const encrypted1 = rc4Encrypt(key1, data);
    const encrypted2 = rc4Encrypt(key2, data);

    expect(Array.from(encrypted1)).not.toEqual(Array.from(encrypted2));
  });
});

describe('AES', () => {
  it('encripta e decripta um bloco corretamente', () => {
    const key = new Uint8Array(16); // AES-128
    for (let i = 0; i < 16; i++) key[i] = i;

    const aes = new AES(key);
    const block = new Uint8Array(16);
    for (let i = 0; i < 16; i++) block[i] = i * 2;

    const encrypted = aes.encryptBlock(block);
    const decrypted = aes.decryptBlock(encrypted);

    expect(Array.from(decrypted)).toEqual(Array.from(block));
  });

  it('encripta e decripta com AES-CBC corretamente', () => {
    const key = new Uint8Array(16);
    for (let i = 0; i < 16; i++) key[i] = i;

    const data = new TextEncoder().encode('Hello, World! This is a test.');
    const iv = new Uint8Array(16);
    for (let i = 0; i < 16; i++) iv[i] = 0xff - i;

    const encrypted = aesCbcEncrypt(key, data, iv);
    expect(encrypted.length).toBeGreaterThan(data.length);

    const decrypted = aesCbcDecrypt(key, encrypted);
    expect(Array.from(decrypted)).toEqual(Array.from(data));
  });

  it('suporta chaves de 256 bits', () => {
    const key = new Uint8Array(32); // AES-256
    for (let i = 0; i < 32; i++) key[i] = i;

    const data = new TextEncoder().encode('Test data for AES-256');
    const encrypted = aesCbcEncrypt(key, data);
    const decrypted = aesCbcDecrypt(key, encrypted);

    expect(Array.from(decrypted)).toEqual(Array.from(data));
  });
});

describe('PDFSecurity', () => {
  it('configura criptografia RC4 de 40 bits', () => {
    const context = PDFContext.create();
    const security = new PDFSecurity(context);

    security.setupEncryption({
      ownerPassword: 'owner123',
      userPassword: 'user123',
      version: 1,
    });

    expect(security.isEncrypted()).toBe(true);
    expect(security.getVersion()).toBe(1);
    expect(security.usesAES()).toBe(false);
  });

  it('configura criptografia RC4 de 128 bits', () => {
    const context = PDFContext.create();
    const security = new PDFSecurity(context);

    security.setupEncryption({
      ownerPassword: 'owner123',
      userPassword: 'user123',
      version: 2,
    });

    expect(security.isEncrypted()).toBe(true);
    expect(security.getVersion()).toBe(2);
    expect(security.usesAES()).toBe(false);
  });

  it('configura criptografia AES de 128 bits', () => {
    const context = PDFContext.create();
    const security = new PDFSecurity(context);

    security.setupEncryption({
      ownerPassword: 'owner123',
      userPassword: 'user123',
      version: 4,
    });

    expect(security.isEncrypted()).toBe(true);
    expect(security.getVersion()).toBe(4);
    expect(security.usesAES()).toBe(true);
  });

  it('configura permissões corretamente', () => {
    const context = PDFContext.create();
    const security = new PDFSecurity(context);

    security.setupEncryption({
      ownerPassword: 'owner123',
      permissions: {
        printing: true,
        copying: false,
        modifying: false,
        annotating: true,
      },
      version: 4,
    });

    const perms = security.getPermissions();
    expect(perms.printing).toBe(true);
    expect(perms.copying).toBe(false);
    expect(perms.modifying).toBe(false);
    expect(perms.annotating).toBe(true);
  });

  it('cria dicionário Encrypt válido', () => {
    const context = PDFContext.create();
    const security = new PDFSecurity(context);

    security.setupEncryption({
      ownerPassword: 'owner123',
      version: 4,
    });

    const encryptDict = security.createEncryptDict();
    expect(encryptDict).toBeDefined();
  });

  it('gera ID de documento único', () => {
    const context1 = PDFContext.create();
    const security1 = new PDFSecurity(context1);
    const id1 = security1.getDocumentId();

    const context2 = PDFContext.create();
    const security2 = new PDFSecurity(context2);
    const id2 = security2.getDocumentId();

    // IDs devem ser diferentes
    expect(Array.from(id1)).not.toEqual(Array.from(id2));
  });
});
