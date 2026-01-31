import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFArray from 'src/core/objects/PDFArray';
import PDFRef from 'src/core/objects/PDFRef';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFString from 'src/core/objects/PDFString';
import PDFContext from 'src/core/PDFContext';
import PDFAnnotation from 'src/core/annotation/PDFAnnotation';
import { AnnotationFlags } from 'src/core/annotation/flags';
import { Color } from 'src/api/colors';

/**
 * Tipos de ação para links.
 */
export enum LinkActionType {
  /** Link para URL externa */
  URI = 'URI',
  /** Link para destino interno (página) */
  GoTo = 'GoTo',
  /** Link para destino nomeado */
  GoToR = 'GoToR',
}

/**
 * Estilo de borda para links.
 */
export interface LinkBorderStyle {
  /** Raio horizontal dos cantos */
  horizontalCornerRadius?: number;
  /** Raio vertical dos cantos */
  verticalCornerRadius?: number;
  /** Largura da borda */
  width?: number;
  /** Estilo do traço (0=sólido, 1-6=tracejado) */
  dashArray?: number[];
}

/**
 * Opções para criar um link.
 */
export interface LinkOptions {
  /** Retângulo do link [x, y, largura, altura] */
  rect: { x: number; y: number; width: number; height: number };
  /** URL para link externo */
  url?: string;
  /** Página de destino para link interno (índice base 0) */
  pageIndex?: number;
  /** Posição X no destino */
  destX?: number;
  /** Posição Y no destino */
  destY?: number;
  /** Zoom no destino (null = manter atual) */
  destZoom?: number | null;
  /** Cor da borda do link */
  borderColor?: Color;
  /** Estilo da borda */
  borderStyle?: LinkBorderStyle;
  /** Se o link deve ser impresso */
  print?: boolean;
}

/**
 * Representa uma anotação de link em um PDF.
 * Links podem apontar para URLs externas ou destinos internos do documento.
 */
class PDFLinkAnnotation extends PDFAnnotation {
  /**
   * Cria uma nova anotação de link.
   */
  static create(context: PDFContext): PDFLinkAnnotation {
    const dict = context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [0, 0, 0, 0],
      Border: [0, 0, 0], // Sem borda por padrão
      F: AnnotationFlags.Print, // Imprime por padrão
    });
    return new PDFLinkAnnotation(dict);
  }

  /**
   * Cria uma anotação de link a partir de um dicionário existente.
   */
  static fromDict(dict: PDFDict): PDFLinkAnnotation {
    return new PDFLinkAnnotation(dict);
  }

  protected constructor(dict: PDFDict) {
    super(dict);
  }

  /**
   * Define a URL de destino para o link (link externo).
   * @param uri A URL de destino
   */
  setURI(uri: string): void {
    const action = this.dict.context.obj({
      S: 'URI',
      URI: PDFString.of(uri),
    });
    this.dict.set(PDFName.of('A'), action);
  }

  /**
   * Obtém a URL de destino do link.
   * @returns A URL ou undefined se não for um link de URL
   */
  getURI(): string | undefined {
    const action = this.dict.lookupMaybe(PDFName.of('A'), PDFDict);
    if (!action) return undefined;

    const type = action.lookup(PDFName.of('S'));
    if (!(type instanceof PDFName) || type.asString() !== '/URI') {
      return undefined;
    }

    const uri = action.lookup(PDFName.of('URI'));
    if (uri instanceof PDFString) {
      return uri.decodeText();
    }
    return undefined;
  }

  /**
   * Define um destino interno para o link (navega para uma página).
   * @param pageRef Referência da página de destino
   * @param x Posição X no destino (ou null para manter atual)
   * @param y Posição Y no destino (ou null para manter atual)
   * @param zoom Zoom no destino (ou null para manter atual)
   */
  setDestination(
    pageRef: PDFRef,
    x: number | null = null,
    y: number | null = null,
    zoom: number | null = null,
  ): void {
    // Usa destino XYZ que permite especificar posição e zoom
    const dest = this.dict.context.obj([
      pageRef,
      'XYZ',
      x ?? null,
      y ?? null,
      zoom ?? null,
    ]);
    this.dict.set(PDFName.of('Dest'), dest);
  }

  /**
   * Define um destino nomeado para o link.
   * @param name Nome do destino
   */
  setNamedDestination(name: string): void {
    this.dict.set(PDFName.of('Dest'), PDFString.of(name));
  }

  /**
   * Obtém o destino interno do link.
   */
  getDestination(): PDFArray | PDFString | undefined {
    const dest = this.dict.get(PDFName.of('Dest'));
    if (dest instanceof PDFArray || dest instanceof PDFString) {
      return dest;
    }
    return undefined;
  }

  /**
   * Define a borda do link.
   * @param style Estilo da borda
   */
  setBorder(style: LinkBorderStyle): void {
    const border = this.dict.context.obj([
      style.horizontalCornerRadius ?? 0,
      style.verticalCornerRadius ?? 0,
      style.width ?? 0,
    ]);

    if (style.dashArray && style.dashArray.length > 0) {
      const dashArrayObj = this.dict.context.obj(style.dashArray);
      border.push(dashArrayObj);
    }

    this.dict.set(PDFName.of('Border'), border);
  }

  /**
   * Remove a borda do link.
   */
  removeBorder(): void {
    this.dict.set(PDFName.of('Border'), this.dict.context.obj([0, 0, 0]));
  }

  /**
   * Define a cor da borda do link.
   * @param color Cor no formato [r, g, b] (0-1)
   */
  setBorderColor(color: Color): void {
    const colorComponents = this.extractColorComponents(color);
    const colorArray = this.dict.context.obj(colorComponents);
    this.dict.set(PDFName.of('C'), colorArray);
  }

  private extractColorComponents(color: Color): number[] {
    // Color pode ser rgb(), grayscale(), cmyk()
    // Extrai os componentes numéricos
    const colorType = (color as any).type;
    switch (colorType) {
      case 'RGB':
        return [
          (color as any).red,
          (color as any).green,
          (color as any).blue,
        ];
      case 'Grayscale':
        return [(color as any).gray];
      case 'CMYK':
        return [
          (color as any).cyan,
          (color as any).magenta,
          (color as any).yellow,
          (color as any).key,
        ];
      default:
        // Tenta extrair se for objeto com propriedades de cor
        if ('red' in color && 'green' in color && 'blue' in color) {
          return [
            (color as any).red,
            (color as any).green,
            (color as any).blue,
          ];
        }
        return [0, 0, 1]; // Azul por padrão
    }
  }

  /**
   * Obtém a cor da borda.
   */
  getBorderColor(): number[] | undefined {
    const color = this.dict.lookupMaybe(PDFName.of('C'), PDFArray);
    if (!color) return undefined;

    const components: number[] = [];
    for (let i = 0; i < color.size(); i++) {
      const comp = color.lookup(i, PDFNumber);
      components.push(comp.asNumber());
    }
    return components;
  }

  /**
   * Define o modo de highlight quando o link é clicado.
   * @param mode N=nenhum, I=invertido, O=outline, P=push
   */
  setHighlightMode(mode: 'N' | 'I' | 'O' | 'P'): void {
    this.dict.set(PDFName.of('H'), PDFName.of(mode));
  }

  /**
   * Configura o link para ser impresso ou não.
   */
  setPrint(print: boolean): void {
    this.setFlagTo(AnnotationFlags.Print, print);
  }
}

export default PDFLinkAnnotation;
