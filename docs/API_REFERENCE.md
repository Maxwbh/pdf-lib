# API Reference - @maxwbh/pdf-lib

Complete API documentation with examples for all features.

> **Note:** This is a JavaScript/TypeScript library. For Python alternatives, see [Python Alternatives](#python-alternatives) at the end.

---

## Table of Contents

- [Installation](#installation)
- [PDFDocument](#pdfdocument)
  - [Creating Documents](#creating-documents)
  - [Loading Documents](#loading-documents)
  - [Saving Documents](#saving-documents)
  - [Document Properties](#document-properties)
- [PDFPage](#pdfpage)
  - [Adding Pages](#adding-pages)
  - [Drawing Text](#drawing-text)
  - [Drawing Shapes](#drawing-shapes)
  - [Drawing Images](#drawing-images)
  - [Drawing Links](#drawing-links)
- [Fonts](#fonts)
  - [Standard Fonts](#standard-fonts)
  - [Custom Fonts](#custom-fonts)
- [Forms](#forms)
  - [Text Fields](#text-fields)
  - [Checkboxes](#checkboxes)
  - [Radio Buttons](#radio-buttons)
  - [Dropdowns](#dropdowns)
  - [Buttons](#buttons)
  - [Flattening Forms](#flattening-forms)
- [Encryption](#encryption)
  - [Encrypting PDFs](#encrypting-pdfs)
  - [Decrypting PDFs](#decrypting-pdfs)
  - [Permissions](#permissions)
- [Incremental Save](#incremental-save)
- [Metadata](#metadata)
- [Attachments](#attachments)
- [Page Operations](#page-operations)
- [Colors](#colors)
- [Units and Coordinates](#units-and-coordinates)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [Python Alternatives](#python-alternatives)

---

## Installation

### Node.js / npm

```bash
npm install @maxwbh/pdf-lib
```

### Yarn

```bash
yarn add @maxwbh/pdf-lib
```

### CDN (Browser)

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

The main class for creating and manipulating PDF documents.

### Creating Documents

#### `PDFDocument.create(options?)`

Creates a new empty PDF document.

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

// Basic creation
const pdfDoc = await PDFDocument.create();

// With options
const pdfDoc = await PDFDocument.create({
  updateMetadata: true,  // Auto-update metadata on save (default: true)
});
```

**Returns:** `Promise<PDFDocument>`

### Loading Documents

#### `PDFDocument.load(data, options?)`

Loads an existing PDF document.

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fs from 'fs';

// From file (Node.js)
const existingPdfBytes = fs.readFileSync('document.pdf');
const pdfDoc = await PDFDocument.load(existingPdfBytes);

// From URL (Browser/Node.js)
const url = 'https://example.com/document.pdf';
const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
const pdfDoc = await PDFDocument.load(existingPdfBytes);

// From Base64
const base64String = 'JVBERi0xLjcK...';
const pdfDoc = await PDFDocument.load(base64String);
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `string \| Uint8Array \| ArrayBuffer` | PDF data (bytes or base64) |
| `options.password` | `string` | Password for encrypted PDFs |
| `options.ignoreEncryption` | `boolean` | Skip decryption (default: false) |
| `options.parseSpeed` | `number` | Parse speed 0-100 (default: 50) |
| `options.throwOnInvalidObject` | `boolean` | Throw on invalid objects (default: false) |
| `options.updateMetadata` | `boolean` | Update metadata on save (default: true) |
| `options.capNumbers` | `boolean` | Cap large numbers (default: false) |

**Returns:** `Promise<PDFDocument>`

**Examples with all options:**

```javascript
// Load encrypted PDF
const pdfDoc = await PDFDocument.load(encryptedBytes, {
  password: 'secretpassword',
});

// Load with strict parsing
const pdfDoc = await PDFDocument.load(bytes, {
  throwOnInvalidObject: true,
  parseSpeed: 100,
});

// Load without decrypting (for inspection only)
const pdfDoc = await PDFDocument.load(encryptedBytes, {
  ignoreEncryption: true,
});
```

### Saving Documents

#### `pdfDoc.save(options?)`

Saves the PDF document to bytes.

```javascript
// Basic save
const pdfBytes = await pdfDoc.save();

// Save to file (Node.js)
fs.writeFileSync('output.pdf', pdfBytes);

// Save with options
const pdfBytes = await pdfDoc.save({
  useObjectStreams: false,      // Disable object streams (larger file, more compatible)
  addDefaultPage: true,         // Add blank page if empty
  objectsPerTick: 50,           // Objects processed per tick (default: 50)
  updateFieldAppearances: true, // Update form field appearances
});
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.useObjectStreams` | `boolean` | Use object streams (default: true) |
| `options.addDefaultPage` | `boolean` | Add default page if empty (default: true) |
| `options.objectsPerTick` | `number` | Objects per processing tick (default: 50) |
| `options.updateFieldAppearances` | `boolean` | Update form appearances (default: true) |
| `options.encrypt` | `EncryptOptions` | Encryption options (see [Encryption](#encryption)) |

**Returns:** `Promise<Uint8Array>`

#### `pdfDoc.saveAsBase64(options?)`

Saves the PDF as a Base64-encoded string.

```javascript
const base64String = await pdfDoc.saveAsBase64();

// With data URI prefix
const dataUri = await pdfDoc.saveAsBase64({ dataUri: true });
// Returns: "data:application/pdf;base64,JVBERi0xLjcK..."
```

**Returns:** `Promise<string>`

### Document Properties

#### `pdfDoc.getPageCount()`

```javascript
const pageCount = pdfDoc.getPageCount();
console.log(`Document has ${pageCount} pages`);
```

#### `pdfDoc.getPages()`

```javascript
const pages = pdfDoc.getPages();
pages.forEach((page, index) => {
  const { width, height } = page.getSize();
  console.log(`Page ${index + 1}: ${width} x ${height}`);
});
```

#### `pdfDoc.getPage(index)`

```javascript
const firstPage = pdfDoc.getPage(0);  // 0-indexed
const lastPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
```

#### `pdfDoc.getForm()`

```javascript
const form = pdfDoc.getForm();
const fields = form.getFields();
console.log(`Form has ${fields.length} fields`);
```

---

## PDFPage

Represents a single page in a PDF document.

### Adding Pages

#### `pdfDoc.addPage(size?)`

Adds a new page at the end of the document.

```javascript
import { PDFDocument, PageSizes } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();

// Default size (Letter: 612 x 792)
const page1 = pdfDoc.addPage();

// Predefined size
const page2 = pdfDoc.addPage(PageSizes.A4);         // 595.28 x 841.89
const page3 = pdfDoc.addPage(PageSizes.Legal);      // 612 x 1008
const page4 = pdfDoc.addPage(PageSizes.Tabloid);    // 792 x 1224

// Custom size [width, height] in points
const page5 = pdfDoc.addPage([400, 600]);

// Landscape (swap width/height)
const page6 = pdfDoc.addPage([PageSizes.A4[1], PageSizes.A4[0]]);
```

**Available PageSizes:**

| Size | Dimensions (points) | Dimensions (mm) |
|------|---------------------|-----------------|
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

Inserts a page at a specific position.

```javascript
// Insert at beginning
const newFirstPage = pdfDoc.insertPage(0);

// Insert at position 2 (third page)
const page = pdfDoc.insertPage(2, PageSizes.A4);
```

### Drawing Text

#### `page.drawText(text, options?)`

Draws text on the page.

```javascript
import { PDFDocument, rgb, StandardFonts } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage();
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

// Simple text
page.drawText('Hello, World!', {
  x: 50,
  y: 700,
  size: 24,
  font: font,
  color: rgb(0, 0, 0),
});

// All options
page.drawText('Styled Text', {
  x: 50,
  y: 650,
  size: 18,
  font: font,
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

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x` | `number` | 0 | X coordinate (from left) |
| `y` | `number` | 0 | Y coordinate (from bottom) |
| `size` | `number` | 24 | Font size in points |
| `font` | `PDFFont` | Helvetica | Embedded font |
| `color` | `Color` | black | Text color |
| `opacity` | `number` | 1 | Opacity (0-1) |
| `rotate` | `Rotation` | 0 | Rotation angle |
| `lineHeight` | `number` | size | Line height for multi-line |
| `maxWidth` | `number` | - | Maximum width (enables word wrap) |
| `wordBreaks` | `string[]` | [' '] | Characters to break on |

**Multi-line text:**

```javascript
const text = `Line 1
Line 2
Line 3`;

page.drawText(text, {
  x: 50,
  y: 700,
  size: 14,
  font: font,
  lineHeight: 18,
});
```

**Word wrapping:**

```javascript
const longText = 'This is a very long paragraph that will automatically wrap to multiple lines when it exceeds the maximum width specified.';

page.drawText(longText, {
  x: 50,
  y: 700,
  size: 12,
  font: font,
  maxWidth: 300,
  lineHeight: 16,
});
```

### Drawing Shapes

#### `page.drawRectangle(options)`

```javascript
import { rgb, grayscale } from '@maxwbh/pdf-lib';

// Filled rectangle
page.drawRectangle({
  x: 50,
  y: 500,
  width: 200,
  height: 100,
  color: rgb(0.2, 0.6, 0.8),
});

// Rectangle with border only
page.drawRectangle({
  x: 50,
  y: 380,
  width: 200,
  height: 100,
  borderColor: rgb(0, 0, 0),
  borderWidth: 2,
});

// Rectangle with fill and border
page.drawRectangle({
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

// Dashed border
page.drawRectangle({
  x: 50,
  y: 140,
  width: 200,
  height: 100,
  borderColor: rgb(0, 0, 0),
  borderWidth: 1,
  borderDashArray: [5, 3],  // 5pt dash, 3pt gap
  borderDashPhase: 0,
});

// Rotated rectangle
page.drawRectangle({
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
page.drawSquare({
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
page.drawCircle({
  x: 200,   // center X
  y: 400,   // center Y
  size: 50, // radius
  color: rgb(1, 0, 0),
  borderColor: rgb(0, 0, 0),
  borderWidth: 2,
});
```

#### `page.drawEllipse(options)`

```javascript
page.drawEllipse({
  x: 300,     // center X
  y: 400,     // center Y
  xScale: 75, // horizontal radius
  yScale: 50, // vertical radius
  color: rgb(0, 0, 1),
  borderColor: rgb(0, 0, 0),
  borderWidth: 1,
});
```

#### `page.drawLine(options)`

```javascript
page.drawLine({
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

**LineCapStyle values:**

- `LineCapStyle.Butt` - Flat end
- `LineCapStyle.Round` - Rounded end
- `LineCapStyle.Projecting` - Extended flat end

#### `page.drawSvgPath(path, options)`

Draws an SVG path.

```javascript
// Heart shape
const heartPath = 'M 50 30 A 20 20 0 0 1 90 30 A 20 20 0 0 1 50 75 A 20 20 0 0 1 10 30 A 20 20 0 0 1 50 30 Z';

page.drawSvgPath(heartPath, {
  x: 100,
  y: 500,
  scale: 2,
  color: rgb(1, 0, 0),
  borderColor: rgb(0.5, 0, 0),
  borderWidth: 1,
});

// Star shape
const starPath = 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z';

page.drawSvgPath(starPath, {
  x: 300,
  y: 500,
  scale: 1.5,
  color: rgb(1, 0.8, 0),
  borderColor: rgb(0.8, 0.6, 0),
  borderWidth: 2,
});
```

### Drawing Images

#### Embedding Images

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fs from 'fs';

const pdfDoc = await PDFDocument.create();

// Embed PNG
const pngImageBytes = fs.readFileSync('image.png');
const pngImage = await pdfDoc.embedPng(pngImageBytes);

// Embed JPEG
const jpgImageBytes = fs.readFileSync('photo.jpg');
const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);

// From URL
const imageUrl = 'https://example.com/image.png';
const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
const image = await pdfDoc.embedPng(imageBytes);

// From Base64
const base64Image = 'iVBORw0KGgoAAAANSUhEUgAA...';
const image = await pdfDoc.embedPng(base64Image);
```

#### `page.drawImage(image, options)`

```javascript
const page = pdfDoc.addPage();

// Basic image
page.drawImage(pngImage, {
  x: 50,
  y: 500,
  width: 200,
  height: 150,
});

// Scale to fit
const { width, height } = pngImage.scale(0.5);
page.drawImage(pngImage, {
  x: 50,
  y: 300,
  width,
  height,
});

// All options
page.drawImage(jpgImage, {
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

**Get original image dimensions:**

```javascript
const { width, height } = pngImage;
console.log(`Original size: ${width} x ${height}`);

// Scale to specific width keeping aspect ratio
const scaledDims = pngImage.scaleToFit(300, 200);
page.drawImage(pngImage, {
  x: 50,
  y: 400,
  width: scaledDims.width,
  height: scaledDims.height,
});
```

### Drawing Links

#### `page.drawLink(options)` - NEW in @maxwbh/pdf-lib

Creates clickable hyperlinks on the page.

```javascript
// External URL link
page.drawText('Click here to visit GitHub', {
  x: 50,
  y: 700,
  size: 14,
  color: rgb(0, 0, 0.8),
});

page.drawLink({
  url: 'https://github.com/Maxwbh/pdf-lib',
  x: 50,
  y: 695,
  width: 200,
  height: 20,
});

// With visible border
page.drawLink({
  url: 'https://example.com',
  x: 50,
  y: 650,
  width: 150,
  height: 20,
  borderColor: rgb(0, 0, 1),
  borderWidth: 1,
});

// Internal page navigation
const pages = pdfDoc.getPages();
const targetPage = pages[2]; // Link to page 3

page.drawLink({
  pageRef: targetPage.ref,
  x: 50,
  y: 600,
  width: 100,
  height: 20,
});
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | External URL (for web links) |
| `pageRef` | `PDFRef` | Internal page reference (for page navigation) |
| `x` | `number` | X coordinate of link area |
| `y` | `number` | Y coordinate of link area |
| `width` | `number` | Width of clickable area |
| `height` | `number` | Height of clickable area |
| `borderColor` | `Color` | Border color (optional) |
| `borderWidth` | `number` | Border thickness (optional) |
| `borderStyle` | `string` | Border style: 'solid', 'dashed', 'underline' |

---

## Fonts

### Standard Fonts

14 standard fonts available without embedding:

```javascript
import { PDFDocument, StandardFonts } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();

// Embed standard fonts
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

### Custom Fonts

For Unicode support and custom fonts, use `@pdf-lib/fontkit`:

```bash
npm install @pdf-lib/fontkit
```

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';

const pdfDoc = await PDFDocument.create();

// Register fontkit
pdfDoc.registerFontkit(fontkit);

// Embed TTF font
const fontBytes = fs.readFileSync('fonts/Roboto-Regular.ttf');
const roboto = await pdfDoc.embedFont(fontBytes);

// Embed OTF font
const otfBytes = fs.readFileSync('fonts/OpenSans-Bold.otf');
const openSans = await pdfDoc.embedFont(otfBytes);

// Subset embedding (smaller file size)
const subsetFont = await pdfDoc.embedFont(fontBytes, { subset: true });

// Use the font
const page = pdfDoc.addPage();
page.drawText('Custom font text', {
  x: 50,
  y: 700,
  size: 24,
  font: roboto,
});

// Unicode text (Japanese, Greek, Arabic, etc.)
page.drawText('日本語テキスト - Ελληνικά - العربية', {
  x: 50,
  y: 650,
  size: 18,
  font: roboto, // Must support these characters
});
```

**Font measurements:**

```javascript
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const fontSize = 12;
const text = 'Hello, World!';

// Get text width
const textWidth = font.widthOfTextAtSize(text, fontSize);

// Get font height metrics
const fontHeight = font.heightAtSize(fontSize);

// Ascender and descender
const ascent = font.embedder.font.ascent;
const descent = font.embedder.font.descent;
```

---

## Forms

### Getting the Form

```javascript
const form = pdfDoc.getForm();
const fields = form.getFields();

fields.forEach(field => {
  const type = field.constructor.name;
  const name = field.getName();
  console.log(`${type}: ${name}`);
});
```

### Text Fields

#### Creating Text Fields

```javascript
const form = pdfDoc.getForm();
const page = pdfDoc.getPage(0);

// Create text field
const textField = form.createTextField('user.name');
textField.setText('John Doe');
textField.addToPage(page, {
  x: 50,
  y: 700,
  width: 200,
  height: 25,
  borderColor: rgb(0, 0, 0),
  backgroundColor: rgb(1, 1, 1),
});

// Multi-line text field
const commentsField = form.createTextField('user.comments');
commentsField.enableMultiline();
commentsField.setText('Enter comments here...');
commentsField.addToPage(page, {
  x: 50,
  y: 600,
  width: 300,
  height: 100,
});

// Read-only field
const idField = form.createTextField('user.id');
idField.setText('12345');
idField.enableReadOnly();
idField.addToPage(page, { x: 50, y: 550, width: 100, height: 25 });

// Password field
const passwordField = form.createTextField('user.password');
passwordField.enablePassword();
passwordField.addToPage(page, { x: 50, y: 500, width: 200, height: 25 });

// Formatted field (max length)
const phoneField = form.createTextField('user.phone');
phoneField.setMaxLength(10);
phoneField.setText('5551234567');
phoneField.addToPage(page, { x: 50, y: 450, width: 150, height: 25 });
```

#### Reading/Filling Text Fields

```javascript
// Get existing field by name
const nameField = form.getTextField('user.name');

// Read value
const currentValue = nameField.getText();
console.log(`Current value: ${currentValue}`);

// Set value
nameField.setText('Jane Smith');

// Clear value
nameField.setText('');
```

### Checkboxes

```javascript
// Create checkbox
const checkbox = form.createCheckBox('terms.accepted');
checkbox.addToPage(page, {
  x: 50,
  y: 400,
  width: 20,
  height: 20,
});

// Check/uncheck
checkbox.check();
// checkbox.uncheck();

// Read state
const isChecked = checkbox.isChecked();

// Get existing checkbox
const existingCheckbox = form.getCheckBox('terms.accepted');
existingCheckbox.check();
```

### Radio Buttons

```javascript
// Create radio group
const genderGroup = form.createRadioGroup('user.gender');

// Add options
genderGroup.addOptionToPage('male', page, {
  x: 50, y: 350, width: 15, height: 15,
});
genderGroup.addOptionToPage('female', page, {
  x: 50, y: 330, width: 15, height: 15,
});
genderGroup.addOptionToPage('other', page, {
  x: 50, y: 310, width: 15, height: 15,
});

// Select option
genderGroup.select('male');

// Read selection
const selected = genderGroup.getSelected();
console.log(`Selected: ${selected}`);

// Get all options
const options = genderGroup.getOptions();
console.log(`Options: ${options.join(', ')}`);
```

### Dropdowns

```javascript
// Create dropdown
const dropdown = form.createDropdown('user.country');
dropdown.addOptions(['Brazil', 'USA', 'Germany', 'Japan', 'France']);
dropdown.select('Brazil');
dropdown.addToPage(page, {
  x: 50,
  y: 270,
  width: 150,
  height: 25,
});

// Editable dropdown (allows custom input)
const editableDropdown = form.createDropdown('user.city');
editableDropdown.addOptions(['São Paulo', 'Rio de Janeiro', 'Brasília']);
editableDropdown.enableEditing();
editableDropdown.addToPage(page, {
  x: 50,
  y: 230,
  width: 150,
  height: 25,
});

// Read selection
const country = form.getDropdown('user.country').getSelected();
```

### Buttons

```javascript
// Create button
const button = form.createButton('submit.button');
button.addToPage('Submit Form', page, {
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

### Flattening Forms

Flatten forms to make them non-editable (converts to static content):

```javascript
// Flatten all fields
form.flatten();

// Flatten specific field
const field = form.getTextField('user.name');
form.flattenField(field);
```

---

## Encryption

### Encrypting PDFs

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage();
page.drawText('Confidential Document');

// Basic encryption (AES-256)
const pdfBytes = await pdfDoc.save({
  encrypt: {
    userPassword: 'user123',
    ownerPassword: 'owner456',
  },
});

// Full encryption options
const pdfBytes = await pdfDoc.save({
  encrypt: {
    userPassword: 'user123',      // Password to open document
    ownerPassword: 'owner456',    // Password for full access
    algorithm: 'aes256',          // 'rc4-40', 'rc4-128', 'aes128', 'aes256'
    permissions: {
      printing: true,             // Allow printing
      printingHighQuality: true,  // Allow high-quality printing
      modifying: false,           // Allow document modification
      copying: false,             // Allow content copying
      annotating: true,           // Allow adding annotations
      fillingForms: true,         // Allow form filling
      contentAccessibility: true, // Allow accessibility access
      documentAssembly: false,    // Allow page assembly
    },
  },
});
```

**Encryption Algorithms:**

| Algorithm | PDF Version | Security Level |
|-----------|-------------|----------------|
| `rc4-40` | 1.1+ | Low (legacy) |
| `rc4-128` | 1.4+ | Medium |
| `aes128` | 1.5+ | High |
| `aes256` | 2.0+ | Very High (recommended) |

### Decrypting PDFs

```javascript
// Open with user password
const pdfDoc = await PDFDocument.load(encryptedBytes, {
  password: 'user123',
});

// Open with owner password (full permissions)
const pdfDoc = await PDFDocument.load(encryptedBytes, {
  password: 'owner456',
});

// Remove encryption (save without encrypt option)
const decryptedBytes = await pdfDoc.save();
```

### Permissions

| Permission | Description |
|------------|-------------|
| `printing` | Allow any printing |
| `printingHighQuality` | Allow high-resolution printing |
| `modifying` | Allow document modification |
| `copying` | Allow text/image copying |
| `annotating` | Allow adding/editing annotations |
| `fillingForms` | Allow form field input |
| `contentAccessibility` | Allow screen readers |
| `documentAssembly` | Allow insert/delete/rotate pages |

**Example: Read-only PDF (view and print only):**

```javascript
const pdfBytes = await pdfDoc.save({
  encrypt: {
    userPassword: '',             // Empty = no password to open
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

## Incremental Save

Preserve digital signatures when modifying signed PDFs.

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

// Load signed PDF
const signedPdfBytes = fs.readFileSync('signed-document.pdf');
const pdfDoc = await PDFDocument.load(signedPdfBytes);

// Take snapshot BEFORE making changes
pdfDoc.takeSnapshot();

// Make modifications
const form = pdfDoc.getForm();
const dateField = form.getTextField('date');
dateField.setText('2026-03-02');

const signatureField = form.getTextField('signatory');
signatureField.setText('John Doe');

// Save incrementally (preserves signature)
const modifiedBytes = await pdfDoc.saveIncremental();

// Save to file
fs.writeFileSync('signed-filled.pdf', modifiedBytes);
```

**How it works:**

1. `takeSnapshot()` - Captures the document state before modifications
2. Make your changes (fill forms, add annotations, etc.)
3. `saveIncremental()` - Appends only the changes to the original document

**Important notes:**

- Call `takeSnapshot()` immediately after loading
- Don't modify the document structure (add/remove pages)
- Only modify form fields and annotations
- The digital signature remains valid

---

## Metadata

### Reading Metadata

```javascript
const title = pdfDoc.getTitle();
const author = pdfDoc.getAuthor();
const subject = pdfDoc.getSubject();
const keywords = pdfDoc.getKeywords();
const creator = pdfDoc.getCreator();
const producer = pdfDoc.getProducer();
const creationDate = pdfDoc.getCreationDate();
const modificationDate = pdfDoc.getModificationDate();

console.log(`Title: ${title}`);
console.log(`Author: ${author}`);
console.log(`Created: ${creationDate}`);
```

### Setting Metadata

```javascript
pdfDoc.setTitle('Financial Report 2026');
pdfDoc.setAuthor('Maxwell Oliveira');
pdfDoc.setSubject('Q1 Financial Results');
pdfDoc.setKeywords(['finance', 'report', 'quarterly']);
pdfDoc.setCreator('@maxwbh/pdf-lib');
pdfDoc.setProducer('M&S do Brasil LTDA');
pdfDoc.setCreationDate(new Date('2026-01-15'));
pdfDoc.setModificationDate(new Date());

// Set language
pdfDoc.setLanguage('pt-BR');
```

---

## Attachments

### Adding Attachments

```javascript
import { AFRelationship } from '@maxwbh/pdf-lib';

// Attach a file
const csvData = fs.readFileSync('data.csv');
await pdfDoc.attach(csvData, 'report-data.csv', {
  mimeType: 'text/csv',
  description: 'Raw data for the report',
  creationDate: new Date('2026-01-15'),
  modificationDate: new Date(),
  afRelationship: AFRelationship.Data,
});

// Attach from string
const jsonContent = JSON.stringify({ key: 'value' });
const jsonBytes = new TextEncoder().encode(jsonContent);
await pdfDoc.attach(jsonBytes, 'config.json', {
  mimeType: 'application/json',
  description: 'Configuration file',
});
```

**AFRelationship values:**

- `AFRelationship.Source` - Source document
- `AFRelationship.Data` - Data file
- `AFRelationship.Alternative` - Alternative representation
- `AFRelationship.Supplement` - Supplementary file
- `AFRelationship.Unspecified` - No specific relationship

---

## Page Operations

### Copy Pages Between Documents

```javascript
const srcDoc = await PDFDocument.load(srcBytes);
const destDoc = await PDFDocument.create();

// Copy specific pages
const [page1, page3] = await destDoc.copyPages(srcDoc, [0, 2]);

// Add copied pages
destDoc.addPage(page1);
destDoc.addPage(page3);

// Copy all pages
const pageIndices = srcDoc.getPageIndices();
const copiedPages = await destDoc.copyPages(srcDoc, pageIndices);
copiedPages.forEach(page => destDoc.addPage(page));
```

### Remove Pages

```javascript
// Remove page by index (0-based)
pdfDoc.removePage(0);  // Remove first page
pdfDoc.removePage(pdfDoc.getPageCount() - 1);  // Remove last page
```

### Get Page Size

```javascript
const page = pdfDoc.getPage(0);
const { width, height } = page.getSize();
console.log(`Page size: ${width} x ${height} points`);
```

### Set Page Size

```javascript
page.setSize(PageSizes.A4[0], PageSizes.A4[1]);
```

### Rotate Pages

```javascript
page.setRotation(degrees(90));   // Rotate 90 degrees
page.setRotation(degrees(180));  // Rotate 180 degrees
page.setRotation(degrees(270));  // Rotate 270 degrees
```

### Get/Set MediaBox, CropBox, BleedBox, TrimBox

```javascript
// Get boxes
const mediaBox = page.getMediaBox();
const cropBox = page.getCropBox();
const bleedBox = page.getBleedBox();
const trimBox = page.getTrimBox();

// Set crop box (visible area)
page.setCropBox(50, 50, 500, 700);
```

---

## Colors

### RGB Colors

```javascript
import { rgb } from '@maxwbh/pdf-lib';

const red = rgb(1, 0, 0);         // Pure red
const green = rgb(0, 1, 0);       // Pure green
const blue = rgb(0, 0, 1);        // Pure blue
const black = rgb(0, 0, 0);       // Black
const white = rgb(1, 1, 1);       // White
const gray = rgb(0.5, 0.5, 0.5);  // 50% gray
const custom = rgb(0.2, 0.4, 0.8); // Custom color

// From hex (helper function)
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? rgb(
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ) : null;
}

const brandColor = hexToRgb('#3498db');
```

### Grayscale

```javascript
import { grayscale } from '@maxwbh/pdf-lib';

const black = grayscale(0);       // Black
const darkGray = grayscale(0.25); // 25% gray
const midGray = grayscale(0.5);   // 50% gray
const lightGray = grayscale(0.75);// 75% gray
const white = grayscale(1);       // White
```

### CMYK Colors

```javascript
import { cmyk } from '@maxwbh/pdf-lib';

const cyan = cmyk(1, 0, 0, 0);    // Pure cyan
const magenta = cmyk(0, 1, 0, 0); // Pure magenta
const yellow = cmyk(0, 0, 1, 0);  // Pure yellow
const black = cmyk(0, 0, 0, 1);   // Pure black
const richBlack = cmyk(0.75, 0.68, 0.67, 0.9); // Rich black for print
```

---

## Units and Coordinates

### Coordinate System

- **Origin (0, 0)** is at the **bottom-left** corner
- **X** increases to the right
- **Y** increases upward
- **Units** are in **points** (1 point = 1/72 inch)

```
  ┌─────────────────────────────┐ (width, height)
  │                             │
  │                             │
  │         Page Area           │
  │                             │
  │                             │
  └─────────────────────────────┘
(0, 0)
```

### Unit Conversions

```javascript
// Points to other units
const pointsToInches = (pts) => pts / 72;
const pointsToCm = (pts) => pts / 72 * 2.54;
const pointsToMm = (pts) => pts / 72 * 25.4;
const pointsToPx = (pts, dpi = 96) => pts / 72 * dpi;

// Other units to points
const inchesToPoints = (inches) => inches * 72;
const cmToPoints = (cm) => cm / 2.54 * 72;
const mmToPoints = (mm) => mm / 25.4 * 72;
const pxToPoints = (px, dpi = 96) => px / dpi * 72;

// Examples
const marginInches = 1;
const marginPoints = inchesToPoints(marginInches); // 72 points

const a4WidthMm = 210;
const a4WidthPoints = mmToPoints(a4WidthMm); // ~595.28 points
```

### Rotation Helper

```javascript
import { degrees, radians } from '@maxwbh/pdf-lib';

const rotation90 = degrees(90);
const rotationPi = radians(Math.PI);  // 180 degrees
```

---

## Error Handling

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';

try {
  const pdfDoc = await PDFDocument.load(bytes);
} catch (error) {
  if (error.message.includes('encrypted')) {
    console.log('PDF is encrypted. Please provide password.');
    const pdfDoc = await PDFDocument.load(bytes, { password: 'secret' });
  } else if (error.message.includes('Invalid')) {
    console.log('Invalid PDF file');
  } else {
    throw error;
  }
}

// Form field errors
try {
  const field = form.getTextField('nonexistent');
} catch (error) {
  console.log('Field not found:', error.message);
}

// Check if field exists before accessing
const fieldName = 'user.name';
const fields = form.getFields();
const fieldExists = fields.some(f => f.getName() === fieldName);
if (fieldExists) {
  const field = form.getTextField(fieldName);
}
```

---

## TypeScript Types

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

// Type definitions
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

## Python Alternatives

Since `pdf-lib` is a JavaScript library, here are equivalent Python libraries for similar functionality:

### PyPDF2 / pypdf

Basic PDF manipulation (merge, split, rotate, encrypt):

```python
# pip install pypdf

from pypdf import PdfReader, PdfWriter

# Read PDF
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
for page in reader.pages:
    text = page.extract_text()
    print(text)

# Create new PDF
writer = PdfWriter()
writer.add_page(reader.pages[0])

# Encrypt
writer.encrypt(user_password="user123", owner_password="owner456")
writer.write("encrypted.pdf")

# Merge PDFs
merger = PdfWriter()
merger.append("doc1.pdf")
merger.append("doc2.pdf")
merger.write("merged.pdf")
```

### reportlab

Create PDFs from scratch (similar to pdf-lib):

```python
# pip install reportlab

from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import red, blue, black
from reportlab.lib.units import cm, inch

# Create PDF
c = canvas.Canvas("output.pdf", pagesize=A4)

# Draw text
c.setFont("Helvetica", 24)
c.drawString(50, 700, "Hello, World!")

# Draw shapes
c.setFillColor(blue)
c.rect(50, 500, 200, 100, fill=True, stroke=True)

c.setFillColor(red)
c.circle(300, 550, 50, fill=True)

# Draw image
c.drawImage("image.png", 50, 300, width=200, height=150)

# Add link
c.linkURL("https://github.com", (50, 250, 200, 270))

# Save
c.save()
```

### pikepdf

Low-level PDF manipulation (encryption, incremental save):

```python
# pip install pikepdf

import pikepdf

# Open encrypted PDF
pdf = pikepdf.open("encrypted.pdf", password="secret")

# Encrypt PDF
pdf_out = pikepdf.new()
pdf_out.pages.append(pikepdf.Page(pikepdf.Dictionary()))
pdf_out.save("encrypted.pdf", encryption=pikepdf.Encryption(
    owner="owner123",
    user="user123",
    allow=pikepdf.Permissions(
        extract=False,
        modify_form=True,
        print_lowres=True,
        print_highres=True,
    )
))

# Incremental save (preserves signatures)
pdf = pikepdf.open("signed.pdf")
# Make changes...
pdf.save("modified.pdf", linearize=False)
```

### pdfrw

Read/write PDF structure:

```python
# pip install pdfrw

from pdfrw import PdfReader, PdfWriter, PageMerge

# Read PDF
reader = PdfReader("input.pdf")
writer = PdfWriter()

# Copy pages
for page in reader.pages:
    writer.addpage(page)

# Watermark
watermark = PdfReader("watermark.pdf").pages[0]
for page in writer.pagearray:
    PageMerge(page).add(watermark).render()

writer.write("output.pdf")
```

### Comparison Table

| Feature | pdf-lib (JS) | pypdf | reportlab | pikepdf |
|---------|-------------|-------|-----------|---------|
| Create PDF | Yes | Limited | Yes | Yes |
| Modify PDF | Yes | Yes | No | Yes |
| Draw text | Yes | No | Yes | No |
| Draw shapes | Yes | No | Yes | No |
| Embed images | Yes | No | Yes | Yes |
| Fill forms | Yes | Yes | No | Yes |
| Encrypt/Decrypt | Yes | Yes | No | Yes |
| Incremental save | Yes | No | No | Yes |
| Digital signatures | Preserve | No | No | Preserve |
| Hyperlinks | Yes | Yes | Yes | Yes |

---

## Complete Examples

### Invoice Generator

```javascript
import { PDFDocument, rgb, StandardFonts, PageSizes } from '@maxwbh/pdf-lib';

async function createInvoice(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText('INVOICE', {
    x: 50, y: height - 50,
    size: 28, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`#${data.invoiceNumber}`, {
    x: 50, y: height - 80,
    size: 14, font: helvetica, color: rgb(0.5, 0.5, 0.5),
  });

  // Company info
  page.drawText(data.companyName, {
    x: width - 200, y: height - 50,
    size: 16, font: helveticaBold,
  });

  // Items table
  let y = height - 150;
  const tableHeaders = ['Description', 'Qty', 'Price', 'Total'];
  const colWidths = [250, 60, 80, 80];
  let x = 50;

  // Headers
  page.drawRectangle({
    x: 50, y: y - 5, width: width - 100, height: 25,
    color: rgb(0.9, 0.9, 0.9),
  });

  tableHeaders.forEach((header, i) => {
    page.drawText(header, {
      x, y, size: 12, font: helveticaBold,
    });
    x += colWidths[i];
  });

  y -= 30;

  // Items
  let total = 0;
  data.items.forEach(item => {
    x = 50;
    const itemTotal = item.qty * item.price;
    total += itemTotal;

    page.drawText(item.description, { x, y, size: 11, font: helvetica });
    x += colWidths[0];
    page.drawText(String(item.qty), { x, y, size: 11, font: helvetica });
    x += colWidths[1];
    page.drawText(`$${item.price.toFixed(2)}`, { x, y, size: 11, font: helvetica });
    x += colWidths[2];
    page.drawText(`$${itemTotal.toFixed(2)}`, { x, y, size: 11, font: helvetica });

    y -= 25;
  });

  // Total
  page.drawLine({
    start: { x: 50, y: y + 15 },
    end: { x: width - 50, y: y + 15 },
    thickness: 1, color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText('TOTAL:', {
    x: width - 180, y: y - 10,
    size: 14, font: helveticaBold,
  });

  page.drawText(`$${total.toFixed(2)}`, {
    x: width - 100, y: y - 10,
    size: 14, font: helveticaBold, color: rgb(0, 0.5, 0),
  });

  // Metadata
  pdfDoc.setTitle(`Invoice ${data.invoiceNumber}`);
  pdfDoc.setAuthor(data.companyName);

  return pdfDoc.save();
}

// Usage
const invoiceData = {
  invoiceNumber: 'INV-2026-001',
  companyName: 'M&S do Brasil LTDA',
  items: [
    { description: 'Web Development Services', qty: 40, price: 150 },
    { description: 'UI/UX Design', qty: 20, price: 120 },
    { description: 'Hosting (Annual)', qty: 1, price: 500 },
  ],
};

const pdfBytes = await createInvoice(invoiceData);
fs.writeFileSync('invoice.pdf', pdfBytes);
```

### Form Filler

```javascript
import { PDFDocument } from '@maxwbh/pdf-lib';
import fs from 'fs';

async function fillForm(templatePath, data) {
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Fill text fields
  Object.entries(data.textFields || {}).forEach(([name, value]) => {
    try {
      const field = form.getTextField(name);
      field.setText(String(value));
    } catch (e) {
      console.warn(`Field not found: ${name}`);
    }
  });

  // Check checkboxes
  (data.checkboxes || []).forEach(name => {
    try {
      const checkbox = form.getCheckBox(name);
      checkbox.check();
    } catch (e) {
      console.warn(`Checkbox not found: ${name}`);
    }
  });

  // Select dropdowns
  Object.entries(data.dropdowns || {}).forEach(([name, value]) => {
    try {
      const dropdown = form.getDropdown(name);
      dropdown.select(value);
    } catch (e) {
      console.warn(`Dropdown not found: ${name}`);
    }
  });

  // Select radio buttons
  Object.entries(data.radioGroups || {}).forEach(([name, value]) => {
    try {
      const radioGroup = form.getRadioGroup(name);
      radioGroup.select(value);
    } catch (e) {
      console.warn(`Radio group not found: ${name}`);
    }
  });

  // Optionally flatten
  if (data.flatten) {
    form.flatten();
  }

  return pdfDoc.save();
}

// Usage
const formData = {
  textFields: {
    'name': 'John Doe',
    'email': 'john@example.com',
    'date': '2026-03-02',
  },
  checkboxes: ['terms_accepted', 'newsletter'],
  dropdowns: {
    'country': 'Brazil',
  },
  radioGroups: {
    'gender': 'male',
  },
  flatten: true,
};

const pdfBytes = await fillForm('template.pdf', formData);
fs.writeFileSync('filled-form.pdf', pdfBytes);
```

---

## Support

- **Issues:** [GitHub Issues](https://github.com/Maxwbh/pdf-lib/issues)
- **Original Documentation:** [pdf-lib.js.org](https://pdf-lib.js.org/)
- **NPM:** [@maxwbh/pdf-lib](https://www.npmjs.com/package/@maxwbh/pdf-lib)

---

*Documentation for @maxwbh/pdf-lib v1.18.1*
