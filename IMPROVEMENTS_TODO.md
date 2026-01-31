# PDF-Lib - Propostas de Melhorias

Este documento foi gerado a partir da análise dos forks mais populares do pdf-lib e dos Pull Requests pendentes no repositório original.

## Resumo da Análise

### Forks Analisados
| Fork | Stars | Principais Melhorias |
|------|-------|---------------------|
| [pdfme/pdf-lib](https://github.com/pdfme/pdf-lib) | 26 | Retângulos arredondados, SVG melhorado, compatibilidade fontkit v2 |
| [cantoo-scribe/pdf-lib](https://github.com/cantoo-scribe/pdf-lib) | 304 | Suporte completo a SVG |
| [remdra/pdf-lib-incremental-save](https://github.com/remdra/pdf-lib-incremental-save) | 11 | Salvamento incremental para assinaturas |
| [brennanmcquerry/pdf-lib-plus-encrypt](https://github.com/brennanmcquerry/pdf-lib-plus-encrypt) | 6 | Criptografia de PDFs |

---

## TODO - Melhorias Prioritárias

### 1. ALTA PRIORIDADE - Funcionalidades Críticas

#### 1.1 ✅ Suporte a Criptografia/Descriptografia de PDFs - **IMPLEMENTADO**
- **Origem**: Fork `pdf-lib-plus-encrypt` + Issue #1326
- **Status**: ✅ **CONCLUÍDO**
- **Implementação**:
  - Criado módulo `src/core/crypto/` com suporte a MD5, RC4 e AES
  - Suporta criptografia 40-bit RC4, 128-bit RC4, 128-bit AES e 256-bit AES
  - Descriptografia de PDFs protegidos com senha
  - Criptografia ao salvar com `save({ encrypt: { ... } })`
  - Controle granular de permissões
- **Arquivos criados/modificados**:
  - `src/core/crypto/md5.ts` - Implementação MD5
  - `src/core/crypto/rc4.ts` - Implementação RC4
  - `src/core/crypto/aes.ts` - Implementação AES-CBC
  - `src/core/crypto/PDFSecurity.ts` - Gerenciador de segurança PDF
  - `src/api/PDFDocument.ts` - Métodos de criptografia
  - `src/api/PDFDocumentOptions.ts` - Opções de criptografia

#### 1.2 Suporte a SVG
- **Origem**: Fork `cantoo-scribe/pdf-lib`
- **Status**: ⏳ Pendente
- **Descrição**: Implementar métodos `drawSvg()` e `drawSvgPath()`
- **Benefícios**:
  - Desenhar gráficos vetoriais complexos
  - Importar ícones e logos em SVG
  - Melhor qualidade visual em qualquer escala
- **Arquivos a modificar**:
  - `src/api/PDFPage.ts` - Adicionar métodos drawSvg
  - `src/api/operations.ts` - Operações de renderização SVG
  - Criar `src/utils/svg.ts` - Parser de SVG para operações PDF

#### 1.3 ✅ Salvamento Incremental - **IMPLEMENTADO**
- **Origem**: Fork `remdra/pdf-lib-incremental-save`
- **Status**: ✅ **CONCLUÍDO**
- **Implementação**:
  - Método `takeSnapshot()` para capturar estado do documento
  - Método `markRefForSave(ref)` para marcar objetos modificados
  - Método `saveIncremental()` para salvar apenas as modificações
  - Preserva assinaturas digitais existentes
  - Mantém trilha de auditoria do documento
- **Arquivos criados/modificados**:
  - `src/core/writers/PDFIncrementalWriter.ts` - Escritor incremental
  - `src/api/PDFDocument.ts` - Novos métodos
  - `src/api/PDFDocumentOptions.ts` - Novas opções

---

### 2. MÉDIA PRIORIDADE - Melhorias de Funcionalidade

#### 2.1 Retângulos com Cantos Arredondados
- **Origem**: Fork `pdfme/pdf-lib`
- **Descrição**: Adicionar opção `radius` ao método `drawRectangle()`
- **Benefícios**: Elementos visuais mais modernos
- **Implementação**: Usar curvas de Bezier para os cantos
- **Arquivos a modificar**:
  - `src/api/PDFPage.ts` - Método drawRectangle
  - `src/api/operations.ts` - Operação drawRectangle

#### 2.2 ✅ Suporte a Hyperlinks - **IMPLEMENTADO**
- **Origem**: PR #1691
- **Status**: ✅ **CONCLUÍDO**
- **Descrição**: Adicionar links clicáveis em PDFs
- **Benefícios**: PDFs interativos com navegação
- **Implementação**:
  - Método `drawLink()` na classe PDFPage
  - Suporte a links para URLs externas
  - Suporte a links para páginas internas (GoTo destinations)
  - Configuração de bordas e estilos
- **Arquivos criados/modificados**:
  - `src/core/annotation/PDFLinkAnnotation.ts` - Classe de anotação de link
  - `src/core/annotation/index.ts` - Exportação do módulo
  - `src/api/PDFPage.ts` - Método drawLink
  - `src/api/PDFPageOptions.ts` - Interface PDFPageDrawLinkOptions

#### 2.3 Renomear Campos de Formulário
- **Origem**: PR #1748
- **Descrição**: Permitir renomear campos AcroForm existentes
- **Benefícios**: Maior flexibilidade na manipulação de formulários
- **Arquivos a modificar**:
  - `src/api/form/PDFField.ts` - Método rename

#### 2.4 Função de Translação de Página
- **Origem**: PR #1379
- **Descrição**: Mover/transladar conteúdo de página
- **Benefícios**: Reposicionamento de conteúdo existente
- **Arquivos a modificar**:
  - `src/api/PDFPage.ts` - Método translate

#### 2.5 Flatten Parcial de Formulários
- **Origem**: PR #1758
- **Descrição**: Flatten apenas campos específicos, não todos
- **Benefícios**: Controle granular sobre campos de formulário
- **Arquivos a modificar**:
  - `src/api/form/PDFForm.ts` - Opções de flatten seletivo

#### 2.6 Geração de Código de Barras
- **Origem**: Solicitação de usuário
- **Status**: ⏳ Pendente
- **Descrição**: Implementar geração de códigos de barras em múltiplos formatos padrão
- **Benefícios**:
  - Suporte a diversos padrões de código de barras
  - Uso em logística, varejo, identificação de produtos
  - Suporte específico para boletos bancários brasileiros
- **Formatos Suportados**:
  - **1D Linear:**
    - `Code128` - Alta densidade, alfanumérico (logística, etiquetas)
    - `Code39` - Alfanumérico, uso industrial
    - `EAN-13` / `EAN-8` - Produtos de varejo (padrão europeu)
    - `UPC-A` / `UPC-E` - Produtos de varejo (padrão americano)
    - `ITF-25` (Interleaved 2 of 5) - Numérico, boletos bancários
    - `Codabar` - Bibliotecas, bancos de sangue
    - `Code93` - Logística, complementar ao Code39
  - **2D Stacked:**
    - `PDF417` - Documentos de identidade, carteiras de motorista
    - `DataMatrix` - Componentes eletrônicos, pequenos itens
  - **Específico Brasil:**
    - `Boleto FEBRABAN` - Padrão 44 dígitos para boletos bancários
- **Arquivos a criar/modificar**:
  - `src/utils/barcode/` - Módulo de geração de código de barras
  - `src/utils/barcode/code128.ts` - Implementação Code128
  - `src/utils/barcode/code39.ts` - Implementação Code39
  - `src/utils/barcode/ean.ts` - Implementação EAN-13/EAN-8
  - `src/utils/barcode/upc.ts` - Implementação UPC-A/UPC-E
  - `src/utils/barcode/itf.ts` - Implementação ITF/Interleaved 2 of 5
  - `src/utils/barcode/boleto.ts` - Formatador de boleto brasileiro
  - `src/api/PDFPage.ts` - Método `drawBarcode()`
  - `src/api/PDFPageOptions.ts` - Interface `PDFPageDrawBarcodeOptions`

#### 2.7 Geração de QR Code
- **Origem**: Solicitação de usuário
- **Status**: ⏳ Pendente
- **Descrição**: Implementar geração de QR Codes em múltiplos formatos padrão
- **Benefícios**:
  - Suporte a QR Codes genéricos e especializados
  - Pagamentos, URLs, contatos, WiFi, etc.
  - Suporte específico para Pix brasileiro
- **Formatos Suportados**:
  - **QR Code Genérico (ISO/IEC 18004):**
    - Texto livre / URLs
    - vCard (contatos)
    - WiFi (configuração de rede)
    - E-mail / SMS / Telefone
    - Geolocalização
    - Eventos (vCalendar)
  - **Padrões de Pagamento:**
    - `EMV QR Code` - Padrão internacional de pagamentos
    - `Pix (BR Code)` - Padrão brasileiro do Banco Central
    - `SEPA QR` - Pagamentos europeus
  - **Níveis de Correção de Erro:**
    - L (7%), M (15%), Q (25%), H (30%)
  - **Versões:** 1-40 (21x21 até 177x177 módulos)
- **Arquivos a criar/modificar**:
  - `src/utils/qrcode/` - Módulo de geração de QR Code
  - `src/utils/qrcode/qrcode.ts` - Implementação QR Code (ISO 18004)
  - `src/utils/qrcode/formatters/` - Formatadores de dados
  - `src/utils/qrcode/formatters/text.ts` - Texto/URL genérico
  - `src/utils/qrcode/formatters/vcard.ts` - Contatos vCard
  - `src/utils/qrcode/formatters/wifi.ts` - Configuração WiFi
  - `src/utils/qrcode/formatters/pix.ts` - Pix (EMV BR Code)
  - `src/utils/qrcode/formatters/emv.ts` - EMV QR Code genérico
  - `src/api/PDFPage.ts` - Método `drawQRCode()`
  - `src/api/PDFPageOptions.ts` - Interface `PDFPageDrawQRCodeOptions`

---

### 3. BAIXA PRIORIDADE - Melhorias de Qualidade

#### 3.1 Integração OSS-Fuzz
- **Origem**: PR #1768
- **Descrição**: Adicionar testes de fuzzing para segurança
- **Benefícios**: Identificar vulnerabilidades de parsing

#### 3.2 PageSizes Imutáveis
- **Origem**: PR #1765
- **Descrição**: Tornar definições de tamanho de página literais e imutáveis
- **Benefícios**: Melhor type-safety em TypeScript

#### 3.3 Preservar Ordem de Objetos
- **Origem**: PR #1769
- **Descrição**: Manter ordem de objetos em PDFs com atualizações incrementais
- **Benefícios**: Compatibilidade com assinaturas digitais

#### 3.4 Manter Versão do PDF
- **Origem**: PR #1747
- **Descrição**: Preservar versão original do PDF ao salvar
- **Benefícios**: Evitar problemas de compatibilidade

#### 3.5 Metadata Producer
- **Origem**: PR #1761
- **Descrição**: Definir metadata de produtor automaticamente
- **Benefícios**: Rastreabilidade de documentos gerados

---

### 4. CORREÇÕES DE BUGS IMPORTANTES

#### 4.1 Corrupção Visual em PDFs
- **Origem**: PR #1772, Issue #951
- **Descrição**: Resolver problemas de renderização visual

#### 4.2 Encoding WinAnsi para Texto Não-Latino
- **Origem**: Issue #1152
- **Descrição**: Suportar caracteres não-latinos em dropdowns
- **Solução**: Usar encoding UTF-16 ou Unicode adequado

#### 4.3 Compatibilidade com Fontkit v2
- **Origem**: Fork `pdfme/pdf-lib`
- **Descrição**: Resolver corrupção de caracteres japoneses/chineses em subsets de fontes

#### 4.4 Validação NaN
- **Origem**: PR #1722
- **Descrição**: Corrigir problemas de validação com valores NaN

#### 4.5 Valores de Checkbox
- **Origem**: PR #1685
- **Descrição**: Melhorar manipulação de valores de checkbox

---

### 5. FUNCIONALIDADES SOLICITADAS (Longo Prazo)

#### 5.1 Extração de Texto
- **Origem**: Issues #93, #137, #177, #329, #380
- **Descrição**: Extrair texto plano de páginas PDF
- **Complexidade**: ALTA - Requer parsing de content streams

#### 5.2 Edição de Texto Existente
- **Origem**: Issues #93, #137, #177, #329, #380
- **Descrição**: Modificar texto existente em páginas
- **Complexidade**: MUITO ALTA - Requer reconstrução de content streams

#### 5.3 Suporte a Spot Colors
- **Origem**: Issue #444
- **Descrição**: Suportar cores especiais (Pantone, etc.)
- **Complexidade**: MÉDIA

---

### 6. DISTRIBUIÇÃO E PUBLICAÇÃO

#### 6.1 Publicação no NPM
- **Status**: ⏳ Avaliar
- **Descrição**: Publicar o fork como pacote NPM independente
- **Nome sugerido**: `@maxwbh/pdf-lib` ou `pdf-lib-extended`
- **Benefícios**:
  - Instalação simples via `npm install`
  - Versionamento semântico
  - Gerenciamento de dependências automático
- **Requisitos**:
  - Conta NPM configurada
  - Arquivo `package.json` atualizado com novo nome/escopo
  - README com instruções de migração
  - CHANGELOG documentando diferenças do original
- **Comandos**:
  ```bash
  npm login
  npm publish --access public
  ```

#### 6.2 Distribuição via jsDelivr (CDN)
- **Status**: ⏳ Avaliar
- **Descrição**: Disponibilizar via CDN para uso direto em browsers
- **Benefícios**:
  - Sem necessidade de build local
  - Cache global, baixa latência
  - Suporte a versões específicas
- **URLs após publicação NPM**:
  ```html
  <!-- Última versão -->
  <script src="https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib/dist/pdf-lib.min.js"></script>

  <!-- Versão específica -->
  <script src="https://cdn.jsdelivr.net/npm/@maxwbh/pdf-lib@1.18.0/dist/pdf-lib.min.js"></script>
  ```
- **Alternativa via GitHub**:
  ```html
  <script src="https://cdn.jsdelivr.net/gh/Maxwbh/pdf-lib@main/dist/pdf-lib.min.js"></script>
  ```

#### 6.3 Preparação para Publicação
- **Checklist**:
  - [ ] Atualizar `package.json` com novo nome/escopo
  - [ ] Atualizar versão para `1.18.0` (indica novas features)
  - [ ] Criar/atualizar `CHANGELOG.md`
  - [ ] Atualizar `README.md` com novas funcionalidades
  - [ ] Executar build de produção (`npm run build`)
  - [ ] Executar todos os testes (`npm test`)
  - [ ] Verificar arquivos em `dist/`
  - [ ] Configurar `.npmignore` adequadamente
  - [ ] Adicionar badges no README (npm version, downloads, etc.)

---

## Roadmap Sugerido

### Fase 1 - Fundação (Semanas 1-4)
- [ ] Implementar suporte a SVG (`drawSvgPath`, `drawSvg`)
- [ ] Adicionar retângulos arredondados
- [ ] Integrar correções de bugs críticos (PR #1772)

### Fase 2 - Funcionalidades Core (Semanas 5-8)
- [x] ✅ Implementar salvamento incremental - **CONCLUÍDO**
- [x] ✅ Adicionar suporte a hyperlinks - **CONCLUÍDO**
- [ ] Implementar flatten parcial de formulários

### Fase 3 - Segurança (Semanas 9-12)
- [x] ✅ Adicionar suporte a criptografia/descriptografia - **CONCLUÍDO**
- [ ] Integrar OSS-Fuzz para testes de segurança
- [ ] Melhorar validação de entrada

### Fase 4 - Polimento (Semanas 13-16)
- [ ] Compatibilidade com fontkit v2
- [ ] Melhorias de encoding para i18n
- [x] ✅ Documentação em português - **CONCLUÍDO**

---

## Referências

### Forks Principais
- https://github.com/cantoo-scribe/pdf-lib
- https://github.com/pdfme/pdf-lib
- https://github.com/remdra/pdf-lib-incremental-save
- https://github.com/brennanmcquerry/pdf-lib-plus-encrypt

### PRs Relevantes
- https://github.com/Hopding/pdf-lib/pull/1772 - Fix visual corruption
- https://github.com/Hopding/pdf-lib/pull/1768 - OSS-Fuzz
- https://github.com/Hopding/pdf-lib/pull/1691 - Hyperlinks
- https://github.com/Hopding/pdf-lib/pull/1748 - Rename form fields
- https://github.com/Hopding/pdf-lib/pull/1758 - Partial flatten

### Discussões
- https://github.com/Hopding/pdf-lib/discussions/1631 - Future of pdf-lib

---

*Documento gerado em 2026-01-31 a partir da análise de forks e PRs do repositório pdf-lib*
