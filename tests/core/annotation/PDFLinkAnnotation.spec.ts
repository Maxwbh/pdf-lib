import PDFLinkAnnotation from 'src/core/annotation/PDFLinkAnnotation';
import PDFContext from 'src/core/PDFContext';
import PDFName from 'src/core/objects/PDFName';
import PDFRef from 'src/core/objects/PDFRef';
import PDFDict from 'src/core/objects/PDFDict';
import PDFArray from 'src/core/objects/PDFArray';
import PDFString from 'src/core/objects/PDFString';
import { rgb, grayscale, cmyk } from 'src/api/colors';

describe('PDFLinkAnnotation', () => {
  describe('create', () => {
    it('cria uma anotação de link com valores padrão', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      expect(link).toBeInstanceOf(PDFLinkAnnotation);

      const subtype = link.dict.lookup(PDFName.of('Subtype'));
      expect(subtype).toBeInstanceOf(PDFName);
      expect((subtype as PDFName).asString()).toBe('/Link');

      const type = link.dict.lookup(PDFName.of('Type'));
      expect(type).toBeInstanceOf(PDFName);
      expect((type as PDFName).asString()).toBe('/Annot');
    });

    it('define borda como invisível por padrão', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      const border = link.dict.lookup(PDFName.of('Border'));
      expect(border).toBeInstanceOf(PDFArray);
    });
  });

  describe('fromDict', () => {
    it('cria link a partir de dicionário existente', () => {
      const context = PDFContext.create();
      const dict = context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [0, 0, 100, 50],
      });

      const link = PDFLinkAnnotation.fromDict(dict as PDFDict);
      expect(link).toBeInstanceOf(PDFLinkAnnotation);
    });
  });

  describe('setURI / getURI', () => {
    it('define e recupera URL externa', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setURI('https://exemplo.com');
      expect(link.getURI()).toBe('https://exemplo.com');
    });

    it('sobrescreve URL anterior', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setURI('https://primeiro.com');
      link.setURI('https://segundo.com');

      expect(link.getURI()).toBe('https://segundo.com');
    });

    it('retorna undefined para link sem URI', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      expect(link.getURI()).toBeUndefined();
    });

    it('cria ação com tipo URI', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setURI('https://exemplo.com');

      const action = link.dict.lookup(PDFName.of('A')) as PDFDict;
      expect(action).toBeInstanceOf(PDFDict);

      const actionType = action.lookup(PDFName.of('S'));
      expect(actionType).toBeInstanceOf(PDFName);
      expect((actionType as PDFName).asString()).toBe('/URI');
    });
  });

  describe('setDestination / getDestination', () => {
    it('define destino para página interna', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);
      const pageRef = PDFRef.of(5, 0);

      link.setDestination(pageRef, 100, 200, 1.5);

      const dest = link.getDestination();
      expect(dest).toBeInstanceOf(PDFArray);
    });

    it('permite valores nulos para posição e zoom', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);
      const pageRef = PDFRef.of(5, 0);

      link.setDestination(pageRef, null, null, null);

      const dest = link.getDestination();
      expect(dest).toBeDefined();
    });

    it('define destino com apenas referência de página', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);
      const pageRef = PDFRef.of(3, 0);

      link.setDestination(pageRef);

      const dest = link.getDestination();
      expect(dest).toBeDefined();
    });
  });

  describe('setNamedDestination', () => {
    it('define destino nomeado', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setNamedDestination('capitulo-2');

      const dest = link.getDestination();
      expect(dest).toBeInstanceOf(PDFString);
      expect((dest as PDFString).asString()).toBe('capitulo-2');
    });
  });

  describe('setBorder', () => {
    it('define borda com largura', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setBorder({ width: 2 });

      const border = link.dict.lookup(PDFName.of('Border')) as PDFArray;
      expect(border).toBeInstanceOf(PDFArray);
      expect(border.size()).toBe(3);
    });

    it('define borda com cantos arredondados', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setBorder({
        horizontalCornerRadius: 5,
        verticalCornerRadius: 5,
        width: 1,
      });

      const border = link.dict.lookup(PDFName.of('Border')) as PDFArray;
      expect(border.size()).toBe(3);
    });

    it('define borda com padrão tracejado', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setBorder({
        width: 1,
        dashArray: [3, 2],
      });

      const border = link.dict.lookup(PDFName.of('Border')) as PDFArray;
      expect(border.size()).toBe(4); // Inclui dashArray
    });
  });

  describe('removeBorder', () => {
    it('remove borda do link', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setBorder({ width: 5 });
      link.removeBorder();

      const border = link.dict.lookup(PDFName.of('Border')) as PDFArray;
      expect(border.size()).toBe(3);
    });
  });

  describe('setBorderColor / getBorderColor', () => {
    it('define e recupera cor RGB', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setBorderColor(rgb(1, 0, 0));

      const color = link.getBorderColor();
      expect(color).toBeDefined();
      expect(color).toEqual([1, 0, 0]);
    });

    it('define e recupera cor grayscale', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setBorderColor(grayscale(0.5));

      const color = link.getBorderColor();
      expect(color).toBeDefined();
      expect(color).toEqual([0.5]);
    });

    it('define e recupera cor CMYK', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setBorderColor(cmyk(1, 0, 0, 0));

      const color = link.getBorderColor();
      expect(color).toBeDefined();
      expect(color).toEqual([1, 0, 0, 0]);
    });

    it('retorna undefined para link sem cor', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      expect(link.getBorderColor()).toBeUndefined();
    });
  });

  describe('setHighlightMode', () => {
    it('define modo de highlight como invertido', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setHighlightMode('I');

      const mode = link.dict.lookup(PDFName.of('H'));
      expect(mode).toBeInstanceOf(PDFName);
      expect((mode as PDFName).asString()).toBe('/I');
    });

    it('define modo de highlight como nenhum', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setHighlightMode('N');

      const mode = link.dict.lookup(PDFName.of('H'));
      expect((mode as PDFName).asString()).toBe('/N');
    });

    it('define modo de highlight como outline', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setHighlightMode('O');

      const mode = link.dict.lookup(PDFName.of('H'));
      expect((mode as PDFName).asString()).toBe('/O');
    });

    it('define modo de highlight como push', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setHighlightMode('P');

      const mode = link.dict.lookup(PDFName.of('H'));
      expect((mode as PDFName).asString()).toBe('/P');
    });
  });

  describe('setRectangle', () => {
    it('define área clicável do link', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setRectangle({ x: 50, y: 100, width: 200, height: 30 });

      const rect = link.getRectangle();
      expect(rect.x).toBe(50);
      expect(rect.y).toBe(100);
      expect(rect.width).toBe(200);
      expect(rect.height).toBe(30);
    });
  });

  describe('setPrint', () => {
    it('marca link para impressão', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setPrint(true);

      // Link deve ter flag Print ativo
      const flags = link.getFlags();
      expect(flags & 4).toBe(4); // Flag Print = 4
    });

    it('desmarca link para impressão', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setPrint(false);

      const flags = link.getFlags();
      expect(flags & 4).toBe(0);
    });
  });

  describe('cenários de uso completos', () => {
    it('cria link para URL externa com estilo', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setRectangle({ x: 50, y: 700, width: 150, height: 20 });
      link.setURI('https://pdf-lib.js.org');
      link.setBorderColor(rgb(0, 0, 1));
      link.setBorder({ width: 1 });
      link.setHighlightMode('I');

      expect(link.getURI()).toBe('https://pdf-lib.js.org');
      expect(link.getBorderColor()).toEqual([0, 0, 1]);
    });

    it('cria link para página interna com posição', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);
      const targetPage = PDFRef.of(10, 0);

      link.setRectangle({ x: 100, y: 500, width: 100, height: 25 });
      link.setDestination(targetPage, 0, 842, 1);
      link.removeBorder();

      const dest = link.getDestination();
      expect(dest).toBeDefined();
      expect(link.getURI()).toBeUndefined();
    });

    it('cria link invisível (sem borda)', () => {
      const context = PDFContext.create();
      const link = PDFLinkAnnotation.create(context);

      link.setRectangle({ x: 0, y: 0, width: 100, height: 50 });
      link.setURI('https://invisivel.com');
      link.removeBorder();

      const border = link.dict.lookup(PDFName.of('Border')) as PDFArray;
      expect(border).toBeInstanceOf(PDFArray);
    });
  });
});
