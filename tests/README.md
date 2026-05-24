# Testes de QA - Nova Campanha de Outbound

Suite completa de testes automatizados para a funcionalidade "Nova Campanha de Outbound" usando Playwright.

## Estrutura dos Testes

### Arquivos

- **`campaign.spec.ts`** — Testes principais cobrindo os cenários solicitados
  - Happy path com segmento (TC-01)
  - Happy path com CSV (TC-02)
  - Validação de campos obrigatórios (TC-09, crítico)
  - Confirmação ao cancelar (TC-21)
  - Modal de confirmação ao lançar (TC-20)
  - Salvar rascunho (TC-19)
  - Feedback visível por tempo mínimo (TC-22)

- **`campaign-smoke.spec.ts`** — Suite de smoke tests críticos
  - Foca em validações essenciais
  - Documenta 9 bugs conhecidos
  - Deve ser executado antes de qualquer merge

- **`campaign-happy-path.spec.ts`** — Testes do happy path com helpers
  - Demonstra uso dos helpers reutilizáveis
  - Cobre diferentes combinações de dados
  - Testes de diferentes objetivos, canais e audiências

- **`helpers.ts`** — Funções auxiliares reutilizáveis
  - Abstrações para navegação
  - Helpers de preenchimento de campos
  - Funções de ação (cliques, submits)
  - Validações de estado da UI

- **`playwright.config.ts`** — Configuração do Playwright
  - Servidor web automático (`npm run dev`)
  - Reports em HTML
  - Trace e screenshots em caso de falha

## Executar os Testes

### Instalação de Dependências

```bash
cd project
npm install
```

### Rodar Todos os Testes

```bash
npm run test
```

### Rodar Suite Específica

```bash
# Apenas smoke tests (críticos)
npm run test -- campaign-smoke.spec.ts

# Apenas happy path
npm run test -- campaign-happy-path.spec.ts

# Apenas tests principais
npm run test -- campaign.spec.ts
```

### Rodar Teste Específico

```bash
npm run test -- --grep "TC-01"
```

### Modo Interativo (Debug)

```bash
npm run test -- --ui
```

### Gerar Report HTML

```bash
npm run test
npx playwright show-report
```

## Convenções e Boas Práticas

### 1. **Test IDs para Seletores**
Todos os seletores usam `data-testid` para maior estabilidade:

```typescript
await page.fill('[data-testid="input-name"]', 'Meu Valor');
```

### 2. **Helpers Reutilizáveis**
Evita repetição de código. Exemplo:

```typescript
// ✅ Bom: Usa helpers
await fillBasicInfo(page, {
  name: 'Campanha',
  objective: 'sales',
});

// ❌ Ruim: Código repetido
await page.fill('[data-testid="input-name"]', 'Campanha');
await page.check('[data-testid="radio-sales"]');
```

### 3. **beforeEach/afterEach para Setup**
Reset automático antes/depois de cada teste:

```typescript
test.beforeEach(async ({ page }) => {
  await openCampaignForm(page);
});

test.afterEach(async ({ page }) => {
  await resetForm(page);
});
```

### 4. **Dados Válidos por Padrão**
Testes usam dados válidos que satisfazem AC:
- Nome: mínimo 3 caracteres, máximo 80
- Data de início: sempre `amanhã` (evita erro com data passada)
- Agente: sempre selecionado
- Canal: sempre selecionado
- Audiência: sempre preenchida

### 5. **Comentários Apenas Onde Necessário**
Comentários indicam:
- Motivo não-óbvio de uma ação
- Bugs conhecidos documentados
- Contexto que pode mudar

### 6. **Nomenclatura Clara**
- TC-NN: Número do caso de teste
- BUG-NN: Número do bug documentado
- Nomes de funções descrevem a ação

### 7. **Assertions Explícitas**
Validações deixam claro o que está sendo testado:

```typescript
expect(feedbackText).toContain(campaignName);
expect(feedbackText).toContain('lançada com sucesso');
```

## Bugs Documentados

### Críticos (Bloqueadores)
- **BUG-09**: Lançar sem validação de campos obrigatórios (Smoke test)

### Altos (Impedem uso)
- **BUG-01**: Nome aceita < 3 caracteres
- **BUG-02**: Nome aceita > 80 caracteres
- **BUG-04**: Contador de descrição reflete nome
- **BUG-08**: Preview de leads sempre exibe 0
- **BUG-19**: Botão "Salvar rascunho" desabilitado
- **BUG-20**: Falta modal de confirmação ao lançar
- **BUG-21**: Falta confirmação ao cancelar

### Médios (Afetam UX)
- **BUG-22**: Feedback desaparece em < 3 segundos

Veja `bugs.md` para documentação completa.

## Executar e Debugar

### Debug de Teste Específico

```bash
npm run test -- --debug --grep "TC-01"
```

### Pausar Execução em Ponto Específico

```typescript
await page.pause(); // Abre inspector interativo
```

### Capturar Screenshot

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Aumentar Timeout

```typescript
test.setTimeout(60000); // 60 segundos
```

## Estratégia de Teste

### 1. Smoke Tests (Rápido)
```bash
npm run test -- campaign-smoke.spec.ts
```
Executa em ~2-3 minutos. Detecta bugs críticos.

### 2. Happy Path (Completo)
```bash
npm run test -- campaign-happy-path.spec.ts
```
Cobre fluxos principais com diferentes combinações.

### 3. Testes Adicionais
```bash
npm run test -- campaign.spec.ts
```
Cobre edge cases e comportamentos específicos.

## Adição de Novos Testes

### Template

```typescript
test('TC-XX Descrição breve do cenário', async ({ page }) => {
  // Arrange: Setup inicial
  await openCampaignForm(page);
  await fillBasicInfo(page, { name: 'Test', objective: 'sales' });

  // Act: Ação principal
  await launchCampaign(page);

  // Assert: Validações
  const feedback = await waitForFeedback(page);
  expect(feedback).toContain('sucesso');
});
```

### Recomendações

1. Use helpers já existentes
2. Mantenha testes simples e focados
3. Use data-testid em novos campos da UI
4. Documente bugs conhecidos com `test.skip()`
5. Agrupe testes relacionados com `test.describe()`

## Troubleshooting

### Teste falha com "element not found"
- Verifique se o `data-testid` está correto na aplicação
- A página carregou completamente? (`await page.waitForLoadState()`)

### Teste falha de forma intermitente
- Aumente timeouts para elementos específicos
- Use `await page.waitForLoadState('networkidle')`
- Verifique se há JavaScript assíncrono sendo executado

### Servidor não inicia
```bash
npm run dev # Tente manualmente primeiro
```

### Report não gera
```bash
npx playwright show-report
```

## Próximas Melhorias

- [ ] Testes de validação de limites (BUG-01, 02, 03, etc)
- [ ] Testes de data (BUG-10, 11, 12)
- [ ] Testes de campos numéricos (BUG-14, 15, 16, 17, 18)
- [ ] Testes com arquivo CSV inválido (BUG-07)
- [ ] Testes de variáveis em mensagem (BUG-06)
- [ ] Testes de E2E com backend (após API estar pronta)
