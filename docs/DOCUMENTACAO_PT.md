# pdf-lib - Documentação em Português

## Índice

1. [Introdução](#introdução)
2. [Instalação](#instalação)
3. [Criando um PDF](#criando-um-pdf)
4. [Carregando um PDF](#carregando-um-pdf)
5. [Criptografia de PDFs](#criptografia-de-pdfs)
6. [Salvamento Incremental](#salvamento-incremental)
7. [Trabalhando com Páginas](#trabalhando-com-páginas)
8. [Adicionando Texto](#adicionando-texto)
9. [Adicionando Imagens](#adicionando-imagens)
10. [Formulários](#formulários)
11. [Referência da API](#referência-da-api)

---

## Introdução

O **pdf-lib** é uma biblioteca JavaScript pura para criar e modificar documentos PDF em qualquer ambiente JavaScript (Node.js, navegadores, React Native, Deno, etc.).

### Principais Características

- **Criar** novos documentos PDF do zero
- **Modificar** documentos PDF existentes
- **Mesclar** múltiplos PDFs em um único documento
- **Dividir** um PDF em múltiplos documentos
- **Adicionar** texto, imagens e gráficos vetoriais
- **Preencher** formulários PDF
- **Criptografar** documentos com proteção por senha
- **Salvamento incremental** para preservar assinaturas digitais

---

## Instalação

### npm

```bash
npm install pdf-lib
```

### yarn

```bash
yarn add pdf-lib
```

### CDN

```html
<script src="https://unpkg.com/pdf-lib"></script>
```

---

## Criando um PDF

### Exemplo Básico

```javascript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function criarPDF() {
  // Cria um novo documento PDF
  const pdfDoc = await PDFDocument.create();

  // Adiciona uma página tamanho A4
  const pagina = pdfDoc.addPage();

  // Obtém as dimensões da página
  const { width, height } = pagina.getSize();

  // Incorpora uma fonte padrão
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Desenha texto na página
  pagina.drawText('Olá, Mundo!', {
    x: 50,
    y: height - 100,
    size: 24,
    font: fonte,
    color: rgb(0, 0, 0),
  });

  // Serializa o PDF para bytes
  const pdfBytes = await pdfDoc.save();

  // Salva ou usa os bytes...
  return pdfBytes;
}
```

### Tamanhos de Página Disponíveis

```javascript
import { PageSizes } from 'pdf-lib';

// Tamanhos predefinidos
pdfDoc.addPage(PageSizes.A4);        // 595.28 x 841.89 pts
pdfDoc.addPage(PageSizes.Letter);    // 612 x 792 pts
pdfDoc.addPage(PageSizes.Legal);     // 612 x 1008 pts

// Tamanho personalizado [largura, altura]
pdfDoc.addPage([500, 700]);
```

---

## Carregando um PDF

### A partir de Bytes

```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function carregarPDF() {
  // Lê os bytes do arquivo
  const bytesExistentes = fs.readFileSync('documento.pdf');

  // Carrega o documento
  const pdfDoc = await PDFDocument.load(bytesExistentes);

  // Modifica o documento...
  const paginas = pdfDoc.getPages();
  console.log(`O documento tem ${paginas.length} páginas`);

  return pdfDoc;
}
```

### A partir de Base64

```javascript
const base64String = 'JVBERi0xLjcK...'; // String base64
const pdfDoc = await PDFDocument.load(base64String);
```

### Opções de Carregamento

```javascript
const pdfDoc = await PDFDocument.load(bytes, {
  // Ignora erro se o PDF estiver criptografado
  ignoreEncryption: false,

  // Velocidade de parsing (Slow é mais preciso)
  parseSpeed: ParseSpeeds.Slow,

  // Lança erro em objetos inválidos
  throwOnInvalidObject: false,

  // Atualiza metadados automaticamente
  updateMetadata: true,

  // Senha para PDFs criptografados
  password: 'senha123',
});
```

---

## Criptografia de PDFs

### Visão Geral

O pdf-lib agora suporta criptografia e descriptografia de documentos PDF usando os algoritmos RC4 e AES.

### Níveis de Criptografia

| Versão | Algoritmo | Bits | Versão PDF |
|--------|-----------|------|------------|
| 1 | RC4 | 40 | PDF 1.1+ |
| 2 | RC4 | 128 | PDF 1.4+ |
| 4 | AES | 128 | PDF 1.5+ |
| 5 | AES | 256 | PDF 1.7+ |

### Criando um PDF Criptografado

```javascript
import { PDFDocument } from 'pdf-lib';

async function criarPDFCriptografado() {
  const pdfDoc = await PDFDocument.create();
  const pagina = pdfDoc.addPage();

  pagina.drawText('Documento Confidencial', {
    x: 50,
    y: 700,
    size: 20,
  });

  // Salva com criptografia AES-128
  const pdfBytes = await pdfDoc.save({
    encrypt: {
      // Senha para abrir o documento (pode ser vazia)
      userPassword: 'usuario123',

      // Senha do proprietário (acesso total)
      ownerPassword: 'proprietario456',

      // Permissões do documento
      permissions: {
        printing: true,           // Permite impressão
        printingHighQuality: true, // Permite impressão em alta qualidade
        modifying: false,         // Bloqueia modificações
        copying: false,           // Bloqueia cópia de texto
        annotating: true,         // Permite anotações
        fillingForms: true,       // Permite preencher formulários
        contentAccessibility: true, // Permite extração para acessibilidade
        documentAssembly: false,  // Bloqueia montagem de documento
      },

      // Versão da criptografia (1, 2, 4 ou 5)
      version: 4,
    },
  });

  return pdfBytes;
}
```

### Abrindo um PDF Criptografado

```javascript
import { PDFDocument } from 'pdf-lib';

async function abrirPDFCriptografado() {
  const bytesProtegidos = fs.readFileSync('protegido.pdf');

  // Fornece a senha nas opções de carregamento
  const pdfDoc = await PDFDocument.load(bytesProtegidos, {
    password: 'senha123',
  });

  // Agora você pode modificar o documento normalmente
  const paginas = pdfDoc.getPages();
  console.log(`Documento decriptado com ${paginas.length} páginas`);

  return pdfDoc;
}
```

### Permissões Disponíveis

| Permissão | Descrição |
|-----------|-----------|
| `printing` | Permite impressão do documento |
| `printingHighQuality` | Permite impressão em alta resolução |
| `modifying` | Permite modificar o conteúdo |
| `copying` | Permite copiar texto e imagens |
| `annotating` | Permite adicionar/modificar anotações |
| `fillingForms` | Permite preencher campos de formulário |
| `contentAccessibility` | Permite extração para leitores de tela |
| `documentAssembly` | Permite inserir/remover páginas |

---

## Salvamento Incremental

### O que é Salvamento Incremental?

O salvamento incremental adiciona modificações ao final do PDF original, sem reescrever todo o documento. Isso é essencial para:

- **Preservar assinaturas digitais** existentes
- **Manter a trilha de auditoria** do documento
- **Maior eficiência** com arquivos grandes

### Usando Salvamento Incremental

```javascript
import { PDFDocument } from 'pdf-lib';

async function modificarIncrementalmente() {
  // Carrega o PDF existente
  const bytesOriginais = fs.readFileSync('original.pdf');
  const pdfDoc = await PDFDocument.load(bytesOriginais);

  // IMPORTANTE: Cria um snapshot antes de modificar
  pdfDoc.takeSnapshot();

  // Faz as modificações necessárias
  const pagina = pdfDoc.getPage(0);
  pagina.drawText('Modificado em: ' + new Date().toISOString(), {
    x: 50,
    y: 50,
    size: 12,
  });

  // Marca a referência da página como modificada
  pdfDoc.markRefForSave(pagina.ref);

  // Salva incrementalmente
  const novosPdfBytes = await pdfDoc.saveIncremental();

  return novosPdfBytes;
}
```

### Quando Usar Salvamento Incremental

| Cenário | Método Recomendado |
|---------|-------------------|
| Adicionar assinatura digital | `saveIncremental()` |
| Preservar assinaturas existentes | `saveIncremental()` |
| Modificações em PDF grande | `saveIncremental()` |
| Criar PDF novo | `save()` |
| Reorganizar completamente | `save()` |

### Fluxo de Trabalho com Assinaturas

```javascript
async function assinarPDF() {
  const pdfDoc = await PDFDocument.load(bytesOriginais);

  // Cria snapshot do estado atual
  pdfDoc.takeSnapshot();

  // Adiciona campo de assinatura
  const form = pdfDoc.getForm();
  const signatureField = form.createSignature('assinatura');

  // Marca os objetos modificados
  pdfDoc.markRefForSave(signatureField.ref);

  // Salva incrementalmente (preserva qualquer assinatura existente)
  const pdfAssinado = await pdfDoc.saveIncremental();

  return pdfAssinado;
}
```

---

## Trabalhando com Páginas

### Obtendo Páginas

```javascript
// Obtém todas as páginas
const paginas = pdfDoc.getPages();

// Obtém uma página específica (índice base 0)
const primeiraPagina = pdfDoc.getPage(0);
const segundaPagina = pdfDoc.getPage(1);

// Número total de páginas
const totalPaginas = pdfDoc.getPageCount();
```

### Adicionando Páginas

```javascript
// Adiciona página no final
const novaPagina = pdfDoc.addPage();

// Adiciona página com tamanho específico
const paginaA5 = pdfDoc.addPage(PageSizes.A5);

// Insere página em posição específica
const paginaInserida = pdfDoc.insertPage(0); // No início
```

### Removendo Páginas

```javascript
// Remove a primeira página
pdfDoc.removePage(0);

// Remove a última página
pdfDoc.removePage(pdfDoc.getPageCount() - 1);
```

### Copiando Páginas entre Documentos

```javascript
const pdfOrigem = await PDFDocument.load(bytesOrigem);
const pdfDestino = await PDFDocument.create();

// Copia páginas específicas
const [pagina1, pagina3] = await pdfDestino.copyPages(pdfOrigem, [0, 2]);

// Adiciona as páginas copiadas
pdfDestino.addPage(pagina1);
pdfDestino.addPage(pagina3);
```

---

## Adicionando Texto

### Texto Simples

```javascript
pagina.drawText('Texto simples', {
  x: 50,
  y: 500,
  size: 12,
});
```

### Texto com Formatação

```javascript
import { rgb, StandardFonts } from 'pdf-lib';

const fonteNegrito = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

pagina.drawText('Texto Formatado', {
  x: 50,
  y: 500,
  size: 24,
  font: fonteNegrito,
  color: rgb(0.2, 0.4, 0.8),  // Azul
  rotate: degrees(0),
  opacity: 1,
});
```

### Fontes Personalizadas

```javascript
import fontkit from '@pdf-lib/fontkit';

// Registra fontkit para fontes personalizadas
pdfDoc.registerFontkit(fontkit);

// Carrega e incorpora a fonte
const fontBytes = fs.readFileSync('MinhaFonte.ttf');
const fontePersonalizada = await pdfDoc.embedFont(fontBytes);

pagina.drawText('Texto com fonte personalizada', {
  font: fontePersonalizada,
  size: 16,
});
```

---

## Adicionando Imagens

### Imagem PNG

```javascript
const imagemBytes = fs.readFileSync('imagem.png');
const imagem = await pdfDoc.embedPng(imagemBytes);

pagina.drawImage(imagem, {
  x: 50,
  y: 400,
  width: 200,
  height: 150,
});
```

### Imagem JPEG

```javascript
const jpgBytes = fs.readFileSync('foto.jpg');
const foto = await pdfDoc.embedJpg(jpgBytes);

// Desenha mantendo proporção original
const dims = foto.scale(0.5); // 50% do tamanho original

pagina.drawImage(foto, {
  x: 50,
  y: 300,
  width: dims.width,
  height: dims.height,
});
```

---

## Formulários

### Criando Campos de Texto

```javascript
const form = pdfDoc.getForm();

// Campo de texto
const campoNome = form.createTextField('nome');
campoNome.setText('João Silva');
campoNome.addToPage(pagina, {
  x: 50,
  y: 500,
  width: 200,
  height: 20,
});
```

### Checkbox

```javascript
const checkTermos = form.createCheckBox('aceito_termos');
checkTermos.check();
checkTermos.addToPage(pagina, {
  x: 50,
  y: 450,
  width: 15,
  height: 15,
});
```

### Preenchendo Formulários Existentes

```javascript
const pdfDoc = await PDFDocument.load(bytesFormulario);
const form = pdfDoc.getForm();

// Preenche campos pelo nome
form.getTextField('nome').setText('Maria Santos');
form.getTextField('email').setText('maria@email.com');
form.getCheckBox('newsletter').check();

// Torna os campos não editáveis
form.flatten();
```

---

## Referência da API

### PDFDocument

| Método | Descrição |
|--------|-----------|
| `create()` | Cria um novo documento PDF |
| `load(bytes, options)` | Carrega um PDF existente |
| `save(options)` | Serializa o documento para bytes |
| `saveAsBase64(options)` | Serializa para string base64 |
| `saveIncremental(options)` | Salva incrementalmente |
| `takeSnapshot()` | Cria snapshot para salvamento incremental |
| `markRefForSave(ref)` | Marca objeto como modificado |
| `addPage(size?)` | Adiciona nova página |
| `insertPage(index, size?)` | Insere página em posição |
| `removePage(index)` | Remove página |
| `getPages()` | Retorna array de páginas |
| `getPage(index)` | Retorna página específica |
| `getPageCount()` | Retorna número de páginas |
| `copyPages(srcDoc, indices)` | Copia páginas de outro documento |
| `embedFont(font)` | Incorpora fonte |
| `embedPng(bytes)` | Incorpora imagem PNG |
| `embedJpg(bytes)` | Incorpora imagem JPEG |
| `getForm()` | Retorna o formulário do documento |
| `setTitle(title)` | Define título do documento |
| `setAuthor(author)` | Define autor do documento |

### SaveOptions

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `useObjectStreams` | boolean | true | Usa object streams (PDF 1.5+) |
| `addDefaultPage` | boolean | true | Adiciona página se vazio |
| `objectsPerTick` | number | 50 | Objetos por tick (performance) |
| `updateFieldAppearances` | boolean | true | Atualiza aparência de campos |
| `encrypt` | EncryptOptions | undefined | Opções de criptografia |

### EncryptOptions

| Opção | Tipo | Descrição |
|-------|------|-----------|
| `userPassword` | string | Senha do usuário (pode ser vazia) |
| `ownerPassword` | string | Senha do proprietário (obrigatória) |
| `permissions` | PDFPermissions | Permissões do documento |
| `version` | 1 \| 2 \| 4 \| 5 | Versão da criptografia |

### LoadOptions

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `ignoreEncryption` | boolean | false | Ignora criptografia |
| `parseSpeed` | ParseSpeeds | Slow | Velocidade de parsing |
| `throwOnInvalidObject` | boolean | false | Erro em objetos inválidos |
| `updateMetadata` | boolean | true | Atualiza metadados |
| `password` | string | undefined | Senha para PDFs criptografados |

---

## Exemplos Completos

### Criar Relatório com Cabeçalho e Rodapé

```javascript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function criarRelatorio() {
  const pdfDoc = await PDFDocument.create();
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < 3; i++) {
    const pagina = pdfDoc.addPage();
    const { width, height } = pagina.getSize();

    // Cabeçalho
    pagina.drawText('Relatório Mensal', {
      x: 50,
      y: height - 50,
      size: 24,
      font: fonteNegrito,
    });

    // Conteúdo
    pagina.drawText(`Conteúdo da página ${i + 1}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font: fonte,
    });

    // Rodapé
    pagina.drawText(`Página ${i + 1} de 3`, {
      x: width / 2 - 30,
      y: 30,
      size: 10,
      font: fonte,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return await pdfDoc.save();
}
```

### Mesclar Múltiplos PDFs

```javascript
async function mesclarPDFs(listaBytes) {
  const pdfMesclado = await PDFDocument.create();

  for (const bytes of listaBytes) {
    const pdfOrigem = await PDFDocument.load(bytes);
    const indices = pdfOrigem.getPageIndices();
    const paginasCopiar = await pdfMesclado.copyPages(pdfOrigem, indices);

    for (const pagina of paginasCopiar) {
      pdfMesclado.addPage(pagina);
    }
  }

  return await pdfMesclado.save();
}
```

---

## Suporte e Contribuição

Para reportar problemas ou contribuir com o projeto:
- GitHub: https://github.com/Hopding/pdf-lib
- Issues: https://github.com/Hopding/pdf-lib/issues

---

*Documentação atualizada em 2026-01-31*
