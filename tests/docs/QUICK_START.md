# Quick Start - Testes de QA

Guia rápido para começar a rodar os testes.

## Antes de Rodar

```bash
cd project
npm install
```

## Rodar Testes

### Opção 1: UI Interativa (Recomendado para Aprender)

```bash
npm run test:ui
```

Abre interface visual onde você pode:
- ▶️ Rodar testes individuais
- 👀 Ver execução em tempo real
- 🔍 Inspecionar elementos
- 📸 Ver screenshots

### Opção 2: Modo Headless (Terminal)

```bash
npm run test
```

Executa todos os testes e exibe relatório no terminal.

### Opção 3: Suite Específica

```bash
# Apenas smoke tests (rápido ~2-3 min)
npm run test:smoke

# Apenas happy path
npm run test:happy

# Apenas validações
npm run test -- campaign-validations.spec.ts
```

### Opção 4: Debug Interativo

```bash
npm run test:debug
```

Pausa a execução e abre inspector para inspecionar a página.

## Ver Relatório

Depois de rodar os testes:

```bash
npm run test:report
```

Abre relatório HTML com:
- ✅ Testes que passaram
- ❌ Testes que falharam
- 📸 Screenshots
- 🎬 Vídeos de execução

## Estrutura dos Testes

```
tests/
├── campaign.spec.ts              ← Testes principais
├── campaign-smoke.spec.ts        ← Smoke tests críticos (BUG-09)
├── campaign-happy-path.spec.ts   ← Happy path com helpers
├── campaign-validations.spec.ts  ← Validações de limites
├── helpers.ts                    ← Funções reutilizáveis
├── playwright.config.ts          ← Configuração
├── README.md                     ← Documentação detalhada
└── QUICK_START.md               ← Este arquivo
```

## Testes Inclusos

### Campaign.spec.ts (7 testes)
- ✅ TC-01: Happy path com segmento
- ✅ TC-02: Happy path com CSV
- ✅ TC-09: Validação de campos obrigatórios (CRÍTICO)
- ✅ TC-21: Confirmação ao cancelar
- ✅ TC-20: Modal de confirmação ao lançar
- ✅ TC-19: Salvar rascunho
- ✅ TC-22: Feedback visível por tempo

### Campaign-smoke.spec.ts (9 testes - Críticos)
- 🔴 BUG-09: Validação de campos obrigatórios
- 🔴 BUG-01: Nome com < 3 caracteres
- 🔴 BUG-02: Nome com > 80 caracteres
- 🔴 BUG-04: Contador de descrição errado
- 🔴 BUG-08: Preview de leads sempre 0
- 🔴 BUG-19: Salvar rascunho desabilitado
- 🔴 BUG-20: Modal de confirmação ao lançar
- 🔴 BUG-21: Confirmação ao cancelar
- 🔴 BUG-22: Feedback desaparece rápido

### Campaign-happy-path.spec.ts (10 testes)
- 📊 3 testes happy path com diferentes dados
- 📊 3 testes com diferentes objetivos
- 📊 4 testes com diferentes combinações de canais

### Campaign-validations.spec.ts (20+ testes)
- 🔍 Validações de limites de campos
- 🔍 Contadores de caracteres
- 🔍 Edge cases e caracteres especiais
- 🔍 Limpeza e reset de campos

## Casos de Teste (Mapeamento)

| TC | Descrição | Arquivo | Status |
|---|---|---|---|
| TC-01 | Happy path com segmento | campaign.spec.ts | ✅ |
| TC-02 | Happy path com CSV | campaign.spec.ts | ✅ |
| TC-09 | Validação campos obrigatórios (CRÍTICO) | campaign.spec.ts | ⚠️ |
| TC-19 | Salvar rascunho | campaign.spec.ts | ⚠️ |
| TC-20 | Modal confirmação lançamento | campaign.spec.ts | ⚠️ |
| TC-21 | Confirmação cancelamento | campaign.spec.ts | ⚠️ |
| TC-22 | Feedback tempo mínimo | campaign.spec.ts | ⚠️ |

