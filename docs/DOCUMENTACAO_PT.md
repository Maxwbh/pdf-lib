# @maxwbh/pdf-lib

## Documentação Completa em Português

[![NPM Version](https://img.shields.io/npm/v/@maxwbh/pdf-lib.svg?style=flat-square)](https://www.npmjs.com/package/@maxwbh/pdf-lib)
[![NPM Downloads](https://img.shields.io/npm/dm/@maxwbh/pdf-lib.svg?style=flat-square)](https://www.npmjs.com/package/@maxwbh/pdf-lib)
[![License](https://img.shields.io/npm/l/@maxwbh/pdf-lib.svg?style=flat-square)](https://github.com/Maxwbh/pdf-lib/blob/master/LICENSE.md)

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Início Rápido](#início-rápido)
4. [Criando PDFs](#criando-pdfs)
5. [Carregando PDFs](#carregando-pdfs)
6. [Criptografia](#criptografia)
7. [Salvamento Incremental](#salvamento-incremental)
8. [Manipulação de Páginas](#manipulação-de-páginas)
9. [Texto e Fontes](#texto-e-fontes)
10. [Imagens](#imagens)
11. [Hyperlinks](#hyperlinks)
12. [Formulários](#formulários)
13. [Casos de Uso](#casos-de-uso)
14. [Referência da API](#referência-da-api)
15. [Resolução de Problemas](#resolução-de-problemas)

---

## Visão Geral

### O que é @maxwbh/pdf-lib?

O **@maxwbh/pdf-lib** é uma biblioteca JavaScript/TypeScript para criação e manipulação de documentos PDF. É um fork estendido do [pdf-lib](https://github.com/Hopding/pdf-lib) original, com funcionalidades adicionais:

| Funcionalidade | Descrição |
|----------------|-----------|
| **Criptografia** | Proteja PDFs com senha (RC4/AES 40-256 bits) |
| **Descriptografia** | Abra PDFs protegidos por senha |
| **Salvamento Incremental** | Preserve assinaturas digitais ao modificar |
| **Hyperlinks** | Adicione links clicáveis (URLs e navegação interna) |

### Por que usar @maxwbh/pdf-lib?

- **100% JavaScript** - Não requer binários nativos ou dependências externas
- **Multiplataforma** - Funciona em Node.js, browsers, React Native e Deno
- **TypeScript** - Tipagem completa para melhor experiência de desenvolvimento
- **Leve** - Bundle minificado de ~300KB
- **Compatível** - API compatível com o pdf-lib original

### Compatibilidade

| Ambiente | Versão Mínima |
|----------|---------------|
| Node.js | 14+ (recomendado 18+) |
| Browsers | Chrome 60+, Firefox 55+, Safari 11+, Edge 79+ |
| TypeScript | 4.0+ |
| Deno | 1.0+ |

---

## Instalação

### NPM (Recomendado)

```bash
npm install @maxwbh/pdf-lib
```

### Yarn

```bash
yarn add @maxwbh/pdf-lib
```

### PNPM

```bash
pnpm add @maxwbh/pdf-lib
```

### CDN (Browser)

```html
<!-- Produção (minificado) -->
<script src="https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib@1.18.0/dist/pdf-lib.min.js"></script>

<!-- Desenvolvimento (com sourcemaps) -->
<script src="https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib@1.18.0/dist/pdf-lib.js"></script>
```

### Migrando do pdf-lib Original

Se você já utiliza o `pdf-lib`, a migração é simples:

```bash
# 1. Remova o pacote antigo
npm uninstall pdf-lib

# 2. Instale o novo pacote
npm install @maxwbh/pdf-lib
```

```javascript
// 3. Atualize seus imports
// ANTES:
import { PDFDocument } from 'pdf-lib';

// DEPOIS:
import { PDFDocument } from '@maxwbh/pdf-lib';
```

> **Nota**: A API é 100% compatível. Nenhuma alteração de código é necessária além dos imports.

---

## Início Rápido

### Exemplo 1: Criar um PDF Simples

```javascript
import { PDFDocument, StandardFonts, rgb } from '@maxwbh/pdf-lib';

async function criarPDFSimples() {
  // 1. Criar documento
  const pdfDoc = await PDFDocument.create();

  // 2. Adicionar página
  const pagina = pdfDoc.addPage([595, 842]); // A4

  // 3. Carregar fonte
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 4. Escrever texto
  pagina.drawText('Meu Primeiro PDF!', {
    x: 50,
    y: 750,
    size: 30,
    font: fonte,
    color: rgb(0, 0.53, 0.71),
  });

  // 5. Salvar
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}
```

### Exemplo 2: Modificar um PDF Existente

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fs from 'fs';

async function modificarPDF() {
  // 1. Carregar PDF existente
  const pdfExistente = fs.readFileSync('documento.pdf');
  const pdfDoc = await PDFDocument.load(pdfExistente);

  // 2. Obter primeira página
  const pagina = pdfDoc.getPages()[0];

  // 3. Adicionar marca d'água
  pagina.drawText('CONFIDENCIAL', {
    x: 150,
    y: 400,
    size: 50,
    opacity: 0.3,
  });

  // 4. Salvar
  const pdfModificado = await pdfDoc.save();
  fs.writeFileSync('documento_modificado.pdf', pdfModificado);
}
```

### Exemplo 3: PDF com Proteção por Senha

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

async function criarPDFProtegido() {
  const pdfDoc = await PDFDocument.create();
  const pagina = pdfDoc.addPage();

  pagina.drawText('Documento Confidencial', { x: 50, y: 700, size: 20 });

  // Salvar com criptografia
  const pdfBytes = await pdfDoc.save({
    encrypt: {
      userPassword: 'senha123',
      ownerPassword: 'admin456',
      permissions: {
        printing: true,
        copying: false,
        modifying: false,
      },
    },
  });

  return pdfBytes;
}
```

---

## Criando PDFs

### Documento Básico

```javascript
import { PDFDocument, PageSizes } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();

// Página com tamanho padrão (Letter)
const pagina1 = pdfDoc.addPage();

// Página A4
const pagina2 = pdfDoc.addPage(PageSizes.A4);

// Página personalizada [largura, altura] em pontos
const pagina3 = pdfDoc.addPage([500, 700]);
```

### Tamanhos de Página Disponíveis

| Constante | Dimensões (pontos) | Dimensões (mm) |
|-----------|-------------------|----------------|
| `PageSizes.A0` | 2384 x 3370 | 841 x 1189 |
| `PageSizes.A1` | 1684 x 2384 | 594 x 841 |
| `PageSizes.A2` | 1191 x 1684 | 420 x 594 |
| `PageSizes.A3` | 842 x 1191 | 297 x 420 |
| `PageSizes.A4` | 595 x 842 | 210 x 297 |
| `PageSizes.A5` | 420 x 595 | 148 x 210 |
| `PageSizes.A6` | 298 x 420 | 105 x 148 |
| `PageSizes.Letter` | 612 x 792 | 216 x 279 |
| `PageSizes.Legal` | 612 x 1008 | 216 x 356 |

> **Conversão**: 1 ponto = 1/72 polegada ≈ 0.353 mm

### Metadados do Documento

```javascript
pdfDoc.setTitle('Relatório Anual 2026');
pdfDoc.setAuthor('Maxwell Oliveira');
pdfDoc.setSubject('Análise Financeira');
pdfDoc.setKeywords(['relatório', 'financeiro', '2026']);
pdfDoc.setProducer('@maxwbh/pdf-lib');
pdfDoc.setCreator('Minha Aplicação');
pdfDoc.setCreationDate(new Date());
pdfDoc.setModificationDate(new Date());
```

---

## Carregando PDFs

### A partir de Arquivo (Node.js)

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fs from 'fs';

const bytesDoArquivo = fs.readFileSync('documento.pdf');
const pdfDoc = await PDFDocument.load(bytesDoArquivo);
```

### A partir de URL (Browser)

```javascript
const url = 'https://exemplo.com/documento.pdf';
const resposta = await fetch(url);
const bytesDoArquivo = await resposta.arrayBuffer();
const pdfDoc = await PDFDocument.load(bytesDoArquivo);
```

### A partir de Base64

```javascript
const base64String = 'JVBERi0xLjcKCjEgMCBvYmo...';
const pdfDoc = await PDFDocument.load(base64String);
```

### A partir de Input File (Browser)

```javascript
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const arquivo = e.target.files[0];
  const bytes = await arquivo.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  console.log(`Carregado: ${pdfDoc.getPageCount()} páginas`);
});
```

### Opções de Carregamento

```javascript
const pdfDoc = await PDFDocument.load(bytes, {
  // Senha para PDFs criptografados
  password: 'minhasenha',

  // Ignorar erro de criptografia (carrega sem decriptar)
  ignoreEncryption: false,

  // Lançar erro em objetos malformados
  throwOnInvalidObject: false,

  // Atualizar metadados automaticamente
  updateMetadata: true,
});
```

### Salvando e Baixando PDFs

#### Salvar no Node.js

```javascript
import fs from 'fs';

const pdfBytes = await pdfDoc.save();
fs.writeFileSync('documento.pdf', pdfBytes);
```

#### Baixar no Browser

```javascript
// Salvar o PDF
const pdfBytes = await pdfDoc.save();

// Criar Blob e URL
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

// Criar link e disparar download
const link = document.createElement('a');
link.href = url;
link.download = 'documento.pdf';
link.click();

// Liberar memória
URL.revokeObjectURL(url);
```

#### Abrir em Nova Aba (Browser)

```javascript
const pdfBytes = await pdfDoc.save();
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

// Abrir em nova aba
window.open(url, '_blank');
```

#### Exibir em iframe (Browser)

```javascript
const pdfBytes = await pdfDoc.save();
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

// Exibir em iframe
const iframe = document.getElementById('pdf-viewer');
iframe.src = url;
```

#### Salvar como Base64

```javascript
const pdfBase64 = await pdfDoc.saveAsBase64();

// Com data URI (útil para emails, APIs, etc.)
const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
// Resultado: "data:application/pdf;base64,JVBERi0xLj..."
```

---

## Criptografia

### Visão Geral da Criptografia

O @maxwbh/pdf-lib suporta os padrões de criptografia PDF:

| Versão | Algoritmo | Segurança | Compatibilidade |
|--------|-----------|-----------|-----------------|
| 1 | RC4-40 | Baixa | PDF 1.1+ (universal) |
| 2 | RC4-128 | Média | PDF 1.4+ |
| 4 | AES-128 | Alta | PDF 1.5+ |
| 5 | AES-256 | Muito Alta | PDF 1.7+ |

> **Recomendação**: Use versão 4 (AES-128) para equilíbrio entre segurança e compatibilidade.

### Criando PDF Criptografado

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

async function criarPDFSeguro() {
  const pdfDoc = await PDFDocument.create();
  const pagina = pdfDoc.addPage();

  pagina.drawText('Informação Confidencial', {
    x: 50,
    y: 700,
    size: 18,
  });

  const pdfBytes = await pdfDoc.save({
    encrypt: {
      // Senha para abrir o documento (pode ser vazia para acesso livre)
      userPassword: 'usuario123',

      // Senha do proprietário (acesso total, obrigatória)
      ownerPassword: 'admin456',

      // Controle de permissões
      permissions: {
        printing: true,              // Permitir impressão
        printingHighQuality: true,   // Permitir impressão em alta qualidade
        modifying: false,            // Bloquear modificações
        copying: false,              // Bloquear cópia de texto
        annotating: true,            // Permitir anotações
        fillingForms: true,          // Permitir preenchimento de formulários
        contentAccessibility: true,  // Permitir extração para acessibilidade
        documentAssembly: false,     // Bloquear montagem do documento
      },

      // Versão da criptografia (1, 2, 4 ou 5)
      version: 4, // AES-128
    },
  });

  return pdfBytes;
}
```

### Abrindo PDF Criptografado

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

async function abrirPDFProtegido(bytes, senha) {
  try {
    const pdfDoc = await PDFDocument.load(bytes, {
      password: senha,
    });

    console.log('PDF aberto com sucesso!');
    console.log(`Páginas: ${pdfDoc.getPageCount()}`);

    return pdfDoc;
  } catch (erro) {
    if (erro.message.includes('password')) {
      throw new Error('Senha incorreta');
    }
    throw erro;
  }
}
```

### Tabela de Permissões

| Permissão | Descrição | Padrão |
|-----------|-----------|--------|
| `printing` | Impressão básica | true |
| `printingHighQuality` | Impressão em alta resolução | true |
| `modifying` | Modificar conteúdo | false |
| `copying` | Copiar texto/imagens | false |
| `annotating` | Adicionar anotações | true |
| `fillingForms` | Preencher formulários | true |
| `contentAccessibility` | Acesso para leitores de tela | true |
| `documentAssembly` | Inserir/remover páginas | false |

---

## Salvamento Incremental

### O que é Salvamento Incremental?

O salvamento incremental adiciona as modificações ao final do PDF original, sem reescrever o documento inteiro. Isso é essencial para:

- **Preservar assinaturas digitais** - Modificações não invalidam assinaturas existentes
- **Manter histórico** - Cada modificação é registrada separadamente
- **Eficiência** - Arquivos grandes são salvos mais rapidamente

### Quando Usar

| Cenário | Método |
|---------|--------|
| Adicionar assinatura digital | `saveIncremental()` |
| Modificar PDF já assinado | `saveIncremental()` |
| Preencher formulário em PDF assinado | `saveIncremental()` |
| Criar PDF novo | `save()` |
| Reorganizar páginas | `save()` |

### Como Usar

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

async function modificarComPreservacao(bytesOriginais) {
  // 1. Carregar o documento
  const pdfDoc = await PDFDocument.load(bytesOriginais);

  // 2. IMPORTANTE: Criar snapshot antes de modificar
  pdfDoc.takeSnapshot();

  // 3. Fazer modificações
  const pagina = pdfDoc.getPage(0);
  pagina.drawText('Documento revisado em: ' + new Date().toLocaleDateString('pt-BR'), {
    x: 50,
    y: 50,
    size: 10,
  });

  // 4. Marcar objetos modificados
  pdfDoc.markRefForSave(pagina.ref);

  // 5. Salvar incrementalmente
  const pdfModificado = await pdfDoc.saveIncremental();

  return pdfModificado;
}
```

### Fluxo Completo com Formulário Assinado

```javascript
async function preencherFormularioAssinado(bytesOriginais) {
  const pdfDoc = await PDFDocument.load(bytesOriginais);

  // Snapshot antes de modificar
  pdfDoc.takeSnapshot();

  // Preencher campos
  const form = pdfDoc.getForm();
  const campoData = form.getTextField('data_assinatura');
  campoData.setText(new Date().toLocaleDateString('pt-BR'));

  // Marcar campo como modificado
  pdfDoc.markRefForSave(campoData.ref);

  // Salvar preservando assinaturas
  return await pdfDoc.saveIncremental();
}
```

---

## Manipulação de Páginas

### Obter Informações das Páginas

```javascript
// Total de páginas
const totalPaginas = pdfDoc.getPageCount();

// Array de todas as páginas
const todasPaginas = pdfDoc.getPages();

// Página específica (índice começa em 0)
const primeiraPagina = pdfDoc.getPage(0);
const ultimaPagina = pdfDoc.getPage(pdfDoc.getPageCount() - 1);

// Dimensões da página
const { width, height } = primeiraPagina.getSize();
console.log(`Largura: ${width}pt, Altura: ${height}pt`);

// Rotação da página
const rotacao = primeiraPagina.getRotation().angle; // 0, 90, 180 ou 270
```

### Adicionar Páginas

```javascript
import { PageSizes } from '@maxwbh/pdf-lib';

// Adicionar no final
const novaPagina = pdfDoc.addPage();

// Adicionar com tamanho específico
const paginaA4 = pdfDoc.addPage(PageSizes.A4);

// Adicionar com dimensões personalizadas
const paginaCustom = pdfDoc.addPage([400, 600]);

// Inserir em posição específica
const paginaNoInicio = pdfDoc.insertPage(0); // Primeira posição
const paginaNoMeio = pdfDoc.insertPage(2);   // Terceira posição
```

### Remover Páginas

```javascript
// Remover por índice
pdfDoc.removePage(0);  // Remove primeira página
pdfDoc.removePage(pdfDoc.getPageCount() - 1);  // Remove última

// Remover múltiplas (do final para o início para manter índices)
const indicesParaRemover = [4, 2, 1];
indicesParaRemover.sort((a, b) => b - a); // Ordenar decrescente
for (const indice of indicesParaRemover) {
  pdfDoc.removePage(indice);
}
```

### Copiar Páginas entre Documentos

```javascript
async function copiarPaginas() {
  const pdfOrigem = await PDFDocument.load(bytesOrigem);
  const pdfDestino = await PDFDocument.create();

  // Copiar páginas específicas (índices 0, 2 e 4)
  const paginasCopiar = await pdfDestino.copyPages(pdfOrigem, [0, 2, 4]);

  // Adicionar páginas copiadas
  for (const pagina of paginasCopiar) {
    pdfDestino.addPage(pagina);
  }

  return await pdfDestino.save();
}
```

### Mesclar PDFs

```javascript
async function mesclarPDFs(listaDeBytes) {
  const pdfMesclado = await PDFDocument.create();

  for (const bytes of listaDeBytes) {
    const pdfOrigem = await PDFDocument.load(bytes);
    const paginas = await pdfMesclado.copyPages(pdfOrigem, pdfOrigem.getPageIndices());

    for (const pagina of paginas) {
      pdfMesclado.addPage(pagina);
    }
  }

  return await pdfMesclado.save();
}

// Uso
const pdf1 = fs.readFileSync('documento1.pdf');
const pdf2 = fs.readFileSync('documento2.pdf');
const pdfMesclado = await mesclarPDFs([pdf1, pdf2]);
```

### Dividir PDF

```javascript
async function dividirPDF(bytes, paginasPorArquivo) {
  const pdfOrigem = await PDFDocument.load(bytes);
  const totalPaginas = pdfOrigem.getPageCount();
  const arquivos = [];

  for (let i = 0; i < totalPaginas; i += paginasPorArquivo) {
    const pdfNovo = await PDFDocument.create();
    const fim = Math.min(i + paginasPorArquivo, totalPaginas);
    const indices = Array.from({ length: fim - i }, (_, j) => i + j);

    const paginas = await pdfNovo.copyPages(pdfOrigem, indices);
    for (const pagina of paginas) {
      pdfNovo.addPage(pagina);
    }

    arquivos.push(await pdfNovo.save());
  }

  return arquivos;
}

// Uso: dividir em arquivos de 10 páginas cada
const partes = await dividirPDF(bytesDoArquivo, 10);
```

---

## Texto e Fontes

### Fontes Padrão (Standard 14)

Estas fontes não precisam ser incorporadas:

```javascript
import { StandardFonts } from '@maxwbh/pdf-lib';

const fontesDisponiveis = [
  StandardFonts.Courier,
  StandardFonts.CourierBold,
  StandardFonts.CourierOblique,
  StandardFonts.CourierBoldOblique,
  StandardFonts.Helvetica,
  StandardFonts.HelveticaBold,
  StandardFonts.HelveticaOblique,
  StandardFonts.HelveticaBoldOblique,
  StandardFonts.TimesRoman,
  StandardFonts.TimesRomanBold,
  StandardFonts.TimesRomanItalic,
  StandardFonts.TimesRomanBoldItalic,
  StandardFonts.Symbol,
  StandardFonts.ZapfDingbats,
];

// Carregar fonte padrão
const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
```

### Fontes Personalizadas

```javascript
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';

// 1. Registrar fontkit (necessário para fontes TTF/OTF)
pdfDoc.registerFontkit(fontkit);

// 2. Carregar fonte
const fontBytes = fs.readFileSync('MinhaFonte.ttf');
const fontePersonalizada = await pdfDoc.embedFont(fontBytes);

// 3. Usar fonte
pagina.drawText('Texto com fonte personalizada', {
  font: fontePersonalizada,
  size: 16,
});
```

### Desenhar Texto

```javascript
import { rgb, degrees } from '@maxwbh/pdf-lib';

pagina.drawText('Texto Simples', {
  x: 50,
  y: 700,
  size: 12,
});

// Texto formatado
pagina.drawText('Texto Formatado', {
  x: 50,
  y: 650,
  size: 24,
  font: fonteNegrito,
  color: rgb(0.2, 0.4, 0.8),      // Cor RGB (0-1)
  opacity: 0.8,                    // Transparência
  rotate: degrees(0),              // Rotação
  lineHeight: 18,                  // Altura da linha
  maxWidth: 200,                   // Largura máxima (quebra linha)
});
```

### Medir Texto

```javascript
const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
const texto = 'Olá, Mundo!';
const tamanho = 12;

const largura = fonte.widthOfTextAtSize(texto, tamanho);
const altura = fonte.heightAtSize(tamanho);

console.log(`Largura: ${largura}pt, Altura: ${altura}pt`);
```

### Texto Multilinha

```javascript
const texto = `Primeira linha
Segunda linha
Terceira linha`;

pagina.drawText(texto, {
  x: 50,
  y: 700,
  size: 12,
  lineHeight: 18,
  maxWidth: 400,
});
```

---

## Imagens

### Incorporar PNG

```javascript
const pngBytes = fs.readFileSync('imagem.png');
const pngImage = await pdfDoc.embedPng(pngBytes);

pagina.drawImage(pngImage, {
  x: 50,
  y: 500,
  width: 200,
  height: 150,
});
```

### Incorporar JPEG

```javascript
const jpgBytes = fs.readFileSync('foto.jpg');
const jpgImage = await pdfDoc.embedJpg(jpgBytes);

// Manter proporção original (50% do tamanho)
const dims = jpgImage.scale(0.5);
pagina.drawImage(jpgImage, {
  x: 50,
  y: 400,
  width: dims.width,
  height: dims.height,
});
```

### Opções de Desenho de Imagem

```javascript
pagina.drawImage(imagem, {
  x: 50,              // Posição X (canto inferior esquerdo)
  y: 400,             // Posição Y (canto inferior esquerdo)
  width: 200,         // Largura
  height: 150,        // Altura
  opacity: 0.8,       // Transparência (0-1)
  rotate: degrees(45), // Rotação
  xSkew: degrees(0),   // Inclinação X
  ySkew: degrees(0),   // Inclinação Y
});
```

### Imagem de URL (Browser)

```javascript
async function incorporarImagemDeURL(pdfDoc, url) {
  const response = await fetch(url);
  const imageBytes = await response.arrayBuffer();

  // Detectar tipo
  if (url.endsWith('.png')) {
    return await pdfDoc.embedPng(imageBytes);
  } else {
    return await pdfDoc.embedJpg(imageBytes);
  }
}
```

---

## Hyperlinks

### Link para URL Externa

```javascript
import { rgb } from '@maxwbh/pdf-lib';

// Primeiro, desenhe o texto
pagina.drawText('Clique aqui para visitar', {
  x: 50,
  y: 700,
  size: 14,
  color: rgb(0, 0, 0.8),
});

// Depois, adicione o link sobre o texto
pagina.drawLink({
  url: 'https://github.com/Maxwbh/pdf-lib',
  x: 50,
  y: 695,
  width: 180,
  height: 20,
  borderColor: rgb(0, 0, 1),
  borderWidth: 1,
});
```

### Link para Página Interna

```javascript
// Criar documento com múltiplas páginas
const pagina1 = pdfDoc.addPage();
const pagina2 = pdfDoc.addPage();

// Na página 1, criar link para página 2
pagina1.drawText('Ir para próxima página →', { x: 50, y: 700, size: 14 });

pagina1.drawLink({
  pageRef: pagina2.ref,
  x: 50,
  y: 695,
  width: 180,
  height: 20,
  destX: 0,
  destY: 842,  // Topo da página
  destZoom: 1,
});
```

### Sumário com Links

```javascript
async function criarSumario(pdfDoc, capitulos) {
  const pagSumario = pdfDoc.insertPage(0);
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pagSumario.drawText('SUMÁRIO', { x: 250, y: 750, size: 20, font: fonte });

  let y = 700;
  for (const cap of capitulos) {
    // Texto do capítulo
    pagSumario.drawText(`${cap.titulo} ........... ${cap.pagina}`, {
      x: 50,
      y,
      size: 12,
      font: fonte,
    });

    // Link para a página
    pagSumario.drawLink({
      pageRef: pdfDoc.getPage(cap.pagina - 1).ref,
      x: 50,
      y: y - 5,
      width: 400,
      height: 18,
    });

    y -= 25;
  }
}

// Uso
await criarSumario(pdfDoc, [
  { titulo: 'Introdução', pagina: 2 },
  { titulo: 'Metodologia', pagina: 5 },
  { titulo: 'Resultados', pagina: 10 },
]);
```

---

## Formulários

### Criar Campo de Texto

```javascript
const form = pdfDoc.getForm();

const campoNome = form.createTextField('nome_completo');
campoNome.setText('');
campoNome.addToPage(pagina, {
  x: 100,
  y: 600,
  width: 250,
  height: 25,
  borderWidth: 1,
});
```

### Criar Checkbox

```javascript
const checkTermos = form.createCheckBox('aceito_termos');
checkTermos.addToPage(pagina, {
  x: 50,
  y: 550,
  width: 15,
  height: 15,
});
```

### Criar Dropdown

```javascript
const dropdown = form.createDropdown('estado');
dropdown.addOptions(['SP', 'RJ', 'MG', 'RS', 'PR']);
dropdown.select('SP');
dropdown.addToPage(pagina, {
  x: 100,
  y: 500,
  width: 100,
  height: 25,
});
```

### Preencher Formulário Existente

```javascript
const pdfDoc = await PDFDocument.load(bytesFormulario);
const form = pdfDoc.getForm();

// Obter e preencher campos
form.getTextField('nome').setText('João Silva');
form.getTextField('email').setText('joao@email.com');
form.getCheckBox('newsletter').check();
form.getDropdown('pais').select('Brasil');

// Opcional: tornar campos não editáveis
form.flatten();

const pdfPreenchido = await pdfDoc.save();
```

### Listar Campos do Formulário

```javascript
const form = pdfDoc.getForm();
const campos = form.getFields();

for (const campo of campos) {
  const tipo = campo.constructor.name;
  const nome = campo.getName();
  console.log(`${nome}: ${tipo}`);
}
```

---

## Casos de Uso

### Gerar Certificado

```javascript
async function gerarCertificado(nome, curso, data) {
  const pdfDoc = await PDFDocument.create();
  const pagina = pdfDoc.addPage([842, 595]); // A4 Paisagem

  const fonteNormal = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fonteNegrito = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Título
  pagina.drawText('CERTIFICADO', {
    x: 320,
    y: 500,
    size: 40,
    font: fonteNegrito,
  });

  // Texto
  pagina.drawText(`Certificamos que ${nome}`, {
    x: 150,
    y: 400,
    size: 18,
    font: fonteNormal,
  });

  pagina.drawText(`concluiu com êxito o curso de ${curso}`, {
    x: 150,
    y: 370,
    size: 18,
    font: fonteNormal,
  });

  pagina.drawText(`em ${data}`, {
    x: 350,
    y: 300,
    size: 14,
    font: fonteNormal,
  });

  return await pdfDoc.save();
}
```

### Relatório com Tabela

```javascript
async function criarRelatorioComTabela(dados) {
  const pdfDoc = await PDFDocument.create();
  const pagina = pdfDoc.addPage(PageSizes.A4);
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = pagina.getSize();

  // Título
  pagina.drawText('Relatório de Vendas', {
    x: 50,
    y: height - 50,
    size: 24,
    font: fonteNegrito,
  });

  // Cabeçalho da tabela
  const colunas = ['Produto', 'Quantidade', 'Valor'];
  const larguras = [200, 100, 100];
  let x = 50;
  let y = height - 100;

  for (let i = 0; i < colunas.length; i++) {
    pagina.drawText(colunas[i], { x, y, size: 12, font: fonteNegrito });
    pagina.drawLine({
      start: { x, y: y - 5 },
      end: { x: x + larguras[i], y: y - 5 },
      thickness: 1,
    });
    x += larguras[i];
  }

  // Dados
  y -= 25;
  for (const linha of dados) {
    x = 50;
    pagina.drawText(linha.produto, { x, y, size: 11, font: fonte });
    x += larguras[0];
    pagina.drawText(String(linha.quantidade), { x, y, size: 11, font: fonte });
    x += larguras[1];
    pagina.drawText(`R$ ${linha.valor.toFixed(2)}`, { x, y, size: 11, font: fonte });
    y -= 20;
  }

  return await pdfDoc.save();
}
```

### Adicionar Marca D'água

```javascript
async function adicionarMarcaDagua(bytesOriginal, texto) {
  const pdfDoc = await PDFDocument.load(bytesOriginal);
  const fonte = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const pagina of pdfDoc.getPages()) {
    const { width, height } = pagina.getSize();

    pagina.drawText(texto, {
      x: width / 2 - 100,
      y: height / 2,
      size: 50,
      font: fonte,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.3,
      rotate: degrees(-45),
    });
  }

  return await pdfDoc.save();
}
```

### Numerar Páginas

```javascript
async function numerarPaginas(bytesOriginal) {
  const pdfDoc = await PDFDocument.load(bytesOriginal);
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const paginas = pdfDoc.getPages();
  const total = paginas.length;

  paginas.forEach((pagina, i) => {
    const { width } = pagina.getSize();
    pagina.drawText(`Página ${i + 1} de ${total}`, {
      x: width / 2 - 40,
      y: 20,
      size: 10,
      font: fonte,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  return await pdfDoc.save();
}
```

---

## Referência da API

### PDFDocument

| Método | Retorno | Descrição |
|--------|---------|-----------|
| `create()` | `Promise<PDFDocument>` | Cria novo documento |
| `load(data, options?)` | `Promise<PDFDocument>` | Carrega PDF existente |
| `save(options?)` | `Promise<Uint8Array>` | Salva para bytes |
| `saveAsBase64(options?)` | `Promise<string>` | Salva como Base64 |
| `saveIncremental()` | `Promise<Uint8Array>` | Salva incrementalmente |
| `takeSnapshot()` | `void` | Cria snapshot para salvar incremental |
| `markRefForSave(ref)` | `void` | Marca referência como modificada |
| `addPage(size?)` | `PDFPage` | Adiciona página |
| `insertPage(index, size?)` | `PDFPage` | Insere página |
| `removePage(index)` | `void` | Remove página |
| `getPages()` | `PDFPage[]` | Retorna todas páginas |
| `getPage(index)` | `PDFPage` | Retorna página específica |
| `getPageCount()` | `number` | Número de páginas |
| `getPageIndices()` | `number[]` | Índices das páginas |
| `copyPages(src, indices)` | `Promise<PDFPage[]>` | Copia páginas |
| `embedFont(font)` | `Promise<PDFFont>` | Incorpora fonte |
| `embedPng(bytes)` | `Promise<PDFImage>` | Incorpora PNG |
| `embedJpg(bytes)` | `Promise<PDFImage>` | Incorpora JPEG |
| `getForm()` | `PDFForm` | Retorna formulário |

### PDFPage

| Método | Descrição |
|--------|-----------|
| `getSize()` | Retorna `{ width, height }` |
| `setSize(width, height)` | Define tamanho |
| `getRotation()` | Retorna rotação |
| `setRotation(angle)` | Define rotação |
| `drawText(text, options)` | Desenha texto |
| `drawImage(image, options)` | Desenha imagem |
| `drawLine(options)` | Desenha linha |
| `drawRectangle(options)` | Desenha retângulo |
| `drawCircle(options)` | Desenha círculo |
| `drawEllipse(options)` | Desenha elipse |
| `drawSvgPath(path, options)` | Desenha caminho SVG |
| `drawLink(options)` | Adiciona hyperlink |

### Opções de Criptografia

```typescript
interface EncryptOptions {
  userPassword?: string;     // Senha do usuário
  ownerPassword: string;     // Senha do proprietário (obrigatória)
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
  version?: 1 | 2 | 4 | 5;   // Versão da criptografia
}
```

---

## Resolução de Problemas

### Erro: "PDF is encrypted"

```javascript
// Solução: Forneça a senha
const pdfDoc = await PDFDocument.load(bytes, {
  password: 'suasenha',
});
```

### Erro: "No pages found"

```javascript
// Solução: Adicione pelo menos uma página
const pdfDoc = await PDFDocument.create();
pdfDoc.addPage(); // Necessário antes de salvar
```

### Fontes não aparecem corretamente

```javascript
// Solução: Registre fontkit para fontes personalizadas
import fontkit from '@pdf-lib/fontkit';
pdfDoc.registerFontkit(fontkit);
```

### Caracteres especiais não aparecem

```javascript
// Solução: Use fonte que suporte os caracteres
import fontkit from '@pdf-lib/fontkit';
pdfDoc.registerFontkit(fontkit);

const fonteUnicode = await pdfDoc.embedFont(fontBytes, { subset: false });
```

### PDF muito grande

```javascript
// Solução: Use object streams
const pdfBytes = await pdfDoc.save({
  useObjectStreams: true,
});
```

---

## Suporte

- **Repositório**: https://github.com/Maxwbh/pdf-lib
- **Issues**: https://github.com/Maxwbh/pdf-lib/issues
- **NPM**: https://www.npmjs.com/package/@maxwbh/pdf-lib

---

*Documentação atualizada em Fevereiro de 2026*
*Versão: 1.18.0*
