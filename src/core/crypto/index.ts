/**
 * Módulo de criptografia para pdf-lib.
 * Fornece suporte a criptografia e descriptografia de PDFs.
 */

export { md5, md5Combined } from './md5';
export { RC4, rc4Encrypt, rc4Decrypt } from './rc4';
export { AES, aesCbcEncrypt, aesCbcDecrypt, generateRandomIV } from './aes';
export {
  PDFSecurity,
  PDFPermissions,
  EncryptionOptions,
  DecryptionOptions,
} from './PDFSecurity';
export { default } from './PDFSecurity';
