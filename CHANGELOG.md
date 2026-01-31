# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.18.0] - 2026-01-31

This is the first release of the `@maxwbh/pdf-lib` fork, which extends the original `pdf-lib` with new features.

### Added

#### PDF Encryption/Decryption
- Support for opening password-protected PDFs with `PDFDocument.load(bytes, { password: '...' })`
- Support for encrypting PDFs when saving with `pdfDoc.save({ encrypt: { ... } })`
- Encryption algorithms supported:
  - RC4 40-bit (PDF 1.1+)
  - RC4 128-bit (PDF 1.4+)
  - AES-128 (PDF 1.5+)
  - AES-256 (PDF 2.0+)
- Granular permission control:
  - `printing` - Allow printing
  - `printingHighQuality` - Allow high-quality printing
  - `modifying` - Allow document modification
  - `copying` - Allow content copying
  - `annotating` - Allow adding annotations
  - `fillingForms` - Allow form filling
  - `contentAccessibility` - Allow content accessibility
  - `documentAssembly` - Allow document assembly
- New files:
  - `src/core/crypto/md5.ts` - MD5 implementation
  - `src/core/crypto/rc4.ts` - RC4 implementation
  - `src/core/crypto/aes.ts` - AES-CBC implementation
  - `src/core/crypto/PDFSecurity.ts` - Security manager

#### Incremental Save
- Support for preserving digital signatures when modifying signed PDFs
- New methods on `PDFDocument`:
  - `takeSnapshot()` - Capture document state
  - `markRefForSave(ref)` - Mark objects as modified
  - `saveIncremental()` - Save only modifications
- New file:
  - `src/core/writers/PDFIncrementalWriter.ts` - Incremental writer

#### Hyperlinks
- Support for adding clickable links to PDF pages
- New method `PDFPage.drawLink()` with options:
  - `url` - External URL link
  - `pageRef` - Internal page navigation
  - `x`, `y`, `width`, `height` - Link area
  - `borderColor`, `borderWidth`, `borderStyle` - Styling
- New file:
  - `src/core/annotation/PDFLinkAnnotation.ts` - Link annotation class

### Changed
- Package renamed from `pdf-lib` to `@maxwbh/pdf-lib`
- Repository moved to `github.com/Maxwbh/pdf-lib`

### Documentation
- Added complete Portuguese documentation (`docs/DOCUMENTACAO_PT.md`)
- Added improvements roadmap (`IMPROVEMENTS_TODO.md`)

---

## [1.17.1] - Previous Release

See the original [pdf-lib repository](https://github.com/Hopding/pdf-lib) for the changelog of versions prior to this fork.

---

## Migration from pdf-lib

To migrate from the original `pdf-lib` to this fork:

1. Update your `package.json`:
   ```diff
   - "pdf-lib": "^1.17.1"
   + "@maxwbh/pdf-lib": "^1.18.0"
   ```

2. Update your imports (no changes needed - API is compatible):
   ```javascript
   // Same import syntax works
   import { PDFDocument } from '@maxwbh/pdf-lib';
   ```

3. Run `npm install` or `yarn install`

The API is fully backward compatible with the original `pdf-lib`.
