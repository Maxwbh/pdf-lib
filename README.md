<h1 align="center">@maxwbh/pdf-lib</h1>

<div align="center">
  <strong>Create and modify PDF documents in any JavaScript environment</strong><br/>
  Extended fork with <b>encryption</b>, <b>incremental save</b>, and <b>hyperlinks</b>
</div>

<br/>

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@maxwbh/pdf-lib.svg?style=flat-square)](https://www.npmjs.com/package/@maxwbh/pdf-lib)
[![NPM Downloads](https://img.shields.io/npm/dm/@maxwbh/pdf-lib.svg?style=flat-square)](https://www.npmjs.com/package/@maxwbh/pdf-lib)
[![License](https://img.shields.io/npm/l/@maxwbh/pdf-lib.svg?style=flat-square)](LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square)](https://www.typescriptlang.org/)

**[Documentação em Português → README.pt-BR.md](README.pt-BR.md)**

</div>

> Fork of [pdf-lib](https://github.com/Hopding/pdf-lib) — 100% backward compatible. Just change your import from `pdf-lib` to `@maxwbh/pdf-lib`.

---

## Installation

```bash
npm install @maxwbh/pdf-lib
# or
yarn add @maxwbh/pdf-lib
```

**Migrating from pdf-lib:**

```bash
npm uninstall pdf-lib && npm install @maxwbh/pdf-lib
```

```js
// Change only the import — API is identical
import { PDFDocument } from '@maxwbh/pdf-lib';
```

**CDN (browser):**

```html
<script src="https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib@1.18.1/dist/pdf-lib.min.js"></script>
```

---

## New Features

| Feature | API |
|---------|-----|
| Encrypt PDFs (RC4 40/128-bit, AES 128/256-bit) | `pdfDoc.save({ encrypt: { ... } })` |
| Decrypt PDFs | `PDFDocument.load(bytes, { password: '...' })` |
| Incremental save (preserves digital signatures) | `pdfDoc.takeSnapshot()` + `pdfDoc.saveIncremental()` |
| Hyperlinks (URL and internal navigation) | `page.drawLink({ url: '...', x, y, width, height })` |
| Granular permissions | `permissions: { printing, copying, modifying, ... }` |

### Encrypt a PDF

```js
import { PDFDocument } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage();
page.drawText('Confidential document');

const pdfBytes = await pdfDoc.save({
  encrypt: {
    userPassword: 'user123',
    ownerPassword: 'owner456',
    permissions: {
      printing: true,
      copying: false,
      modifying: false,
    },
  },
});
```

### Open an Encrypted PDF

```js
const pdfDoc = await PDFDocument.load(encryptedBytes, {
  password: 'user123',
});
```

### Incremental Save (Preserve Signatures)

```js
const pdfDoc = await PDFDocument.load(signedPdfBytes);

pdfDoc.takeSnapshot();          // snapshot before changes

const form = pdfDoc.getForm();
form.getTextField('date').setText('2026-03-02');

const pdfBytes = await pdfDoc.saveIncremental(); // signature preserved
```

### Add Hyperlinks

```js
page.drawText('Visit our website', { x: 50, y: 300, size: 16, color: rgb(0, 0, 0.8) });

page.drawLink({
  url: 'https://github.com/Maxwbh/pdf-lib',
  x: 50, y: 295, width: 150, height: 20,
});
```

---

## Core Features

All original [pdf-lib](https://github.com/Hopding/pdf-lib) features are supported:

- Create / modify / copy PDF documents
- Add, insert, remove, copy pages
- Draw text, images, rectangles, SVG paths
- Embed fonts (including custom Unicode fonts via `@pdf-lib/fontkit`)
- Create and fill forms (text fields, checkboxes, dropdowns, radio groups)
- Flatten forms
- Add file attachments
- Set/read document metadata and viewer preferences
- Works in **Node.js**, **Browser**, **Deno**, and **React Native**

> See the [original pdf-lib documentation](https://pdf-lib.js.org/) for full API reference and usage examples.

---

## Custom Fonts (fontkit)

To embed custom fonts, install `@pdf-lib/fontkit`:

```bash
npm install @pdf-lib/fontkit
```

```js
import { PDFDocument } from '@maxwbh/pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const pdfDoc = await PDFDocument.create();
pdfDoc.registerFontkit(fontkit);

const fontBytes = await fetch('https://example.com/font.ttf').then(r => r.arrayBuffer());
const font = await pdfDoc.embedFont(fontBytes);

const page = pdfDoc.addPage();
page.drawText('Unicode text: 日本語, Ελληνικά, العربية', { font, size: 18 });
```

---

## Deno

```js
import { PDFDocument } from 'https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib@1.18.1/+esm';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage();
page.drawText('Hello from Deno!');
const pdfBytes = await pdfDoc.save();
await Deno.writeFile('out.pdf', pdfBytes);
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Complete API reference with examples |
| [docs/API_REFERENCE.pt-BR.md](docs/API_REFERENCE.pt-BR.md) | Referência completa da API em Português |
| [README.pt-BR.md](README.pt-BR.md) | Documentação completa em Português |
| [ROADMAP.md](ROADMAP.md) | Versioning plan and upcoming features |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Migrating from pdf-lib to @maxwbh/pdf-lib |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Contribution guide |
| [docs/RELEASING.md](docs/RELEASING.md) | Release process |

---

## Help

- **Issues / Feature Requests:** [GitHub Issues](https://github.com/Maxwbh/pdf-lib/issues)
- **Original pdf-lib docs:** [pdf-lib.js.org](https://pdf-lib.js.org/)

---

## Acknowledgements

Fork of [pdf-lib](https://github.com/Hopding/pdf-lib) by [Andrew Dillon](https://github.com/Hopding). All original contributors acknowledged.

## License

[MIT](LICENSE.md)
