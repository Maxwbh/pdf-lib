# Release Process

This document describes the process used to release a new version of `@maxwbh/pdf-lib`.

## Prerequisites

- Node.js 18+ (recommended 22+)
- Yarn package manager
- NPM account with access to `@maxwbh` scope
- Git configured with proper credentials

## Checklist

1. **Prepare the release**
   ```bash
   git checkout master && git pull
   ```

2. **Update version number**
   - Edit `package.json` and update the version
   - Follow [Semantic Versioning](https://semver.org/)

3. **Clean install dependencies**
   ```bash
   rm -rf node_modules && yarn install
   ```

4. **Run tests and build**
   ```bash
   yarn test
   yarn build
   ```

5. **Run integration tests**
   ```bash
   yarn apps:node
   yarn apps:deno
   yarn apps:web
   ```

6. **Update documentation**
   - Update `CHANGELOG.md` with new changes
   - Update version references in documentation

7. **Commit and tag**
   ```bash
   git add .
   git commit -m "Release vX.Y.Z"
   git tag vX.Y.Z
   ```

8. **Publish to NPM**
   ```bash
   npm publish --access public
   ```

9. **Push to GitHub**
   ```bash
   git push origin master --tags
   ```

10. **Create GitHub Release**
    - Go to https://github.com/Maxwbh/pdf-lib/releases
    - Create a new release from the tag
    - Add release notes from CHANGELOG.md

## Version Numbering

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (x.Y.0): New features, backward compatible
- **PATCH** (x.y.Z): Bug fixes, backward compatible

## CDN Distribution

After publishing to NPM, the package is automatically available via jsDelivr:

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib/dist/pdf-lib.min.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib@X.Y.Z/dist/pdf-lib.min.js"></script>
```
