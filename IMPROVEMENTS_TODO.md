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

#### 1.1 Suporte a Criptografia/Descriptografia de PDFs
- **Origem**: Fork `pdf-lib-plus-encrypt` + Issue #1326
- **Descrição**: Adicionar capacidade de abrir e salvar PDFs protegidos por senha
- **Benefícios**:
  - Manipular PDFs criptografados sem erros
  - Criar PDFs com proteção por senha
  - Diferenciar entre senha de abertura e senha de permissões
- **Arquivos a modificar**:
  - `src/api/PDFDocument.ts` - Adicionar opções de criptografia
  - `src/core/` - Criar módulo de criptografia (RC4, AES)

#### 1.2 Suporte a SVG
- **Origem**: Fork `cantoo-scribe/pdf-lib`
- **Descrição**: Implementar métodos `drawSvg()` e `drawSvgPath()`
- **Benefícios**:
  - Desenhar gráficos vetoriais complexos
  - Importar ícones e logos em SVG
  - Melhor qualidade visual em qualquer escala
- **Arquivos a modificar**:
  - `src/api/PDFPage.ts` - Adicionar métodos drawSvg
  - `src/api/operations.ts` - Operações de renderização SVG
  - Criar `src/utils/svg.ts` - Parser de SVG para operações PDF

#### 1.3 Salvamento Incremental
- **Origem**: Fork `remdra/pdf-lib-incremental-save`
- **Descrição**: Permitir salvar apenas as modificações, preservando o documento original
- **Benefícios**:
  - Essencial para assinaturas digitais
  - Preserva trilha de auditoria
  - Mais eficiente para arquivos grandes
- **API proposta**:
  ```typescript
  await pdfDoc.takeSnapshot();
  await pdfDoc.markRefForSave(pageRef);
  const incrementalBytes = await pdfDoc.saveIncremental(snapshot);
  ```
- **Arquivos a modificar**:
  - `src/api/PDFDocument.ts` - Novos métodos
  - `src/core/writers/PDFWriter.ts` - Lógica de escrita incremental

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

#### 2.2 Suporte a Hyperlinks
- **Origem**: PR #1691
- **Descrição**: Adicionar links clicáveis em PDFs
- **Benefícios**: PDFs interativos com navegação
- **Arquivos a modificar**:
  - `src/api/PDFPage.ts` - Método para criar links
  - `src/core/annotation/` - Anotações de link

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

## Roadmap Sugerido

### Fase 1 - Fundação (Semanas 1-4)
- [ ] Implementar suporte a SVG (`drawSvgPath`, `drawSvg`)
- [ ] Adicionar retângulos arredondados
- [ ] Integrar correções de bugs críticos (PR #1772)

### Fase 2 - Funcionalidades Core (Semanas 5-8)
- [ ] Implementar salvamento incremental
- [ ] Adicionar suporte a hyperlinks
- [ ] Implementar flatten parcial de formulários

### Fase 3 - Segurança (Semanas 9-12)
- [ ] Adicionar suporte a criptografia/descriptografia
- [ ] Integrar OSS-Fuzz para testes de segurança
- [ ] Melhorar validação de entrada

### Fase 4 - Polimento (Semanas 13-16)
- [ ] Compatibilidade com fontkit v2
- [ ] Melhorias de encoding para i18n
- [ ] Documentação e exemplos

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
