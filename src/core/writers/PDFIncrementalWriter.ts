/**
 * Escritor incremental para PDFs.
 * Permite adicionar modificações ao final de um PDF existente
 * sem reescrever todo o documento, preservando assinaturas digitais.
 */

import PDFCrossRefSection from 'src/core/document/PDFCrossRefSection';
import PDFTrailer from 'src/core/document/PDFTrailer';
import PDFTrailerDict from 'src/core/document/PDFTrailerDict';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFObjectStream from 'src/core/structures/PDFObjectStream';
import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer, waitForTick } from 'src/utils';

/**
 * Informações de serialização incremental.
 */
export interface IncrementalSerializationInfo {
  size: number;
  indirectObjects: [PDFRef, PDFObject][];
  xref: PDFCrossRefSection;
  trailerDict: PDFTrailerDict;
  trailer: PDFTrailer;
}

/**
 * Snapshot do documento para salvamento incremental.
 */
export interface DocumentSnapshot {
  /** Bytes originais do documento */
  originalBytes: Uint8Array;
  /** Tamanho do documento original (offset para xref) */
  originalSize: number;
  /** Offset do último xref no documento original */
  previousXRefOffset: number;
  /** Referências de objetos modificados */
  modifiedRefs: Set<string>;
  /** Marca temporal do snapshot */
  timestamp: number;
}

/**
 * Classe para gerenciar salvamentos incrementais de PDFs.
 */
class PDFIncrementalWriter {
  static forContext = (
    context: PDFContext,
    snapshot: DocumentSnapshot,
    objectsPerTick: number,
  ) => new PDFIncrementalWriter(context, snapshot, objectsPerTick);

  private readonly context: PDFContext;
  private readonly snapshot: DocumentSnapshot;
  private readonly objectsPerTick: number;
  private parsedObjects = 0;

  private constructor(
    context: PDFContext,
    snapshot: DocumentSnapshot,
    objectsPerTick: number,
  ) {
    this.context = context;
    this.snapshot = snapshot;
    this.objectsPerTick = objectsPerTick;
  }

