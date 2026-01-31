/**
 * Implementação do algoritmo AES para criptografia PDF.
 * AES é usado nas versões de criptografia PDF 5+ (128-256 bits).
 * Implementa AES-CBC conforme especificação PDF.
 */

// S-Box para AES
const SBOX = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe,
  0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4,
  0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7,
  0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3,
  0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09,
  0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3,
  0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe,
  0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
  0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92,
  0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c,
  0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19,
  0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
  0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2,
  0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5,
  0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25,
  0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86,
  0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e,
  0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42,
  0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]);

// Inverse S-Box para AES
const INV_SBOX = new Uint8Array([
  0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81,
  0xf3, 0xd7, 0xfb, 0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e,
  0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb, 0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23,
  0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e, 0x08, 0x2e, 0xa1, 0x66,
  0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25, 0x72,
  0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65,
  0xb6, 0x92, 0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46,
  0x57, 0xa7, 0x8d, 0x9d, 0x84, 0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a,
  0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06, 0xd0, 0x2c, 0x1e, 0x8f, 0xca,
  0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b, 0x3a, 0x91,
  0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6,
  0x73, 0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8,
  0x1c, 0x75, 0xdf, 0x6e, 0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f,
  0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b, 0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2,
  0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4, 0x1f, 0xdd, 0xa8,
  0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
  0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93,
  0xc9, 0x9c, 0xef, 0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb,
  0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61, 0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6,
  0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d,
]);

// Round constants
const RCON = new Uint8Array([
  0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36,
]);

function xtime(x: number): number {
  return ((x << 1) ^ (((x >> 7) & 1) * 0x1b)) & 0xff;
}

function multiply(x: number, y: number): number {
  return (
    (((y & 1) * x) ^
      ((y >> 1) & 1) * xtime(x) ^
      ((y >> 2) & 1) * xtime(xtime(x)) ^
      ((y >> 3) & 1) * xtime(xtime(xtime(x))) ^
      ((y >> 4) & 1) * xtime(xtime(xtime(xtime(x))))) &
    0xff
  );
}

/**
 * Classe que implementa o algoritmo de criptografia AES.
 */
export class AES {
  private readonly Nk: number; // Número de palavras de 32 bits na chave
  private readonly Nr: number; // Número de rounds
  private readonly roundKeys: Uint8Array[];

  /**
   * Cria uma nova instância de AES com a chave especificada.
   * @param key A chave de criptografia (16, 24 ou 32 bytes para AES-128, 192, 256)
   */
  constructor(key: Uint8Array) {
    if (key.length !== 16 && key.length !== 24 && key.length !== 32) {
      throw new Error('Chave AES deve ter 16, 24 ou 32 bytes');
    }

    this.Nk = key.length / 4;
    this.Nr = this.Nk + 6;
    this.roundKeys = this.keyExpansion(key);
  }

