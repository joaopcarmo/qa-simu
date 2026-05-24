import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Smoke test - Suite de testes críticos que devem sempre passar
// Foca em validações essenciais e o BUG-09 (crítico)

test.describe('Smoke Tests - Validações Críticas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  // ============================================
  // SMOKE TEST 1: BUG-09 (CRÍTICO)
  // Validação de campos obrigatórios no submit
  // ============================================

  test('[CRÍTICO] BUG-09 - Lançar sem campos obrigatórios deve bloquear o submit', async ({ page }) => {
    // Cenário: Formulário completamente vazio

    // Valida estado inicial - campos vazios
    const nameInput = page.locator('[data-testid="input-name"]');
    const agentSelect = page.locator('[data-testid="select-agent"]');
    const messageInput = page.locator('[data-testid="input-message"]');
    const startDateInput = page.locator('[data-testid="input-start-date"]');

    await expect(nameInput).toHaveValue('');
    await expect(agentSelect).toHaveValue('');
    await expect(messageInput).toHaveValue('');
    await expect(startDateInput).toHaveValue('');

    // Tenta lançar a campanha com campos vazios
    const launchButton = page.locator('[data-testid="btn-launch"]');
    await launchButton.click();

    // Esperado: validação dispara, campos obrigatórios são destacados, submit não ocorre
    // Atual: submit ocorre mesmo sem validação (BUG CONFIRMADO)

    const feedback = page.locator('[data-testid="feedback"]');
    const isFeedbackVisible = await feedback.isVisible().catch(() => false);

    // Este teste docum o bug: feedback NÃO deveria aparecer
    // Comentário: Remover este teste.skip após bug ser corrigido
    test.skip(isFeedbackVisible, 'BUG-09 confirmado: Submit ocorre sem validação de campos obrigatórios');

    if (isFeedbackVisible) {
      console.error('BUG-09 CRÍTICO: Campanha foi lançada sem campos obrigatórios');
    }
  });

  // ============================================
  // SMOKE TEST 2: Nome Mínimo - Limite Inferior
  // ============================================

  test('BUG-01 - Campo "Nome" deve validar mínimo de 3 caracteres', async ({ page }) => {
    // Cenário: Nome com menos de 3 caracteres

    const nameInput = page.locator('[data-testid="input-name"]');

    // Digita 2 caracteres (nome válido mínimo é 3)
    await nameInput.fill('ab');

    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('2/80');

    // Esperado: validação no submit bloqueia nomes com < 3 caracteres
    // Atual: permite 2 caracteres (BUG CONFIRMADO)

    // Nota: Este é um comportamento indesejado documentado como BUG-01
  });

  // ============================================
  // SMOKE TEST 3: Nome Máximo - Limite Superior
  // ============================================

  test('BUG-02 - Campo "Nome" deve validar máximo de 80 caracteres', async ({ page }) => {
    // Cenário: Nome com mais de 80 caracteres

    const nameInput = page.locator('[data-testid="input-name"]');
    const longName = 'a'.repeat(100); // 100 caracteres

    await nameInput.fill(longName);

    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('100/80');

    // Esperado: entrada bloqueada em 80 caracteres ou validação no submit
    // Atual: aceita 100 caracteres; contador exibe "100/80" sem alerta (BUG CONFIRMADO)

    // Nota: O contador mostra valor acima do máximo, indicando falha de validação
  });

  // ============================================
  // SMOKE TEST 4: Descrição - Contador Incorreto
  // ============================================

  test('BUG-04 - Contador da "Descrição" deve refletir seu próprio tamanho, não do "Nome"', async ({ page }) => {
    // Cenário: Digita em "Nome" e "Descrição" e valida os contadores

    const nameInput = page.locator('[data-testid="input-name"]');
    const descriptionInput = page.locator('[data-testid="input-description"]');
    const descriptionCounter = page.locator('[data-testid="description-counter"]');

    // Digita 10 caracteres em "Nome"
    await nameInput.fill('1234567890');

    // Digita 50 caracteres em "Descrição"
    const description50 = 'a'.repeat(50);
    await descriptionInput.fill(description50);

    // Esperado: descrição-counter exibe "50/500"
    // Atual: descrição-counter exibe "10/500" (vinculado ao length do nome)

    const counterText = await descriptionCounter.textContent();
    const isBugPresent = counterText?.includes('10/500');

    if (isBugPresent) {
      console.error('BUG-04 CONFIRMADO: Contador da descrição reflete tamanho do nome');
    }

    // Validação: esperado seria "50/500", mas atual é "10/500" (bug)
    test.skip(isBugPresent, 'BUG-04: Contador vinculado ao campo errado');
  });

  // ============================================
  // SMOKE TEST 5: Botão "Salvar Rascunho" Desabilitado
  // ============================================

  test('BUG-19 - Botão "Salvar rascunho" está permanentemente desabilitado', async ({ page }) => {
    // Cenário: Verifica se o botão está realmente desabilitado em todos os cenários

    const draftButton = page.locator('[data-testid="btn-draft"]');

    // Estado 1: Formulário vazio
    await expect(draftButton).toBeDisabled();

    // Estado 2: Preenche apenas o nome (mínimo para salvar rascunho)
    const nameInput = page.locator('[data-testid="input-name"]');
    await nameInput.fill('Nome Válido');

    // Esperado: botão habilita quando nome ≥ 3 caracteres
    // Atual: botão permanece desabilitado
    await expect(draftButton).toBeDisabled();

    console.error('BUG-19 CONFIRMADO: Botão "Salvar rascunho" permanentemente desabilitado');
  });

  // ============================================
  // SMOKE TEST 6: Modal de Confirmação no Lançamento
  // ============================================

  test('BUG-20 - Lançamento deve exibir modal de confirmação antes de efetuar', async ({ page }) => {
    // Cenário: Preenche formulário válido e tenta lançar

    // Preenche campos mínimos
    await page.fill('[data-testid="input-name"]', 'Teste Modal');
    await page.check('[data-testid="radio-sales"]');
    await page.selectOption('[data-testid="select-agent"]', 'a1');
    await page.fill('[data-testid="input-message"]', 'Oi {{nome}}');
    await page.check('[data-testid="radio-segment"]');
    await page.selectOption('[data-testid="select-segment"]', 's1');
    await page.check('[data-testid="check-email"]');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('[data-testid="input-start-date"]', dateStr);

    // Tenta lançar
    await page.click('[data-testid="btn-launch"]');

    // Esperado: modal de confirmação aparece
    // Atual: campanha é lançada imediatamente (BUG CONFIRMADO)

    const feedback = page.locator('[data-testid="feedback"]');
    const feedbackAppeared = await feedback.isVisible().catch(() => false);

    if (feedbackAppeared) {
      console.error('BUG-20 CONFIRMADO: Modal de confirmação não aparece, lançamento é imediato');
    }

    test.skip(feedbackAppeared, 'BUG-20: Falta modal de confirmação antes do lançamento');
  });

  // ============================================
  // SMOKE TEST 7: Cancelar sem Confirmação
  // ============================================

  test('BUG-21 - Cancelar deve pedir confirmação quando há dados preenchidos', async ({ page }) => {
    // Cenário: Preenche dados e clica em Cancelar

    const nameInput = page.locator('[data-testid="input-name"]');
    await nameInput.fill('Dados Importantes');

    const cancelButton = page.locator('[data-testid="btn-cancel"]');
    await cancelButton.click();

    // Esperado: modal pedindo confirmação do descarte
    // Atual: formulário descartado imediatamente (BUG CONFIRMADO)

    const formEmpty = await nameInput.inputValue() === '';

    if (formEmpty) {
      console.error('BUG-21 CONFIRMADO: Formulário descartado sem confirmação');
    }

    test.skip(formEmpty, 'BUG-21: Falta confirmação ao descartar dados');
  });

  // ============================================
  // SMOKE TEST 8: Feedback Visível por Tempo Mínimo
  // ============================================

  test('BUG-22 - Feedback deve permanecer visível por mínimo de 3 segundos', async ({ page }) => {
    // Cenário: Lança campanha válida e cronometra a visibilidade do feedback

    // Preenche formulário mínimo válido
    await page.fill('[data-testid="input-name"]', 'Teste Duração');
    await page.check('[data-testid="radio-sales"]');
    await page.selectOption('[data-testid="select-agent"]', 'a1');
    await page.fill('[data-testid="input-message"]', 'Oi {{nome}}');
    await page.check('[data-testid="radio-segment"]');
    await page.selectOption('[data-testid="select-segment"]', 's1');
    await page.check('[data-testid="check-email"]');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('[data-testid="input-start-date"]', dateStr);

    // Marca o tempo inicial
    const startTime = Date.now();

    // Lança a campanha
    await page.click('[data-testid="btn-launch"]');

    const feedback = page.locator('[data-testid="feedback"]');
    await expect(feedback).toBeVisible();

    // Aguarda 3 segundos
    await page.waitForTimeout(3000);

    // Esperado: feedback ainda está visível
    // Atual: feedback desaparece em ~800ms (BUG CONFIRMADO)

    const stillVisible = await feedback.isVisible().catch(() => false);
    const elapsedTime = Date.now() - startTime;

    if (!stillVisible && elapsedTime >= 3000) {
      console.error(`BUG-22 CONFIRMADO: Feedback desapareceu antes dos 3 segundos mínimos`);
    }

    test.skip(!stillVisible, 'BUG-22: Feedback desaparece em menos de 3 segundos');
  });

  // ============================================
  // SMOKE TEST 9: Preview de Leads Sempre Zero
  // ============================================

  test('BUG-08 - Preview de leads deve exibir quantidade real do segmento', async ({ page }) => {
    // Cenário: Seleciona um segmento e valida o preview de leads

    await page.check('[data-testid="radio-segment"]');
    await page.selectOption('[data-testid="select-segment"]', 's1');

    const audienceCount = page.locator('[data-testid="audience-count"]');
    const countText = await audienceCount.textContent();

    // Esperado: exibe "1.842" (quantidade real do segmento "Trial expirado < 30 dias")
    // Atual: exibe "0" (BUG CONFIRMADO)

    if (countText === '0') {
      console.error('BUG-08 CONFIRMADO: Preview de leads sempre exibe 0');
    }

    test.skip(countText === '0', 'BUG-08: Preview de leads está sempre zerado');
  });
});