**Status:**
- ✅ Deve passar se funcionalidade está ok
- ⚠️ Documenta comportamento esperado; pode falhar por bugs conhecidos

## Bugs Documentados

| ID | Severidade | Descrição | Smoke | Status |
|---|---|---|---|---|
| BUG-09 | 🔴 CRÍTICA | Sem validação de campos obrigatórios | ✅ | 🐛 Confirmado |
| BUG-01 | 🔴 Alta | Nome < 3 caracteres | ✅ | 🐛 Confirmado |
| BUG-02 | 🔴 Alta | Nome > 80 caracteres | ✅ | 🐛 Confirmado |
| BUG-04 | 🔴 Alta | Contador descrição reflete nome | ✅ | 🐛 Confirmado |
| BUG-08 | 🔴 Alta | Preview leads sempre 0 | ✅ | 🐛 Confirmado |
| BUG-19 | 🔴 Alta | Salvar rascunho desabilitado | ✅ | 🐛 Confirmado |
| BUG-20 | 🔴 Alta | Falta modal de confirmação | ✅ | 🐛 Confirmado |
| BUG-21 | 🟡 Média | Falta confirmação ao cancelar | ✅ | 🐛 Confirmado |
| BUG-22 | 🟡 Média | Feedback desaparece < 3s | ✅ | 🐛 Confirmado |

## Executar Teste Específico

```bash
# Por número do caso de teste
npm run test -- --grep "TC-01"

# Por número do bug
npm run test -- --grep "BUG-09"

# Por palavra-chave
npm run test -- --grep "Happy path"

# Por arquivo
npm run test -- campaign-smoke.spec.ts
```

## Troubleshooting Rápido

### "element not found"
```bash
# Verifique se a aplicação está rodando
npm run dev

# Em outro terminal, rode os testes
npm run test:ui
```

### "timeout waiting for"
```bash
# Aumente timeout no test
test.setTimeout(60000);
```

### "failed to connect"
```bash
# Certifique que o servidor está em http://localhost:5173
npm run dev
```

## Workflow Recomendado

### Para Desenvolvimento
```bash
npm run dev          # Terminal 1: Roda aplicação
npm run test:ui      # Terminal 2: Testes com UI
```

### Antes de Merge
```bash
npm run test:smoke   # Roda smoke tests críticos
npm run test         # Roda suite completa
npm run test:report  # Gera relatório
```

### Para Debugging
```bash
npm run test -- --debug --grep "TC-01"
```

## Helpers Disponíveis

Veja `helpers.ts` para funções reutilizáveis:

```typescript
// Navegação
await openCampaignForm(page);
await resetForm(page);

// Preenchimento
await fillBasicInfo(page, { name: 'Test', objective: 'sales' });
await selectAgent(page, 'a1');
await fillInitialMessage(page, 'Oi {{nome}}');

// Ações
await launchCampaign(page);
await saveDraft(page);
await cancelForm(page);

// Validações
const feedback = await waitForFeedback(page);
await expectFeedbackContains(page, 'sucesso');
```

## Adicionar Novo Teste

```typescript
test('Meu novo teste', async ({ page }) => {
  await openCampaignForm(page);
  
  // Arrange
  await fillBasicInfo(page, { name: 'Test', objective: 'sales' });
  
  // Act
  await launchCampaign(page);
  
  // Assert
  const feedback = await waitForFeedback(page);
  expect(feedback).toContain('sucesso');
});
```

## Próximos Passos

1. ✅ Rodar smoke tests: `npm run test:smoke`
2. ✅ Verificar relatório: `npm run test:report`
3. ✅ Explorar UI: `npm run test:ui`
4. ✅ Adicionar novos testes conforme necessário

---

**Dúvidas?** Veja `README.md` para documentação completa.