  private keyExpansion(key: Uint8Array): Uint8Array[] {
    const Nb = 4;
    const totalWords = Nb * (this.Nr + 1);
    const words: number[][] = [];

    // Copia a chave original para as primeiras Nk palavras
    for (let i = 0; i < this.Nk; i++) {
      words[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
    }

    // Expande a chave
    for (let i = this.Nk; i < totalWords; i++) {
      let temp = [...words[i - 1]];

      if (i % this.Nk === 0) {
        // RotWord
        temp = [temp[1], temp[2], temp[3], temp[0]];
        // SubWord
        temp = temp.map((b) => SBOX[b]);
        // XOR com Rcon
        temp[0] ^= RCON[i / this.Nk - 1];
      } else if (this.Nk > 6 && i % this.Nk === 4) {
        temp = temp.map((b) => SBOX[b]);
      }

      words[i] = words[i - this.Nk].map((b, j) => b ^ temp[j]);
    }

    // Converte palavras em round keys
    const roundKeys: Uint8Array[] = [];
    for (let round = 0; round <= this.Nr; round++) {
      const key = new Uint8Array(16);
      for (let i = 0; i < 4; i++) {
        const word = words[round * 4 + i];
        key[i * 4] = word[0];
        key[i * 4 + 1] = word[1];
        key[i * 4 + 2] = word[2];
        key[i * 4 + 3] = word[3];
      }
      roundKeys.push(key);
    }

    return roundKeys;
  }

  private addRoundKey(state: Uint8Array, roundKey: Uint8Array): void {
    for (let i = 0; i < 16; i++) {
      state[i] ^= roundKey[i];
    }
  }

  private subBytes(state: Uint8Array): void {
    for (let i = 0; i < 16; i++) {
      state[i] = SBOX[state[i]];
    }
  }

  private invSubBytes(state: Uint8Array): void {
    for (let i = 0; i < 16; i++) {
      state[i] = INV_SBOX[state[i]];
    }
  }

  private shiftRows(state: Uint8Array): void {
    // Row 1: shift left by 1
    let temp = state[1];
    state[1] = state[5];
    state[5] = state[9];
    state[9] = state[13];
    state[13] = temp;

    // Row 2: shift left by 2
    temp = state[2];
    state[2] = state[10];
    state[10] = temp;
    temp = state[6];
    state[6] = state[14];
    state[14] = temp;

    // Row 3: shift left by 3 (= right by 1)
    temp = state[15];
    state[15] = state[11];
    state[11] = state[7];
    state[7] = state[3];
    state[3] = temp;
  }

  private invShiftRows(state: Uint8Array): void {
    // Row 1: shift right by 1
    let temp = state[13];
    state[13] = state[9];
    state[9] = state[5];
    state[5] = state[1];
    state[1] = temp;

    // Row 2: shift right by 2
    temp = state[2];
    state[2] = state[10];
    state[10] = temp;
    temp = state[6];
    state[6] = state[14];
    state[14] = temp;

    // Row 3: shift right by 3 (= left by 1)
    temp = state[3];
    state[3] = state[7];
    state[7] = state[11];
    state[11] = state[15];
    state[15] = temp;
  }

  private mixColumns(state: Uint8Array): void {
    for (let c = 0; c < 4; c++) {
      const s0 = state[c * 4];
      const s1 = state[c * 4 + 1];
      const s2 = state[c * 4 + 2];
      const s3 = state[c * 4 + 3];

      state[c * 4] = multiply(s0, 2) ^ multiply(s1, 3) ^ s2 ^ s3;
      state[c * 4 + 1] = s0 ^ multiply(s1, 2) ^ multiply(s2, 3) ^ s3;
      state[c * 4 + 2] = s0 ^ s1 ^ multiply(s2, 2) ^ multiply(s3, 3);
      state[c * 4 + 3] = multiply(s0, 3) ^ s1 ^ s2 ^ multiply(s3, 2);
    }
  }

  private invMixColumns(state: Uint8Array): void {
    for (let c = 0; c < 4; c++) {
      const s0 = state[c * 4];
      const s1 = state[c * 4 + 1];
      const s2 = state[c * 4 + 2];
      const s3 = state[c * 4 + 3];

      state[c * 4] =
        multiply(s0, 0x0e) ^
        multiply(s1, 0x0b) ^
        multiply(s2, 0x0d) ^
        multiply(s3, 0x09);
      state[c * 4 + 1] =
        multiply(s0, 0x09) ^
        multiply(s1, 0x0e) ^
        multiply(s2, 0x0b) ^
        multiply(s3, 0x0d);
      state[c * 4 + 2] =
        multiply(s0, 0x0d) ^
        multiply(s1, 0x09) ^
        multiply(s2, 0x0e) ^
        multiply(s3, 0x0b);
      state[c * 4 + 3] =
        multiply(s0, 0x0b) ^
        multiply(s1, 0x0d) ^
        multiply(s2, 0x09) ^
        multiply(s3, 0x0e);
    }
  }

  /**
   * Encripta um único bloco de 16 bytes.
   */
  encryptBlock(block: Uint8Array): Uint8Array {
    const state = new Uint8Array(block);

    this.addRoundKey(state, this.roundKeys[0]);

    for (let round = 1; round < this.Nr; round++) {
      this.subBytes(state);
      this.shiftRows(state);
      this.mixColumns(state);
      this.addRoundKey(state, this.roundKeys[round]);
    }

    this.subBytes(state);
    this.shiftRows(state);
    this.addRoundKey(state, this.roundKeys[this.Nr]);

    return state;
  }

  /**
   * Decripta um único bloco de 16 bytes.
   */
  decryptBlock(block: Uint8Array): Uint8Array {
    const state = new Uint8Array(block);

    this.addRoundKey(state, this.roundKeys[this.Nr]);

    for (let round = this.Nr - 1; round > 0; round--) {
      this.invShiftRows(state);
      this.invSubBytes(state);
      this.addRoundKey(state, this.roundKeys[round]);
      this.invMixColumns(state);
    }

    this.invShiftRows(state);
    this.invSubBytes(state);
    this.addRoundKey(state, this.roundKeys[0]);

    return state;
  }
}

/**
 * Encripta dados usando AES-CBC.
 * @param key A chave de criptografia
 * @param data Os dados a serem encriptados (serão padded automaticamente)
 * @param iv O vetor de inicialização (16 bytes)
 * @returns Os dados encriptados (IV + ciphertext)
 */
export function aesCbcEncrypt(
  key: Uint8Array,
  data: Uint8Array,
  iv?: Uint8Array,
): Uint8Array {
  const aes = new AES(key);

  // Gera IV se não fornecido
  const actualIv = iv || generateRandomIV();

  // Aplica PKCS#7 padding
  const paddedLength = Math.ceil((data.length + 1) / 16) * 16;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  const paddingValue = paddedLength - data.length;
  for (let i = data.length; i < paddedLength; i++) {
    padded[i] = paddingValue;
  }

  // Encripta em modo CBC
  const result = new Uint8Array(16 + paddedLength);
  result.set(actualIv);

  let previousBlock = actualIv;
  for (let i = 0; i < paddedLength; i += 16) {
    const block = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      block[j] = padded[i + j] ^ previousBlock[j];
    }
    const encrypted = aes.encryptBlock(block);
    result.set(encrypted, 16 + i);
    previousBlock = encrypted;
  }