  /**
   * Serializa as mudanças incrementais para um buffer.
   */
  async serializeToBuffer(): Promise<Uint8Array> {
    const { size, indirectObjects, xref, trailerDict, trailer } =
      await this.computeBufferSize();

    // Cria o buffer final: original + incremental
    const totalSize = this.snapshot.originalSize + size;
    const buffer = new Uint8Array(totalSize);

    // Copia o documento original
    buffer.set(this.snapshot.originalBytes.slice(0, this.snapshot.originalSize));

    // Escreve a atualização incremental
    let offset = this.snapshot.originalSize;

    // Newlines antes dos objetos
    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.Newline;

    // Escreve os objetos modificados
    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const [ref, object] = indirectObjects[idx];

      const objectNumber = String(ref.objectNumber);
      offset += copyStringIntoBuffer(objectNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      const generationNumber = String(ref.generationNumber);
      offset += copyStringIntoBuffer(generationNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      buffer[offset++] = CharCodes.o;
      buffer[offset++] = CharCodes.b;
      buffer[offset++] = CharCodes.j;
      buffer[offset++] = CharCodes.Newline;

      offset += object.copyBytesInto(buffer, offset);

      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.e;
      buffer[offset++] = CharCodes.n;
      buffer[offset++] = CharCodes.d;
      buffer[offset++] = CharCodes.o;
      buffer[offset++] = CharCodes.b;
      buffer[offset++] = CharCodes.j;
      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.Newline;

      const n =
        object instanceof PDFObjectStream ? object.getObjectsCount() : 1;
      if (this.shouldWaitForTick(n)) await waitForTick();
    }

    // Escreve xref
    offset += xref.copyBytesInto(buffer, offset);
    buffer[offset++] = CharCodes.Newline;

    // Escreve trailer dict
    offset += trailerDict.copyBytesInto(buffer, offset);
    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.Newline;

    // Escreve trailer
    offset += trailer.copyBytesInto(buffer, offset);

    return buffer;
  }

  /**
   * Calcula o tamanho do buffer incremental.
   */
  private async computeBufferSize(): Promise<IncrementalSerializationInfo> {
    // Offset inicial é o tamanho do documento original + 2 newlines
    let size = 2;

    const xref = PDFCrossRefSection.create();

    // Pega apenas os objetos modificados
    const allObjects = this.context.enumerateIndirectObjects();
    const modifiedObjects: [PDFRef, PDFObject][] = [];

    for (const [ref, obj] of allObjects) {
      const refKey = `${ref.objectNumber}-${ref.generationNumber}`;
      if (this.snapshot.modifiedRefs.has(refKey)) {
        modifiedObjects.push([ref, obj]);
      }
    }

    // Calcula tamanhos e offsets
    for (let idx = 0, len = modifiedObjects.length; idx < len; idx++) {
      const indirectObject = modifiedObjects[idx];
      const [ref] = indirectObject;

      // Offset real = original size + incremental offset
      xref.addEntry(ref, this.snapshot.originalSize + size);
      size += this.computeIndirectObjectSize(indirectObject);

      if (this.shouldWaitForTick(1)) await waitForTick();
    }

    const xrefOffset = this.snapshot.originalSize + size;
    size += xref.sizeInBytes() + 1; // '\n'

    const trailerDict = PDFTrailerDict.of(this.createTrailerDict());
    size += trailerDict.sizeInBytes() + 2; // '\n\n'

    const trailer = PDFTrailer.forLastCrossRefSectionOffset(xrefOffset);
    size += trailer.sizeInBytes();

    return {
      size,
      indirectObjects: modifiedObjects,
      xref,
      trailerDict,
      trailer,
    };
  }

  /**
   * Cria o dicionário trailer para atualização incremental.
   */
  private createTrailerDict(): PDFDict {
    const dict = this.context.obj({
      Size: this.context.largestObjectNumber + 1,
      Root: this.context.trailerInfo.Root,
      Encrypt: this.context.trailerInfo.Encrypt,
      Info: this.context.trailerInfo.Info,
      ID: this.context.trailerInfo.ID,
    });

    // Adiciona referência ao xref anterior (Prev)
    dict.set(
      PDFName.of('Prev'),
      PDFNumber.of(this.snapshot.previousXRefOffset),
    );

    return dict;
  }

  /**
   * Calcula o tamanho de um objeto indireto.
   */
  private computeIndirectObjectSize([ref, object]: [
    PDFRef,
    PDFObject,
  ]): number {
    const refSize = ref.sizeInBytes() + 3; // 'R' -> 'obj\n'
    const objectSize = object.sizeInBytes() + 9; // '\nendobj\n\n'
    return refSize + objectSize;
  }

  private shouldWaitForTick = (n: number) => {
    this.parsedObjects += n;
    return this.parsedObjects % this.objectsPerTick === 0;
  };
}

export default PDFIncrementalWriter;

/**
 * Cria um snapshot do documento para salvamento incremental posterior.
 * @param bytes Os bytes originais do documento
 * @returns O snapshot do documento
 */
export function createDocumentSnapshot(bytes: Uint8Array): DocumentSnapshot {
  // Encontra o offset do último xref
  const previousXRefOffset = findLastXRefOffset(bytes);

  return {
    originalBytes: bytes,
    originalSize: bytes.length,
    previousXRefOffset,
    modifiedRefs: new Set(),
    timestamp: Date.now(),
  };
}

/**
 * Encontra o offset do último xref no documento.
 */
function findLastXRefOffset(bytes: Uint8Array): number {
  // Procura "startxref" de trás para frente
  const startxref = new TextEncoder().encode('startxref');
  let pos = bytes.length - 1;

  outer: while (pos >= startxref.length) {
    // Verifica se encontramos "startxref"
    let match = true;
    for (let i = 0; i < startxref.length; i++) {
      if (bytes[pos - startxref.length + 1 + i] !== startxref[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      // Encontrou! Agora lê o número após startxref
      pos += 2; // Pula para depois de "startxref"

      // Pula whitespace
      while (
        pos < bytes.length &&
        (bytes[pos] === 0x20 ||
          bytes[pos] === 0x0a ||
          bytes[pos] === 0x0d ||
          bytes[pos] === 0x09)
      ) {
        pos++;
      }

      // Lê o número
      let numStr = '';
      while (pos < bytes.length && bytes[pos] >= 0x30 && bytes[pos] <= 0x39) {
        numStr += String.fromCharCode(bytes[pos]);
        pos++;
      }

      return parseInt(numStr, 10) || 0;
    }

    pos--;
  }

  return 0;
}

/**
 * Marca uma referência como modificada no snapshot.
 */
export function markRefAsModified(
  snapshot: DocumentSnapshot,
  ref: PDFRef,
): void {
  const refKey = `${ref.objectNumber}-${ref.generationNumber}`;
  snapshot.modifiedRefs.add(refKey);
}
