# Roadmap — @maxwbh/pdf-lib

Este documento descreve o plano de evolução da biblioteca, organizado por versões e prioridade.

> **Versão atual:** `1.18.0` — publicada em [NPM](https://www.npmjs.com/package/@maxwbh/pdf-lib)
> **Repositório:** https://github.com/Maxwbh/pdf-lib

---

## Versões Lançadas

### ✅ v1.18.0 — Fork Inicial (Lançado)

Fork do [pdf-lib](https://github.com/Hopding/pdf-lib) original com as seguintes adições:

| Funcionalidade | Status |
|----------------|--------|
| PDF Encryption/Decryption (RC4 40/128-bit, AES 128/256-bit) | ✅ Concluído |
| Salvamento Incremental (preserva assinaturas digitais) | ✅ Concluído |
| Hyperlinks (URL externos e navegação interna) | ✅ Concluído |
| Compatibilidade com Node.js 22+ | ✅ Concluído |
| TypeScript 5.3 (ts-patch substitui ttypescript) | ✅ Concluído |
| Rollup 4 + Jest 29 | ✅ Concluído |
| Documentação em Português | ✅ Concluído |
| Publicação NPM + jsDelivr CDN | ✅ Concluído |
| Testes unitários (668 testes) | ✅ Concluído |

---

## Próximas Versões

### 🔵 v1.19.0 — Correções e Melhorias Imediatas

**Estimativa:** Curto prazo

#### Correções de Bugs
- [ ] **Corrupção Visual em PDFs** — Resolver problemas de renderização (PR #1772, Issue #951)
- [ ] **Validação NaN** — Corrigir problemas de validação com valores NaN (PR #1722)
- [ ] **Valores de Checkbox** — Melhorar manipulação de valores de checkbox (PR #1685)
- [ ] **Encoding WinAnsi** — Suporte a caracteres não-latinos em dropdowns (Issue #1152)

#### Melhorias de Qualidade
- [ ] **PageSizes Imutáveis** — Tornar definições de tamanho de página literais e imutáveis (PR #1765)
- [ ] **Manter Versão do PDF** — Preservar versão original do PDF ao salvar (PR #1747)
- [ ] **Metadata Producer** — Definir metadata de produtor automaticamente (PR #1761)
- [ ] **Preservar Ordem de Objetos** — Manter ordem em PDFs com atualizações incrementais (PR #1769)

---

### 🟡 v1.20.0 — Novas Funcionalidades de Página

**Estimativa:** Médio prazo

#### Funcionalidades de Desenho
- [ ] **Retângulos com Cantos Arredondados** — Adicionar opção `borderRadius` ao `drawRectangle()`
  ```js
  page.drawRectangle({ x: 50, y: 50, width: 200, height: 100, borderRadius: 10 });
  ```
- [ ] **Função de Translação de Página** — Mover/transladar conteúdo de página (PR #1379)
  ```js
  page.translate(x, y);
  ```

#### Melhorias de Formulários
- [ ] **Renomear Campos de Formulário** — Permitir renomear campos AcroForm existentes (PR #1748)
  ```js
  form.getTextField('old-name').rename('new-name');
  ```
- [ ] **Flatten Parcial de Formulários** — Flatten apenas campos específicos (PR #1758)
  ```js
  form.flatten({ fields: ['field1', 'field2'] });
  ```

---

### 🟠 v1.21.0 — Suporte a SVG Completo

**Estimativa:** Médio prazo

Baseado no fork [cantoo-scribe/pdf-lib](https://github.com/cantoo-scribe/pdf-lib).

- [ ] **`drawSvgPath()`** — Melhorias no suporte atual a paths SVG
- [ ] **`drawSvg()`** — Renderizar SVG completo diretamente em página
  ```js
  const svgMarkup = '<svg>...</svg>';
  page.drawSvg(svgMarkup, { x: 50, y: 50, width: 200, height: 200 });
  ```
- [ ] **Suporte a elementos SVG:**
  - `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polyline>`, `<polygon>`
  - `<text>` com fontes incorporadas
  - `<image>` com imagens embutidas
  - `<g>` (grupos) e `<use>` (reutilização)
  - `<linearGradient>`, `<radialGradient>`
  - `<clipPath>` e `<mask>`

---

### 🔴 v2.0.0 — Geração de Código de Barras e QR Code

**Estimativa:** Longo prazo — versão major por impacto no bundle

#### 2.1 Código de Barras (`drawBarcode()`)

Formatos **1D Linear:**

| Formato | Uso |
|---------|-----|
| `Code128` | Logística, etiquetas (alfanumérico) |
| `Code39` | Industrial (alfanumérico) |
| `EAN-13` / `EAN-8` | Produtos de varejo (padrão europeu) |
| `UPC-A` / `UPC-E` | Produtos de varejo (padrão americano) |
| `ITF-25` | Boletos bancários, embalagens (numérico) |
| `Codabar` | Bibliotecas, bancos de sangue |
| `Code93` | Logística complementar |

Formatos **2D Stacked:**

| Formato | Uso |
|---------|-----|
| `PDF417` | Documentos de identidade, passaportes |
| `DataMatrix` | Componentes eletrônicos, itens pequenos |

**Específico Brasil:**

| Formato | Uso |
|---------|-----|
| `Boleto FEBRABAN` | Boletos bancários (padrão 44 dígitos) |

```js
// API proposta
page.drawBarcode('123456789012', {
  format: 'EAN-13',    // ou 'Code128', 'ITF-25', etc.
  x: 50, y: 100,
  width: 200, height: 80,
  showText: true,      // exibir número abaixo
  fontSize: 10,
});

// Boleto bancário brasileiro
page.drawBarcode('34191.09008 09004.301806 07959.450001 4 92210000058700', {
  format: 'Boleto',
  x: 50, y: 200,
  width: 400,
});
```

#### 2.2 QR Code (`drawQRCode()`)

**Formatos genéricos (ISO/IEC 18004):**

| Conteúdo | Exemplo |
|----------|---------|
| Texto / URL | `https://github.com/Maxwbh/pdf-lib` |
| vCard | Contatos profissionais |
| WiFi | `WIFI:T:WPA;S:MinhaRede;P:Senha123;;` |
| E-mail / SMS / Telefone | Links diretos |
| Geolocalização | `geo:-23.5505,-46.6333` |
| Evento (vCalendar) | Convites para eventos |

**Padrões de pagamento:**

| Padrão | Uso |
|--------|-----|
| `EMV QR Code` | Pagamentos internacionais |
| `Pix (BR Code)` | Pagamento instantâneo brasileiro (Banco Central) |
| `SEPA QR` | Pagamentos europeus |

**Níveis de correção de erro:** L (7%) · M (15%) · Q (25%) · H (30%)

```js
// API proposta — QR Code genérico
page.drawQRCode('https://github.com/Maxwbh/pdf-lib', {
  x: 50, y: 50,
  size: 100,
  errorCorrectionLevel: 'M',
  color: rgb(0, 0, 0),
  backgroundColor: rgb(1, 1, 1),
});

// Pix
page.drawQRCode({
  format: 'pix',
  key: '12345678900',          // CPF, CNPJ, e-mail, telefone ou chave aleatória
  name: 'João Silva',
  city: 'São Paulo',
  amount: 150.00,
  description: 'Pagamento #001',
}, { x: 50, y: 50, size: 120 });

// vCard
page.drawQRCode({
  format: 'vcard',
  name: 'Maxwell Oliveira',
  email: 'maxwbh@gmail.com',
  phone: '+5511999999999',
  url: 'https://github.com/Maxwbh',
}, { x: 200, y: 50, size: 120 });

// WiFi
page.drawQRCode({
  format: 'wifi',
  ssid: 'MinhaRede',
  password: 'Senha123',
  encryption: 'WPA',
}, { x: 350, y: 50, size: 120 });
```

---

### 🟣 v2.1.0 — Funcionalidades Avançadas

**Estimativa:** Longo prazo

#### Compatibilidade com Fontkit v2
- [ ] Resolver corrupção de caracteres japoneses/chineses em subsets de fontes
- [ ] Baseado no fork [pdfme/pdf-lib](https://github.com/pdfme/pdf-lib)

#### Segurança
- [ ] **Integração OSS-Fuzz** — Testes de fuzzing para vulnerabilidades de parsing (PR #1768)
- [ ] **Melhoria na validação de entrada** — Sanitização de dados recebidos

---

### 🔮 Longo Prazo (v3.x)

Funcionalidades de alta complexidade — sujeitas a análise de viabilidade:

#### Extração de Texto
- [ ] Extrair texto plano de páginas PDF (Issues #93, #137, #177, #329, #380)
- **Complexidade:** Alta — requer parsing completo de content streams

#### Edição de Texto Existente
- [ ] Modificar texto já existente em páginas PDF
- **Complexidade:** Muito Alta — requer reconstrução de content streams

#### Suporte a Spot Colors
- [ ] Suporte a cores especiais (Pantone, CMYK separations) — Issue #444
- **Complexidade:** Média

---

## Resumo Visual

```
v1.18.0 ──────────────────── ATUAL
   │  ✅ Criptografia
   │  ✅ Salvamento Incremental
   │  ✅ Hyperlinks
   │  ✅ Node.js 22 / TypeScript 5.3
   │
v1.19.0 ── Correções de Bugs
   │  🐛 Corrupção visual
   │  🐛 NaN / Checkbox
   │  🔧 PageSizes, Versão PDF, Metadata
   │
v1.20.0 ── Novas Funcionalidades de Página
   │  🆕 Retângulos arredondados
   │  🆕 Translação de página
   │  🆕 Renomear / Flatten parcial de campos
   │
v1.21.0 ── Suporte SVG Completo
   │  🆕 drawSvg() completo
   │  🆕 Gradientes, clipPath, mask
   │
v2.0.0 ─── Código de Barras e QR Code  ← VERSÃO MAJOR
   │  🆕 Code128, EAN-13, ITF-25, Boleto
   │  🆕 QR Code genérico, Pix, vCard, WiFi
   │
v2.1.0 ─── Funcionalidades Avançadas
   │  🆕 Fontkit v2
   │  🔒 OSS-Fuzz, segurança
   │
v3.x ────── Longo Prazo
      🔮 Extração de texto
      🔮 Edição de texto existente
      🔮 Spot Colors
```

---

## Como Contribuir

Tem interesse em implementar algum item do roadmap? Abra uma issue em:
https://github.com/Maxwbh/pdf-lib/issues

Por favor, inclua:
1. A funcionalidade que pretende implementar
2. Abordagem técnica proposta
3. Se há um PR/issue no repositório original como referência

Consulte o [CONTRIBUTING.md](docs/CONTRIBUTING.md) para instruções de configuração do ambiente.

---

*Atualizado em 2026-03-02*
