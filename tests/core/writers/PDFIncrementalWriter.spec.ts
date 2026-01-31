import PDFIncrementalWriter, {
  createDocumentSnapshot,
  markRefAsModified,
} from 'src/core/writers/PDFIncrementalWriter';
import PDFContext from 'src/core/PDFContext';
import PDFRef from 'src/core/objects/PDFRef';

describe('createDocumentSnapshot', () => {
  it('cria snapshot com bytes originais', () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
    const snapshot = createDocumentSnapshot(bytes);

    expect(snapshot.originalBytes).toBe(bytes);
    expect(snapshot.originalSize).toBe(bytes.length);
    expect(snapshot.modifiedRefs.size).toBe(0);
    expect(snapshot.timestamp).toBeGreaterThan(0);
  });

  it('detecta offset de xref em PDF simples', () => {
    // PDF mínimo simulado com startxref
    const pdfContent = `%PDF-1.4
1 0 obj
<<>>
endobj
xref
0 2
startxref
42
%%EOF`;
    const bytes = new TextEncoder().encode(pdfContent);
    const snapshot = createDocumentSnapshot(bytes);

    expect(snapshot.previousXRefOffset).toBe(42);
  });
});

describe('markRefAsModified', () => {
  it('marca referência como modificada', () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const snapshot = createDocumentSnapshot(bytes);

    const ref = PDFRef.of(1, 0);
    markRefAsModified(snapshot, ref);

    expect(snapshot.modifiedRefs.has('1-0')).toBe(true);
  });

  it('permite marcar múltiplas referências', () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const snapshot = createDocumentSnapshot(bytes);

    markRefAsModified(snapshot, PDFRef.of(1, 0));
    markRefAsModified(snapshot, PDFRef.of(2, 0));
    markRefAsModified(snapshot, PDFRef.of(5, 0));

    expect(snapshot.modifiedRefs.size).toBe(3);
    expect(snapshot.modifiedRefs.has('1-0')).toBe(true);
    expect(snapshot.modifiedRefs.has('2-0')).toBe(true);
    expect(snapshot.modifiedRefs.has('5-0')).toBe(true);
  });

  it('não duplica referências já marcadas', () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const snapshot = createDocumentSnapshot(bytes);

    const ref = PDFRef.of(1, 0);
    markRefAsModified(snapshot, ref);
    markRefAsModified(snapshot, ref);
    markRefAsModified(snapshot, ref);

    expect(snapshot.modifiedRefs.size).toBe(1);
  });
});

describe('PDFIncrementalWriter', () => {
  it('serializa modificações incrementais', async () => {
    const context = PDFContext.create();

    // Adiciona um objeto ao contexto
    const dict = context.obj({ Test: 'Value' });
    const ref = context.register(dict);

    // Cria bytes originais simulados
    const originalPdf = `%PDF-1.4
1 0 obj
<<>>
endobj
xref
0 2
0000000000 65535 f
0000000009 00000 n
trailer
<<
/Size 2
/Root 1 0 R
>>
startxref
42
%%EOF`;
    const originalBytes = new TextEncoder().encode(originalPdf);

    const snapshot = createDocumentSnapshot(originalBytes);
    markRefAsModified(snapshot, ref);

    const writer = PDFIncrementalWriter.forContext(context, snapshot, 50);
    const result = await writer.serializeToBuffer();

    // Verifica que o resultado contém os bytes originais
    expect(result.length).toBeGreaterThan(originalBytes.length);

    // Verifica que começa com os bytes originais
    for (let i = 0; i < originalBytes.length; i++) {
      expect(result[i]).toBe(originalBytes[i]);
    }
  });
});
