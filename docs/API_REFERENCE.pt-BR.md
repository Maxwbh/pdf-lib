# Referência da API - @maxwbh/pdf-lib

Documentação completa da API com exemplos para todas as funcionalidades.

> **Nota:** Esta é uma biblioteca JavaScript/TypeScript. Para alternativas em Python, veja [Alternativas Python](#alternativas-python) no final.

---

## Índice

- [Instalação](#instalação)
- [PDFDocument](#pdfdocument)
  - [Criando Documentos](#criando-documentos)
  - [Carregando Documentos](#carregando-documentos)
  - [Salvando Documentos](#salvando-documentos)
  - [Propriedades do Documento](#propriedades-do-documento)
- [PDFPage](#pdfpage)
  - [Adicionando Páginas](#adicionando-páginas)
  - [Desenhando Texto](#desenhando-texto)
  - [Desenhando Formas](#desenhando-formas)
  - [Desenhando Imagens](#desenhando-imagens)
  - [Desenhando Links](#desenhando-links)
- [Fontes](#fontes)
  - [Fontes Padrão](#fontes-padrão)
  - [Fontes Personalizadas](#fontes-personalizadas)
- [Formulários](#formulários)
  - [Campos de Texto](#campos-de-texto)
  - [Caixas de Seleção](#caixas-de-seleção)
  - [Botões de Rádio](#botões-de-rádio)
  - [Listas Suspensas](#listas-suspensas)
  - [Botões](#botões)
  - [Achatando Formulários](#achatando-formulários)
- [Criptografia](#criptografia)
  - [Criptografando PDFs](#criptografando-pdfs)
  - [Descriptografando PDFs](#descriptografando-pdfs)
  - [Permissões](#permissões)
- [Salvamento Incremental](#salvamento-incremental)
- [Metadados](#metadados)
- [Anexos](#anexos)
- [Operações de Página](#operações-de-página)
- [Cores](#cores)
- [Unidades e Coordenadas](#unidades-e-coordenadas)
- [Tratamento de Erros](#tratamento-de-erros)
- [Tipos TypeScript](#tipos-typescript)
- [Alternativas Python](#alternativas-python)

---

## Instalação

### Node.js / npm

```bash
npm install @maxwbh/pdf-lib
```

### Yarn

```bash
yarn add @maxwbh/pdf-lib
```

### CDN (Navegador)

```html
<script src="https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib@1.18.1/dist/pdf-lib.min.js"></script>
```

### Deno

```javascript
import { PDFDocument } from 'https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib@1.18.1/+esm';
```

### ES Modules

```javascript
import { PDFDocument, rgb, degrees } from '@maxwbh/pdf-lib';
```

### CommonJS

```javascript
const { PDFDocument, rgb, degrees } = require('@maxwbh/pdf-lib');
```

---

## PDFDocument

Classe principal para criar e manipular documentos PDF.

### Criando Documentos

#### `PDFDocument.create(options?)`

Cria um novo documento PDF vazio.

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

// Criação básica
const pdfDoc = await PDFDocument.create();

// Com opções
const pdfDoc = await PDFDocument.create({
  updateMetadata: true,  // Atualizar metadados ao salvar (padrão: true)
});
```

**Retorna:** `Promise<PDFDocument>`

### Carregando Documentos

#### `PDFDocument.load(data, options?)`

Carrega um documento PDF existente.

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fs from 'fs';

// De arquivo (Node.js)
const bytesExistentes = fs.readFileSync('documento.pdf');
const pdfDoc = await PDFDocument.load(bytesExistentes);

// De URL (Navegador/Node.js)
const url = 'https://exemplo.com/documento.pdf';
const bytesExistentes = await fetch(url).then(res => res.arrayBuffer());
const pdfDoc = await PDFDocument.load(bytesExistentes);

// De Base64
const stringBase64 = 'JVBERi0xLjcK...';
const pdfDoc = await PDFDocument.load(stringBase64);
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `data` | `string \| Uint8Array \| ArrayBuffer` | Dados do PDF (bytes ou base64) |
| `options.password` | `string` | Senha para PDFs criptografados |
| `options.ignoreEncryption` | `boolean` | Ignorar descriptografia (padrão: false) |
| `options.parseSpeed` | `number` | Velocidade de análise 0-100 (padrão: 50) |
| `options.throwOnInvalidObject` | `boolean` | Lançar erro em objetos inválidos (padrão: false) |
| `options.updateMetadata` | `boolean` | Atualizar metadados ao salvar (padrão: true) |

**Retorna:** `Promise<PDFDocument>`

**Exemplos com todas as opções:**

```javascript
// Carregar PDF criptografado
const pdfDoc = await PDFDocument.load(bytesEncriptados, {
  password: 'senhasecreta',
});

// Carregar com análise estrita
const pdfDoc = await PDFDocument.load(bytes, {
  throwOnInvalidObject: true,
  parseSpeed: 100,
});

// Carregar sem descriptografar (apenas para inspeção)
const pdfDoc = await PDFDocument.load(bytesEncriptados, {
  ignoreEncryption: true,
});
```

### Salvando Documentos

#### `pdfDoc.save(options?)`

Salva o documento PDF em bytes.

```javascript
// Salvamento básico
const pdfBytes = await pdfDoc.save();

// Salvar em arquivo (Node.js)
fs.writeFileSync('saida.pdf', pdfBytes);

// Salvar com opções
const pdfBytes = await pdfDoc.save({
  useObjectStreams: false,      // Desabilitar object streams (arquivo maior, mais compatível)
  addDefaultPage: true,         // Adicionar página em branco se vazio
  objectsPerTick: 50,           // Objetos processados por tick (padrão: 50)
  updateFieldAppearances: true, // Atualizar aparência dos campos
});
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `options.useObjectStreams` | `boolean` | Usar object streams (padrão: true) |
| `options.addDefaultPage` | `boolean` | Adicionar página padrão se vazio (padrão: true) |
| `options.objectsPerTick` | `number` | Objetos por tick de processamento (padrão: 50) |
| `options.updateFieldAppearances` | `boolean` | Atualizar aparências de formulário (padrão: true) |
| `options.encrypt` | `EncryptOptions` | Opções de criptografia (veja [Criptografia](#criptografia)) |

**Retorna:** `Promise<Uint8Array>`

#### `pdfDoc.saveAsBase64(options?)`

Salva o PDF como string codificada em Base64.

```javascript
const stringBase64 = await pdfDoc.saveAsBase64();

// Com prefixo data URI
const dataUri = await pdfDoc.saveAsBase64({ dataUri: true });
// Retorna: "data:application/pdf;base64,JVBERi0xLjcK..."
```

**Retorna:** `Promise<string>`

### Propriedades do Documento

#### `pdfDoc.getPageCount()`

```javascript
const numeroPaginas = pdfDoc.getPageCount();
console.log(`Documento tem ${numeroPaginas} páginas`);
```

#### `pdfDoc.getPages()`

```javascript
const paginas = pdfDoc.getPages();
paginas.forEach((pagina, indice) => {
  const { width, height } = pagina.getSize();
  console.log(`Página ${indice + 1}: ${width} x ${height}`);
});
```

#### `pdfDoc.getPage(index)`

```javascript
const primeiraPagina = pdfDoc.getPage(0);  // indexado a partir de 0
const ultimaPagina = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
```

#### `pdfDoc.getForm()`

```javascript
const formulario = pdfDoc.getForm();
const campos = formulario.getFields();
console.log(`Formulário tem ${campos.length} campos`);
```

---

## PDFPage

Representa uma única página em um documento PDF.

### Adicionando Páginas

#### `pdfDoc.addPage(size?)`

Adiciona uma nova página no final do documento.

```javascript
import { PDFDocument, PageSizes } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();

// Tamanho padrão (Carta: 612 x 792)
const pagina1 = pdfDoc.addPage();

// Tamanho predefinido
const pagina2 = pdfDoc.addPage(PageSizes.A4);         // 595.28 x 841.89
const pagina3 = pdfDoc.addPage(PageSizes.Legal);      // 612 x 1008
const pagina4 = pdfDoc.addPage(PageSizes.Tabloid);    // 792 x 1224

// Tamanho personalizado [largura, altura] em pontos
const pagina5 = pdfDoc.addPage([400, 600]);

// Paisagem (trocar largura/altura)
const pagina6 = pdfDoc.addPage([PageSizes.A4[1], PageSizes.A4[0]]);
```

**Tamanhos de Página Disponíveis:**

| Tamanho | Dimensões (pontos) | Dimensões (mm) |
|---------|-------------------|----------------|
| `PageSizes.Letter` | 612 x 792 | 215.9 x 279.4 |
| `PageSizes.A0` | 2383.94 x 3370.39 | 841 x 1189 |
| `PageSizes.A1` | 1683.78 x 2383.94 | 594 x 841 |
| `PageSizes.A2` | 1190.55 x 1683.78 | 420 x 594 |
| `PageSizes.A3` | 841.89 x 1190.55 | 297 x 420 |
| `PageSizes.A4` | 595.28 x 841.89 | 210 x 297 |
| `PageSizes.A5` | 419.53 x 595.28 | 148 x 210 |
| `PageSizes.A6` | 297.64 x 419.53 | 105 x 148 |
| `PageSizes.Legal` | 612 x 1008 | 215.9 x 355.6 |
| `PageSizes.Tabloid` | 792 x 1224 | 279.4 x 431.8 |
| `PageSizes.Executive` | 522 x 756 | 184.15 x 266.7 |

#### `pdfDoc.insertPage(index, size?)`

Insere uma página em uma posição específica.

```javascript
// Inserir no início
const novaPrimeiraPagina = pdfDoc.insertPage(0);

// Inserir na posição 2 (terceira página)
const pagina = pdfDoc.insertPage(2, PageSizes.A4);
```

### Desenhando Texto

#### `page.drawText(text, options?)`

Desenha texto na página.

```javascript
import { PDFDocument, rgb, StandardFonts } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();
const pagina = pdfDoc.addPage();
const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);

// Texto simples
pagina.drawText('Olá, Mundo!', {
  x: 50,
  y: 700,
  size: 24,
  font: fonte,
  color: rgb(0, 0, 0),
});

// Todas as opções
pagina.drawText('Texto Estilizado', {
  x: 50,
  y: 650,
  size: 18,
  font: fonte,
  color: rgb(0.2, 0.4, 0.6),
  opacity: 0.8,
  rotate: degrees(0),
  xSkew: degrees(0),
  ySkew: degrees(0),
  lineHeight: 24,
  maxWidth: 400,
  wordBreaks: [' '],
  blendMode: BlendMode.Normal,
});
```

**Parâmetros:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `x` | `number` | 0 | Coordenada X (da esquerda) |
| `y` | `number` | 0 | Coordenada Y (de baixo) |
| `size` | `number` | 24 | Tamanho da fonte em pontos |
| `font` | `PDFFont` | Helvetica | Fonte incorporada |
| `color` | `Color` | preto | Cor do texto |
| `opacity` | `number` | 1 | Opacidade (0-1) |
| `rotate` | `Rotation` | 0 | Ângulo de rotação |
| `lineHeight` | `number` | size | Altura da linha para múltiplas linhas |
| `maxWidth` | `number` | - | Largura máxima (habilita quebra de texto) |
| `wordBreaks` | `string[]` | [' '] | Caracteres para quebra |

**Texto com múltiplas linhas:**

```javascript
const texto = `Linha 1
Linha 2
Linha 3`;

pagina.drawText(texto, {
  x: 50,
  y: 700,
  size: 14,
  font: fonte,
  lineHeight: 18,
});
```

**Quebra de texto automática:**

```javascript
const textoLongo = 'Este é um parágrafo muito longo que será automaticamente quebrado em múltiplas linhas quando exceder a largura máxima especificada.';

pagina.drawText(textoLongo, {
  x: 50,
  y: 700,
  size: 12,
  font: fonte,
  maxWidth: 300,
  lineHeight: 16,
});
```

### Desenhando Formas

#### `page.drawRectangle(options)`

```javascript
import { rgb, grayscale } from '@maxwbh/pdf-lib';

// Retângulo preenchido
pagina.drawRectangle({
  x: 50,
  y: 500,
  width: 200,
  height: 100,
  color: rgb(0.2, 0.6, 0.8),
});

// Retângulo apenas com borda
pagina.drawRectangle({
  x: 50,
  y: 380,
  width: 200,
  height: 100,
  borderColor: rgb(0, 0, 0),
  borderWidth: 2,
});

// Retângulo com preenchimento e borda
pagina.drawRectangle({
  x: 50,
  y: 260,
  width: 200,
  height: 100,
  color: rgb(1, 0.9, 0.8),
  borderColor: rgb(0.8, 0.4, 0),
  borderWidth: 3,
  opacity: 0.9,
  borderOpacity: 1,
});

// Borda tracejada
pagina.drawRectangle({
  x: 50,
  y: 140,
  width: 200,
  height: 100,
  borderColor: rgb(0, 0, 0),
  borderWidth: 1,
  borderDashArray: [5, 3],  // traço de 5pt, espaço de 3pt
  borderDashPhase: 0,
});

// Retângulo rotacionado
pagina.drawRectangle({
  x: 300,
  y: 400,
  width: 100,
  height: 50,
  color: rgb(0.5, 0.5, 0.5),
  rotate: degrees(45),
});
```

#### `page.drawSquare(options)`

```javascript
pagina.drawSquare({
  x: 100,
  y: 500,
  size: 100,
  color: rgb(0, 0.5, 0),
  borderColor: rgb(0, 0, 0),
  borderWidth: 2,
});
```

#### `page.drawCircle(options)`

```javascript
pagina.drawCircle({
  x: 200,   // centro X
  y: 400,   // centro Y
  size: 50, // raio
  color: rgb(1, 0, 0),
  borderColor: rgb(0, 0, 0),
  borderWidth: 2,
});
```

#### `page.drawEllipse(options)`

```javascript
pagina.drawEllipse({
  x: 300,     // centro X
  y: 400,     // centro Y
  xScale: 75, // raio horizontal
  yScale: 50, // raio vertical
  color: rgb(0, 0, 1),
  borderColor: rgb(0, 0, 0),
  borderWidth: 1,
});
```

#### `page.drawLine(options)`

```javascript
pagina.drawLine({
  start: { x: 50, y: 600 },
  end: { x: 250, y: 700 },
  thickness: 2,
  color: rgb(0, 0, 0),
  opacity: 1,
  lineCap: LineCapStyle.Round,
  dashArray: [10, 5],
  dashPhase: 0,
});
```

**Valores de LineCapStyle:**

- `LineCapStyle.Butt` - Extremidade plana
- `LineCapStyle.Round` - Extremidade arredondada
- `LineCapStyle.Projecting` - Extremidade plana estendida

#### `page.drawSvgPath(path, options)`

Desenha um caminho SVG.

```javascript
// Formato de coração
const caminhoCoracao = 'M 50 30 A 20 20 0 0 1 90 30 A 20 20 0 0 1 50 75 A 20 20 0 0 1 10 30 A 20 20 0 0 1 50 30 Z';

pagina.drawSvgPath(caminhoCoracao, {
  x: 100,
  y: 500,
  scale: 2,
  color: rgb(1, 0, 0),
  borderColor: rgb(0.5, 0, 0),
  borderWidth: 1,
});

// Formato de estrela
const caminhoEstrela = 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z';

pagina.drawSvgPath(caminhoEstrela, {
  x: 300,
  y: 500,
  scale: 1.5,
  color: rgb(1, 0.8, 0),
  borderColor: rgb(0.8, 0.6, 0),
  borderWidth: 2,
});
```

### Desenhando Imagens

#### Incorporando Imagens

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fs from 'fs';

const pdfDoc = await PDFDocument.create();

// Incorporar PNG
const bytesPng = fs.readFileSync('imagem.png');
const imagemPng = await pdfDoc.embedPng(bytesPng);

// Incorporar JPEG
const bytesJpg = fs.readFileSync('foto.jpg');
const imagemJpg = await pdfDoc.embedJpg(bytesJpg);

// De URL
const urlImagem = 'https://exemplo.com/imagem.png';
const bytesImagem = await fetch(urlImagem).then(res => res.arrayBuffer());
const imagem = await pdfDoc.embedPng(bytesImagem);

// De Base64
const imagemBase64 = 'iVBORw0KGgoAAAANSUhEUgAA...';
const imagem = await pdfDoc.embedPng(imagemBase64);
```

#### `page.drawImage(image, options)`

```javascript
const pagina = pdfDoc.addPage();

// Imagem básica
pagina.drawImage(imagemPng, {
  x: 50,
  y: 500,
  width: 200,
  height: 150,
});

// Escalar para caber
const { width, height } = imagemPng.scale(0.5);
pagina.drawImage(imagemPng, {
  x: 50,
  y: 300,
  width,
  height,
});

// Todas as opções
pagina.drawImage(imagemJpg, {
  x: 300,
  y: 500,
  width: 100,
  height: 100,
  opacity: 0.8,
  rotate: degrees(15),
  xSkew: degrees(0),
  ySkew: degrees(0),
  blendMode: BlendMode.Normal,
});
```

**Obter dimensões originais da imagem:**

```javascript
const { width, height } = imagemPng;
console.log(`Tamanho original: ${width} x ${height}`);

// Escalar para largura específica mantendo proporção
const dimsEscaladas = imagemPng.scaleToFit(300, 200);
pagina.drawImage(imagemPng, {
  x: 50,
  y: 400,
  width: dimsEscaladas.width,
  height: dimsEscaladas.height,
});
```

### Desenhando Links

#### `page.drawLink(options)` - NOVO no @maxwbh/pdf-lib

Cria hiperlinks clicáveis na página.

```javascript
// Link para URL externa
pagina.drawText('Clique aqui para visitar o GitHub', {
  x: 50,
  y: 700,
  size: 14,
  color: rgb(0, 0, 0.8),
});

pagina.drawLink({
  url: 'https://github.com/Maxwbh/pdf-lib',
  x: 50,
  y: 695,
  width: 200,
  height: 20,
});

// Com borda visível
pagina.drawLink({
  url: 'https://exemplo.com',
  x: 50,
  y: 650,
  width: 150,
  height: 20,
  borderColor: rgb(0, 0, 1),
  borderWidth: 1,
});

// Navegação interna de página
const paginas = pdfDoc.getPages();
const paginaDestino = paginas[2]; // Link para página 3

pagina.drawLink({
  pageRef: paginaDestino.ref,
  x: 50,
  y: 600,
  width: 100,
  height: 20,
});
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `url` | `string` | URL externa (para links web) |
| `pageRef` | `PDFRef` | Referência de página interna (para navegação) |
| `x` | `number` | Coordenada X da área do link |
| `y` | `number` | Coordenada Y da área do link |
| `width` | `number` | Largura da área clicável |
| `height` | `number` | Altura da área clicável |
| `borderColor` | `Color` | Cor da borda (opcional) |
| `borderWidth` | `number` | Espessura da borda (opcional) |
| `borderStyle` | `string` | Estilo da borda: 'solid', 'dashed', 'underline' |

---

## Fontes

### Fontes Padrão

14 fontes padrão disponíveis sem incorporação:

```javascript
import { PDFDocument, StandardFonts } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();

// Incorporar fontes padrão
const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

const courier = await pdfDoc.embedFont(StandardFonts.Courier);
const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
const courierOblique = await pdfDoc.embedFont(StandardFonts.CourierOblique);
const courierBoldOblique = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);

const symbol = await pdfDoc.embedFont(StandardFonts.Symbol);
const zapfDingbats = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);
```

### Fontes Personalizadas

Para suporte Unicode e fontes personalizadas, use `@pdf-lib/fontkit`:

```bash
npm install @pdf-lib/fontkit
```

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';

const pdfDoc = await PDFDocument.create();

// Registrar fontkit
pdfDoc.registerFontkit(fontkit);

// Incorporar fonte TTF
const bytesFont = fs.readFileSync('fonts/Roboto-Regular.ttf');
const roboto = await pdfDoc.embedFont(bytesFont);

// Incorporar fonte OTF
const bytesOtf = fs.readFileSync('fonts/OpenSans-Bold.otf');
const openSans = await pdfDoc.embedFont(bytesOtf);

// Incorporação com subset (tamanho menor)
const fonteSubset = await pdfDoc.embedFont(bytesFont, { subset: true });

// Usar a fonte
const pagina = pdfDoc.addPage();
pagina.drawText('Texto com fonte personalizada', {
  x: 50,
  y: 700,
  size: 24,
  font: roboto,
});

// Texto Unicode (Japonês, Grego, Árabe, etc.)
pagina.drawText('日本語テキスト - Ελληνικά - العربية', {
  x: 50,
  y: 650,
  size: 18,
  font: roboto, // Deve suportar estes caracteres
});
```

**Medições de fonte:**

```javascript
const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
const tamanhoFonte = 12;
const texto = 'Olá, Mundo!';

// Obter largura do texto
const larguraTexto = fonte.widthOfTextAtSize(texto, tamanhoFonte);

// Obter métricas de altura da fonte
const alturaFonte = fonte.heightAtSize(tamanhoFonte);

// Ascendente e descendente
const ascent = fonte.embedder.font.ascent;
const descent = fonte.embedder.font.descent;
```

---

## Formulários

### Obtendo o Formulário

```javascript
const formulario = pdfDoc.getForm();
const campos = formulario.getFields();

campos.forEach(campo => {
  const tipo = campo.constructor.name;
  const nome = campo.getName();
  console.log(`${tipo}: ${nome}`);
});
```

### Campos de Texto

#### Criando Campos de Texto

```javascript
const formulario = pdfDoc.getForm();
const pagina = pdfDoc.getPage(0);

// Criar campo de texto
const campoTexto = formulario.createTextField('usuario.nome');
campoTexto.setText('João Silva');
campoTexto.addToPage(pagina, {
  x: 50,
  y: 700,
  width: 200,
  height: 25,
  borderColor: rgb(0, 0, 0),
  backgroundColor: rgb(1, 1, 1),
});

// Campo de texto multilinha
const campoComentarios = formulario.createTextField('usuario.comentarios');
campoComentarios.enableMultiline();
campoComentarios.setText('Digite seus comentários aqui...');
campoComentarios.addToPage(pagina, {
  x: 50,
  y: 600,
  width: 300,
  height: 100,
});

// Campo somente leitura
const campoId = formulario.createTextField('usuario.id');
campoId.setText('12345');
campoId.enableReadOnly();
campoId.addToPage(pagina, { x: 50, y: 550, width: 100, height: 25 });

// Campo de senha
const campoSenha = formulario.createTextField('usuario.senha');
campoSenha.enablePassword();
campoSenha.addToPage(pagina, { x: 50, y: 500, width: 200, height: 25 });

// Campo formatado (tamanho máximo)
const campoTelefone = formulario.createTextField('usuario.telefone');
campoTelefone.setMaxLength(10);
campoTelefone.setText('5511999999');
campoTelefone.addToPage(pagina, { x: 50, y: 450, width: 150, height: 25 });
```

#### Lendo/Preenchendo Campos de Texto

```javascript
// Obter campo existente pelo nome
const campoNome = formulario.getTextField('usuario.nome');

// Ler valor
const valorAtual = campoNome.getText();
console.log(`Valor atual: ${valorAtual}`);

// Definir valor
campoNome.setText('Maria Santos');

// Limpar valor
campoNome.setText('');
```

### Caixas de Seleção

```javascript
// Criar caixa de seleção
const checkbox = formulario.createCheckBox('termos.aceitos');
checkbox.addToPage(pagina, {
  x: 50,
  y: 400,
  width: 20,
  height: 20,
});

// Marcar/desmarcar
checkbox.check();
// checkbox.uncheck();

// Ler estado
const estaMarcado = checkbox.isChecked();

// Obter checkbox existente
const checkboxExistente = formulario.getCheckBox('termos.aceitos');
checkboxExistente.check();
```

### Botões de Rádio

```javascript
// Criar grupo de rádio
const grupoGenero = formulario.createRadioGroup('usuario.genero');

// Adicionar opções
grupoGenero.addOptionToPage('masculino', pagina, {
  x: 50, y: 350, width: 15, height: 15,
});
grupoGenero.addOptionToPage('feminino', pagina, {
  x: 50, y: 330, width: 15, height: 15,
});
grupoGenero.addOptionToPage('outro', pagina, {
  x: 50, y: 310, width: 15, height: 15,
});

// Selecionar opção
grupoGenero.select('masculino');

// Ler seleção
const selecionado = grupoGenero.getSelected();
console.log(`Selecionado: ${selecionado}`);

// Obter todas as opções
const opcoes = grupoGenero.getOptions();
console.log(`Opções: ${opcoes.join(', ')}`);
```

### Listas Suspensas

```javascript
// Criar lista suspensa
const dropdown = formulario.createDropdown('usuario.pais');
dropdown.addOptions(['Brasil', 'EUA', 'Alemanha', 'Japão', 'França']);
dropdown.select('Brasil');
dropdown.addToPage(pagina, {
  x: 50,
  y: 270,
  width: 150,
  height: 25,
});

// Lista suspensa editável (permite entrada personalizada)
const dropdownEditavel = formulario.createDropdown('usuario.cidade');
dropdownEditavel.addOptions(['São Paulo', 'Rio de Janeiro', 'Brasília']);
dropdownEditavel.enableEditing();
dropdownEditavel.addToPage(pagina, {
  x: 50,
  y: 230,
  width: 150,
  height: 25,
});

// Ler seleção
const pais = formulario.getDropdown('usuario.pais').getSelected();
```

### Botões

```javascript
// Criar botão
const botao = formulario.createButton('botao.enviar');
botao.addToPage('Enviar Formulário', pagina, {
  x: 50,
  y: 180,
  width: 100,
  height: 30,
  borderColor: rgb(0, 0, 0),
  backgroundColor: rgb(0.9, 0.9, 0.9),
  textColor: rgb(0, 0, 0),
  font: helvetica,
});
```

### Achatando Formulários

Achatar formulários para torná-los não editáveis (converte para conteúdo estático):

```javascript
// Achatar todos os campos
formulario.flatten();

// Achatar campo específico
const campo = formulario.getTextField('usuario.nome');
formulario.flattenField(campo);
```

---

## Criptografia

### Criptografando PDFs

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();
const pagina = pdfDoc.addPage();
pagina.drawText('Documento Confidencial');

// Criptografia básica (AES-256)
const pdfBytes = await pdfDoc.save({
  encrypt: {
    userPassword: 'usuario123',
    ownerPassword: 'proprietario456',
  },
});

// Todas as opções de criptografia
const pdfBytes = await pdfDoc.save({
  encrypt: {
    userPassword: 'usuario123',      // Senha para abrir documento
    ownerPassword: 'proprietario456', // Senha para acesso total
    algorithm: 'aes256',             // 'rc4-40', 'rc4-128', 'aes128', 'aes256'
    permissions: {
      printing: true,                // Permitir impressão
      printingHighQuality: true,     // Permitir impressão de alta qualidade
      modifying: false,              // Permitir modificação do documento
      copying: false,                // Permitir cópia de conteúdo
      annotating: true,              // Permitir adicionar anotações
      fillingForms: true,            // Permitir preenchimento de formulários
      contentAccessibility: true,    // Permitir acesso de acessibilidade
      documentAssembly: false,       // Permitir montagem de páginas
    },
  },
});
```

**Algoritmos de Criptografia:**

| Algoritmo | Versão PDF | Nível de Segurança |
|-----------|------------|-------------------|
| `rc4-40` | 1.1+ | Baixo (legado) |
| `rc4-128` | 1.4+ | Médio |
| `aes128` | 1.5+ | Alto |
| `aes256` | 2.0+ | Muito Alto (recomendado) |

### Descriptografando PDFs

```javascript
// Abrir com senha de usuário
const pdfDoc = await PDFDocument.load(bytesCriptografados, {
  password: 'usuario123',
});

// Abrir com senha de proprietário (permissões totais)
const pdfDoc = await PDFDocument.load(bytesCriptografados, {
  password: 'proprietario456',
});

// Remover criptografia (salvar sem opção encrypt)
const bytesDescriptografados = await pdfDoc.save();
```

### Permissões

| Permissão | Descrição |
|-----------|-----------|
| `printing` | Permitir qualquer impressão |
| `printingHighQuality` | Permitir impressão em alta resolução |
| `modifying` | Permitir modificação do documento |
| `copying` | Permitir cópia de texto/imagem |
| `annotating` | Permitir adicionar/editar anotações |
| `fillingForms` | Permitir entrada em campos de formulário |
| `contentAccessibility` | Permitir leitores de tela |
| `documentAssembly` | Permitir inserir/excluir/rotacionar páginas |

**Exemplo: PDF somente leitura (apenas visualização e impressão):**

```javascript
const pdfBytes = await pdfDoc.save({
  encrypt: {
    userPassword: '',                // Vazio = sem senha para abrir
    ownerPassword: 'admin123',
    permissions: {
      printing: true,
      printingHighQuality: true,
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  },
});
```

---

## Salvamento Incremental

Preservar assinaturas digitais ao modificar PDFs assinados.

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

// Carregar PDF assinado
const bytesAssinados = fs.readFileSync('documento-assinado.pdf');
const pdfDoc = await PDFDocument.load(bytesAssinados);

// Capturar snapshot ANTES de fazer alterações
pdfDoc.takeSnapshot();

// Fazer modificações
const formulario = pdfDoc.getForm();
const campoData = formulario.getTextField('data');
campoData.setText('2026-03-02');

const campoAssinante = formulario.getTextField('assinante');
campoAssinante.setText('João Silva');

// Salvar incrementalmente (preserva assinatura)
const bytesModificados = await pdfDoc.saveIncremental();

// Salvar em arquivo
fs.writeFileSync('assinado-preenchido.pdf', bytesModificados);
```

**Como funciona:**

1. `takeSnapshot()` - Captura o estado do documento antes das modificações
2. Faça suas alterações (preencha formulários, adicione anotações, etc.)
3. `saveIncremental()` - Anexa apenas as alterações ao documento original

**Notas importantes:**

- Chame `takeSnapshot()` imediatamente após carregar
- Não modifique a estrutura do documento (adicionar/remover páginas)
- Apenas modifique campos de formulário e anotações
- A assinatura digital permanece válida

---

## Metadados

### Lendo Metadados

```javascript
const titulo = pdfDoc.getTitle();
const autor = pdfDoc.getAuthor();
const assunto = pdfDoc.getSubject();
const palavrasChave = pdfDoc.getKeywords();
const criador = pdfDoc.getCreator();
const produtor = pdfDoc.getProducer();
const dataCriacao = pdfDoc.getCreationDate();
const dataModificacao = pdfDoc.getModificationDate();

console.log(`Título: ${titulo}`);
console.log(`Autor: ${autor}`);
console.log(`Criado: ${dataCriacao}`);
```

### Definindo Metadados

```javascript
pdfDoc.setTitle('Relatório Financeiro 2026');
pdfDoc.setAuthor('Maxwell Oliveira');
pdfDoc.setSubject('Resultados Financeiros Q1');
pdfDoc.setKeywords(['finanças', 'relatório', 'trimestral']);
pdfDoc.setCreator('@maxwbh/pdf-lib');
pdfDoc.setProducer('M&S do Brasil LTDA');
pdfDoc.setCreationDate(new Date('2026-01-15'));
pdfDoc.setModificationDate(new Date());

// Definir idioma
pdfDoc.setLanguage('pt-BR');
```

---

## Anexos

### Adicionando Anexos

```javascript
import { AFRelationship } from '@maxwbh/pdf-lib';

// Anexar um arquivo
const dadosCsv = fs.readFileSync('dados.csv');
await pdfDoc.attach(dadosCsv, 'dados-relatorio.csv', {
  mimeType: 'text/csv',
  description: 'Dados brutos do relatório',
  creationDate: new Date('2026-01-15'),
  modificationDate: new Date(),
  afRelationship: AFRelationship.Data,
});

// Anexar de string
const conteudoJson = JSON.stringify({ chave: 'valor' });
const bytesJson = new TextEncoder().encode(conteudoJson);
await pdfDoc.attach(bytesJson, 'config.json', {
  mimeType: 'application/json',
  description: 'Arquivo de configuração',
});
```

**Valores de AFRelationship:**

- `AFRelationship.Source` - Documento fonte
- `AFRelationship.Data` - Arquivo de dados
- `AFRelationship.Alternative` - Representação alternativa
- `AFRelationship.Supplement` - Arquivo suplementar
- `AFRelationship.Unspecified` - Sem relacionamento específico

---

## Operações de Página

### Copiar Páginas Entre Documentos

```javascript
const docOrigem = await PDFDocument.load(bytesOrigem);
const docDestino = await PDFDocument.create();

// Copiar páginas específicas
const [pagina1, pagina3] = await docDestino.copyPages(docOrigem, [0, 2]);

// Adicionar páginas copiadas
docDestino.addPage(pagina1);
docDestino.addPage(pagina3);

// Copiar todas as páginas
const indicesPaginas = docOrigem.getPageIndices();
const paginasCopiadas = await docDestino.copyPages(docOrigem, indicesPaginas);
paginasCopiadas.forEach(pagina => docDestino.addPage(pagina));
```

### Remover Páginas

```javascript
// Remover página por índice (baseado em 0)
pdfDoc.removePage(0);  // Remover primeira página
pdfDoc.removePage(pdfDoc.getPageCount() - 1);  // Remover última página
```

### Obter Tamanho da Página

```javascript
const pagina = pdfDoc.getPage(0);
const { width, height } = pagina.getSize();
console.log(`Tamanho da página: ${width} x ${height} pontos`);
```

### Definir Tamanho da Página

```javascript
pagina.setSize(PageSizes.A4[0], PageSizes.A4[1]);
```

### Rotacionar Páginas

```javascript
pagina.setRotation(degrees(90));   // Rotacionar 90 graus
pagina.setRotation(degrees(180));  // Rotacionar 180 graus
pagina.setRotation(degrees(270));  // Rotacionar 270 graus
```

### Obter/Definir MediaBox, CropBox, BleedBox, TrimBox

```javascript
// Obter caixas
const mediaBox = pagina.getMediaBox();
const cropBox = pagina.getCropBox();
const bleedBox = pagina.getBleedBox();
const trimBox = pagina.getTrimBox();

// Definir crop box (área visível)
pagina.setCropBox(50, 50, 500, 700);
```

---

## Cores

### Cores RGB

```javascript
import { rgb } from '@maxwbh/pdf-lib';

const vermelho = rgb(1, 0, 0);         // Vermelho puro
const verde = rgb(0, 1, 0);            // Verde puro
const azul = rgb(0, 0, 1);             // Azul puro
const preto = rgb(0, 0, 0);            // Preto
const branco = rgb(1, 1, 1);           // Branco
const cinza = rgb(0.5, 0.5, 0.5);      // 50% cinza
const personalizada = rgb(0.2, 0.4, 0.8); // Cor personalizada

// De hex (função auxiliar)
function hexParaRgb(hex) {
  const resultado = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return resultado ? rgb(
    parseInt(resultado[1], 16) / 255,
    parseInt(resultado[2], 16) / 255,
    parseInt(resultado[3], 16) / 255
  ) : null;
}

const corMarca = hexParaRgb('#3498db');
```

### Escala de Cinza

```javascript
import { grayscale } from '@maxwbh/pdf-lib';

const preto = grayscale(0);           // Preto
const cinzaEscuro = grayscale(0.25);  // 25% cinza
const cinzaMedio = grayscale(0.5);    // 50% cinza
const cinzaClaro = grayscale(0.75);   // 75% cinza
const branco = grayscale(1);          // Branco
```

### Cores CMYK

```javascript
import { cmyk } from '@maxwbh/pdf-lib';

const ciano = cmyk(1, 0, 0, 0);          // Ciano puro
const magenta = cmyk(0, 1, 0, 0);        // Magenta puro
const amarelo = cmyk(0, 0, 1, 0);        // Amarelo puro
const preto = cmyk(0, 0, 0, 1);          // Preto puro
const pretoRico = cmyk(0.75, 0.68, 0.67, 0.9); // Preto rico para impressão
```

---

## Unidades e Coordenadas

### Sistema de Coordenadas

- **Origem (0, 0)** está no canto **inferior esquerdo**
- **X** aumenta para a direita
- **Y** aumenta para cima
- **Unidades** são em **pontos** (1 ponto = 1/72 polegada)

```
  ┌─────────────────────────────┐ (largura, altura)
  │                             │
  │                             │
  │        Área da Página       │
  │                             │
  │                             │
  └─────────────────────────────┘
(0, 0)
```

### Conversões de Unidades

```javascript
// Pontos para outras unidades
const pontosParaPolegadas = (pts) => pts / 72;
const pontosParaCm = (pts) => pts / 72 * 2.54;
const pontosParaMm = (pts) => pts / 72 * 25.4;
const pontosParaPx = (pts, dpi = 96) => pts / 72 * dpi;

// Outras unidades para pontos
const polegadasParaPontos = (polegadas) => polegadas * 72;
const cmParaPontos = (cm) => cm / 2.54 * 72;
const mmParaPontos = (mm) => mm / 25.4 * 72;
const pxParaPontos = (px, dpi = 96) => px / dpi * 72;

// Exemplos
const margemPolegadas = 1;
const margemPontos = polegadasParaPontos(margemPolegadas); // 72 pontos

const larguraA4Mm = 210;
const larguraA4Pontos = mmParaPontos(larguraA4Mm); // ~595.28 pontos
```

### Auxiliar de Rotação

```javascript
import { degrees, radians } from '@maxwbh/pdf-lib';

const rotacao90 = degrees(90);
const rotacaoPi = radians(Math.PI);  // 180 graus
```

---

## Tratamento de Erros

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

try {
  const pdfDoc = await PDFDocument.load(bytes);
} catch (erro) {
  if (erro.message.includes('encrypted')) {
    console.log('PDF está criptografado. Por favor, forneça a senha.');
    const pdfDoc = await PDFDocument.load(bytes, { password: 'segredo' });
  } else if (erro.message.includes('Invalid')) {
    console.log('Arquivo PDF inválido');
  } else {
    throw erro;
  }
}

// Erros de campo de formulário
try {
  const campo = formulario.getTextField('inexistente');
} catch (erro) {
  console.log('Campo não encontrado:', erro.message);
}

// Verificar se campo existe antes de acessar
const nomeCampo = 'usuario.nome';
const campos = formulario.getFields();
const campoExiste = campos.some(c => c.getName() === nomeCampo);
if (campoExiste) {
  const campo = formulario.getTextField(nomeCampo);
}
```

---

## Tipos TypeScript

```typescript
import {
  PDFDocument,
  PDFPage,
  PDFFont,
  PDFImage,
  PDFForm,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFButton,
  Color,
  RGB,
  CMYK,
  Grayscale,
  PageSizes,
  StandardFonts,
  BlendMode,
  LineCapStyle,
  degrees,
  radians,
  rgb,
  cmyk,
  grayscale,
} from '@maxwbh/pdf-lib';

// Definições de tipo
type Color = RGB | CMYK | Grayscale;

interface TextOptions {
  x?: number;
  y?: number;
  size?: number;
  font?: PDFFont;
  color?: Color;
  opacity?: number;
  lineHeight?: number;
  maxWidth?: number;
  wordBreaks?: string[];
  rotate?: Rotation;
}

interface RectangleOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: Color;
  borderColor?: Color;
  borderWidth?: number;
  opacity?: number;
  borderOpacity?: number;
  rotate?: Rotation;
  borderDashArray?: number[];
  borderDashPhase?: number;
}

interface LinkOptions {
  url?: string;
  pageRef?: PDFRef;
  x: number;
  y: number;
  width: number;
  height: number;
  borderColor?: Color;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'underline';
}

interface EncryptOptions {
  userPassword?: string;
  ownerPassword?: string;
  algorithm?: 'rc4-40' | 'rc4-128' | 'aes128' | 'aes256';
  permissions?: {
    printing?: boolean;
    printingHighQuality?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
    fillingForms?: boolean;
    contentAccessibility?: boolean;
    documentAssembly?: boolean;
  };
}
```

---

## Alternativas Python

Como `pdf-lib` é uma biblioteca JavaScript, aqui estão bibliotecas Python equivalentes para funcionalidade similar:

### PyPDF2 / pypdf

Manipulação básica de PDF (mesclar, dividir, rotacionar, criptografar):

```python
# pip install pypdf

from pypdf import PdfReader, PdfWriter

# Ler PDF
leitor = PdfReader("documento.pdf")
print(f"Páginas: {len(leitor.pages)}")

# Extrair texto
for pagina in leitor.pages:
    texto = pagina.extract_text()
    print(texto)

# Criar novo PDF
escritor = PdfWriter()
escritor.add_page(leitor.pages[0])

# Criptografar
escritor.encrypt(user_password="usuario123", owner_password="proprietario456")
escritor.write("criptografado.pdf")

# Mesclar PDFs
mesclador = PdfWriter()
mesclador.append("doc1.pdf")
mesclador.append("doc2.pdf")
mesclador.write("mesclado.pdf")
```

### reportlab

Criar PDFs do zero (similar ao pdf-lib):

```python
# pip install reportlab

from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import red, blue, black
from reportlab.lib.units import cm, inch

# Criar PDF
c = canvas.Canvas("saida.pdf", pagesize=A4)

# Desenhar texto
c.setFont("Helvetica", 24)
c.drawString(50, 700, "Olá, Mundo!")

# Desenhar formas
c.setFillColor(blue)
c.rect(50, 500, 200, 100, fill=True, stroke=True)

c.setFillColor(red)
c.circle(300, 550, 50, fill=True)

# Desenhar imagem
c.drawImage("imagem.png", 50, 300, width=200, height=150)

# Adicionar link
c.linkURL("https://github.com", (50, 250, 200, 270))

# Salvar
c.save()
```

### pikepdf

Manipulação de PDF de baixo nível (criptografia, salvamento incremental):

```python
# pip install pikepdf

import pikepdf

# Abrir PDF criptografado
pdf = pikepdf.open("criptografado.pdf", password="segredo")

# Criptografar PDF
pdf_saida = pikepdf.new()
pdf_saida.pages.append(pikepdf.Page(pikepdf.Dictionary()))
pdf_saida.save("criptografado.pdf", encryption=pikepdf.Encryption(
    owner="proprietario123",
    user="usuario123",
    allow=pikepdf.Permissions(
        extract=False,
        modify_form=True,
        print_lowres=True,
        print_highres=True,
    )
))

# Salvamento incremental (preserva assinaturas)
pdf = pikepdf.open("assinado.pdf")
# Fazer alterações...
pdf.save("modificado.pdf", linearize=False)
```

### pdfrw

Ler/escrever estrutura PDF:

```python
# pip install pdfrw

from pdfrw import PdfReader, PdfWriter, PageMerge

# Ler PDF
leitor = PdfReader("entrada.pdf")
escritor = PdfWriter()

# Copiar páginas
for pagina in leitor.pages:
    escritor.addpage(pagina)

# Marca d'água
marca_dagua = PdfReader("marca_dagua.pdf").pages[0]
for pagina in escritor.pagearray:
    PageMerge(pagina).add(marca_dagua).render()

escritor.write("saida.pdf")
```

### Tabela Comparativa

| Funcionalidade | pdf-lib (JS) | pypdf | reportlab | pikepdf |
|----------------|-------------|-------|-----------|---------|
| Criar PDF | Sim | Limitado | Sim | Sim |
| Modificar PDF | Sim | Sim | Não | Sim |
| Desenhar texto | Sim | Não | Sim | Não |
| Desenhar formas | Sim | Não | Sim | Não |
| Incorporar imagens | Sim | Não | Sim | Sim |
| Preencher formulários | Sim | Sim | Não | Sim |
| Criptografar/Descriptografar | Sim | Sim | Não | Sim |
| Salvamento incremental | Sim | Não | Não | Sim |
| Assinaturas digitais | Preserva | Não | Não | Preserva |
| Hiperlinks | Sim | Sim | Sim | Sim |

---

## Exemplos Completos

### Gerador de Nota Fiscal

```javascript
import { PDFDocument, rgb, StandardFonts, PageSizes } from '@maxwbh/pdf-lib';

async function criarNotaFiscal(dados) {
  const pdfDoc = await PDFDocument.create();
  const pagina = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = pagina.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cabeçalho
  pagina.drawText('NOTA FISCAL', {
    x: 50, y: height - 50,
    size: 28, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
  });

  pagina.drawText(`#${dados.numeroNota}`, {
    x: 50, y: height - 80,
    size: 14, font: helvetica, color: rgb(0.5, 0.5, 0.5),
  });

  // Informações da empresa
  pagina.drawText(dados.nomeEmpresa, {
    x: width - 200, y: height - 50,
    size: 16, font: helveticaBold,
  });

  // Tabela de itens
  let y = height - 150;
  const cabecalhosTabela = ['Descrição', 'Qtd', 'Preço', 'Total'];
  const largurasColunas = [250, 60, 80, 80];
  let x = 50;

  // Cabeçalhos
  pagina.drawRectangle({
    x: 50, y: y - 5, width: width - 100, height: 25,
    color: rgb(0.9, 0.9, 0.9),
  });

  cabecalhosTabela.forEach((cabecalho, i) => {
    pagina.drawText(cabecalho, {
      x, y, size: 12, font: helveticaBold,
    });
    x += largurasColunas[i];
  });

  y -= 30;

  // Itens
  let total = 0;
  dados.itens.forEach(item => {
    x = 50;
    const totalItem = item.qtd * item.preco;
    total += totalItem;

    pagina.drawText(item.descricao, { x, y, size: 11, font: helvetica });
    x += largurasColunas[0];
    pagina.drawText(String(item.qtd), { x, y, size: 11, font: helvetica });
    x += largurasColunas[1];
    pagina.drawText(`R$ ${item.preco.toFixed(2)}`, { x, y, size: 11, font: helvetica });
    x += largurasColunas[2];
    pagina.drawText(`R$ ${totalItem.toFixed(2)}`, { x, y, size: 11, font: helvetica });

    y -= 25;
  });

  // Total
  pagina.drawLine({
    start: { x: 50, y: y + 15 },
    end: { x: width - 50, y: y + 15 },
    thickness: 1, color: rgb(0.8, 0.8, 0.8),
  });

  pagina.drawText('TOTAL:', {
    x: width - 180, y: y - 10,
    size: 14, font: helveticaBold,
  });

  pagina.drawText(`R$ ${total.toFixed(2)}`, {
    x: width - 100, y: y - 10,
    size: 14, font: helveticaBold, color: rgb(0, 0.5, 0),
  });

  // Metadados
  pdfDoc.setTitle(`Nota Fiscal ${dados.numeroNota}`);
  pdfDoc.setAuthor(dados.nomeEmpresa);

  return pdfDoc.save();
}

// Uso
const dadosNota = {
  numeroNota: 'NF-2026-001',
  nomeEmpresa: 'M&S do Brasil LTDA',
  itens: [
    { descricao: 'Serviços de Desenvolvimento Web', qtd: 40, preco: 150 },
    { descricao: 'Design UI/UX', qtd: 20, preco: 120 },
    { descricao: 'Hospedagem (Anual)', qtd: 1, preco: 500 },
  ],
};

const pdfBytes = await criarNotaFiscal(dadosNota);
fs.writeFileSync('nota-fiscal.pdf', pdfBytes);
```

### Preenchedor de Formulário

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fs from 'fs';

async function preencherFormulario(caminhoModelo, dados) {
  const bytesModelo = fs.readFileSync(caminhoModelo);
  const pdfDoc = await PDFDocument.load(bytesModelo);
  const formulario = pdfDoc.getForm();

  // Preencher campos de texto
  Object.entries(dados.camposTexto || {}).forEach(([nome, valor]) => {
    try {
      const campo = formulario.getTextField(nome);
      campo.setText(String(valor));
    } catch (e) {
      console.warn(`Campo não encontrado: ${nome}`);
    }
  });

  // Marcar checkboxes
  (dados.checkboxes || []).forEach(nome => {
    try {
      const checkbox = formulario.getCheckBox(nome);
      checkbox.check();
    } catch (e) {
      console.warn(`Checkbox não encontrado: ${nome}`);
    }
  });

  // Selecionar dropdowns
  Object.entries(dados.dropdowns || {}).forEach(([nome, valor]) => {
    try {
      const dropdown = formulario.getDropdown(nome);
      dropdown.select(valor);
    } catch (e) {
      console.warn(`Dropdown não encontrado: ${nome}`);
    }
  });

  // Selecionar botões de rádio
  Object.entries(dados.gruposRadio || {}).forEach(([nome, valor]) => {
    try {
      const grupoRadio = formulario.getRadioGroup(nome);
      grupoRadio.select(valor);
    } catch (e) {
      console.warn(`Grupo de rádio não encontrado: ${nome}`);
    }
  });

  // Opcionalmente achatar
  if (dados.achatar) {
    formulario.flatten();
  }

  return pdfDoc.save();
}

// Uso
const dadosFormulario = {
  camposTexto: {
    'nome': 'João Silva',
    'email': 'joao@exemplo.com',
    'data': '2026-03-02',
  },
  checkboxes: ['termos_aceitos', 'newsletter'],
  dropdowns: {
    'pais': 'Brasil',
  },
  gruposRadio: {
    'genero': 'masculino',
  },
  achatar: true,
};

const pdfBytes = await preencherFormulario('modelo.pdf', dadosFormulario);
fs.writeFileSync('formulario-preenchido.pdf', pdfBytes);
```

---

## Suporte

- **Issues:** [GitHub Issues](https://github.com/Maxwbh/pdf-lib/issues)
- **Documentação Original:** [pdf-lib.js.org](https://pdf-lib.js.org/)
- **NPM:** [@maxwbh/pdf-lib](https://www.npmjs.com/package/@maxwbh/pdf-lib)

---

*Documentação para @maxwbh/pdf-lib v1.18.1*