  return result;
}

/**
 * Decripta dados usando AES-CBC.
 * @param key A chave de decriptação
 * @param data Os dados a serem decriptados (IV + ciphertext)
 * @returns Os dados decriptados (sem padding)
 */
export function aesCbcDecrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  if (data.length < 32 || data.length % 16 !== 0) {
    throw new Error('Dados AES-CBC inválidos');
  }

  const aes = new AES(key);

  // Extrai IV
  const iv = data.slice(0, 16);
  const ciphertext = data.slice(16);

  // Decripta em modo CBC
  const decrypted = new Uint8Array(ciphertext.length);
  let previousBlock = iv;

  for (let i = 0; i < ciphertext.length; i += 16) {
    const block = ciphertext.slice(i, i + 16);
    const decryptedBlock = aes.decryptBlock(block);
    for (let j = 0; j < 16; j++) {
      decrypted[i + j] = decryptedBlock[j] ^ previousBlock[j];
    }
    previousBlock = block;
  }

  // Remove PKCS#7 padding
  const paddingValue = decrypted[decrypted.length - 1];
  if (paddingValue > 16 || paddingValue === 0) {
    throw new Error('Padding AES inválido');
  }

  return decrypted.slice(0, decrypted.length - paddingValue);
}

/**
 * Gera um IV aleatório de 16 bytes.
 */
export function generateRandomIV(): Uint8Array {
  const iv = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(iv);
  } else {
    // Fallback para ambientes sem crypto
    for (let i = 0; i < 16; i++) {
      iv[i] = Math.floor(Math.random() * 256);
    }
  }
  return iv;
}
