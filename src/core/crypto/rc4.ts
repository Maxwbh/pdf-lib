/**
 * Implementação do algoritmo RC4 para criptografia PDF.
 * RC4 é usado nas versões de criptografia PDF 1-4 (40-128 bits).
 */

/**
 * Classe que implementa o algoritmo de criptografia RC4.
 */
export class RC4 {
  private S: Uint8Array;
  private i: number;
  private j: number;

  /**
   * Cria uma nova instância de RC4 com a chave especificada.
   * @param key A chave de criptografia (1-256 bytes)
   */
  constructor(key: Uint8Array) {
    this.S = new Uint8Array(256);
    this.i = 0;
    this.j = 0;

    // Inicialização KSA (Key-Scheduling Algorithm)
    for (let i = 0; i < 256; i++) {
      this.S[i] = i;
    }

    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.S[i] + key[i % key.length]) & 0xff;
      [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
    }
  }

  /**
   * Gera o próximo byte do keystream.
   */
  private nextByte(): number {
    this.i = (this.i + 1) & 0xff;
    this.j = (this.j + this.S[this.i]) & 0xff;
    [this.S[this.i], this.S[this.j]] = [this.S[this.j], this.S[this.i]];
    return this.S[(this.S[this.i] + this.S[this.j]) & 0xff];
  }

  /**
   * Encripta ou decripta dados usando RC4.
   * RC4 é simétrico, então a mesma operação serve para ambos.
   * @param data Os dados a serem processados
   * @returns Os dados processados
   */
  encrypt(data: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ this.nextByte();
    }
    return result;
  }

  /**
   * Alias para encrypt (RC4 é simétrico).
   */
  decrypt(data: Uint8Array): Uint8Array {
    return this.encrypt(data);
  }
}

/**
 * Encripta dados usando RC4 com a chave especificada.
 * @param key A chave de criptografia
 * @param data Os dados a serem encriptados
 * @returns Os dados encriptados
 */
export function rc4Encrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  const cipher = new RC4(key);
  return cipher.encrypt(data);
}

/**
 * Decripta dados usando RC4 com a chave especificada.
 * @param key A chave de decriptação
 * @param data Os dados a serem decriptados
 * @returns Os dados decriptados
 */
export function rc4Decrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  return rc4Encrypt(key, data);
}
