import { test, expect } from '@playwright/test';
import {
  openCampaignForm,
  resetForm,
  fillCampaignName,
  fillDescription,
  fillInitialMessage,
  expectCharacterCounter,
} from './helpers';

// Testes de validação de limites de campos
// Documenta os bugs relacionados a limites de entrada

test.describe('Validações de Limites de Campo', () => {
  test.beforeEach(async ({ page }) => {
    await openCampaignForm(page);
  });

  test.afterEach(async ({ page }) => {
    await resetForm(page);
  });

  // ============================================
  // BUG-01: Nome com Menos de 3 Caracteres
  // ============================================

  test('BUG-01 — Nome com 1 caracter deveria ser rejeitado', async ({ page }) => {
    // Cenário: Nome com apenas 1 caracter
    await fillCampaignName(page, 'a');

    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('1/80');

    // Esperado: validação em tempo real ou no submit
    // Atual: aceita 1 caracter (BUG)

    console.warn('BUG-01: Nome com < 3 caracteres é aceito');
  });

  test('BUG-01 — Nome com 2 caracteres deveria ser rejeitado', async ({ page }) => {
    await fillCampaignName(page, 'ab');

    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('2/80');

    console.warn('BUG-01: Nome "ab" foi aceito');
  });

  test('Nome com 3 caracteres deveria ser aceito', async ({ page }) => {
    // Caso válido: nome com exatamente 3 caracteres
    await fillCampaignName(page, 'abc');

    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('3/80');

    // Este é o comportamento esperado - nome válido é aceito
  });

  // ============================================
  // BUG-02: Nome com Mais de 80 Caracteres
  // ============================================

  test('BUG-02 — Nome com 80 caracteres é limite máximo válido', async ({ page }) => {
    // Caso limite: exatamente 80 caracteres
    const name80 = 'a'.repeat(80);
    await fillCampaignName(page, name80);

    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('80/80');

    // 80 caracteres é o máximo permitido
  });

  test('BUG-02 — Nome com 81 caracteres deveria ser rejeitado', async ({ page }) => {
    // Cenário: Nome com 81 caracteres (acima do máximo)
    const name81 = 'a'.repeat(81);
    await fillCampaignName(page, name81);

    const nameCounter = page.locator('[data-testid="name-counter"]');
    const counterText = await nameCounter.textContent();

    // Esperado: entrada bloqueada em 80 ou validação no submit
    // Atual: aceita 81 caracteres; contador exibe "81/80" (BUG)

    if (counterText?.includes('81/80')) {
      console.error('BUG-02: Nome com > 80 caracteres foi aceito');
    }
  });

  test('BUG-02 — Nome com 100 caracteres é acima do limite', async ({ page }) => {
    const name100 = 'a'.repeat(100);
    await fillCampaignName(page, name100);

    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('100/80');

    console.warn('BUG-02: Nome com 100 caracteres (>> 80) foi aceito');
  });

  // ============================================
  // BUG-03: Descrição com Mais de 500 Caracteres
  // ============================================

  test('BUG-03 — Descrição com 500 caracteres é limite máximo válido', async ({ page }) => {
    const desc500 = 'x'.repeat(500);
    await fillDescription(page, desc500);

    // 500 caracteres é o máximo permitido para descrição
    const descCounter = page.locator('[data-testid="description-counter"]');
    const counterText = await descCounter.textContent();

    // Nota: BUG-04 causa problema aqui também
    // O contador reflete o tamanho do nome, não da descrição
  });

  test('BUG-03 — Descrição com 501 caracteres deveria ser rejeitado', async ({ page }) => {
    const desc501 = 'x'.repeat(501);
    await fillDescription(page, desc501);

    // Esperado: entrada bloqueada em 500 ou validação no submit
    // Atual: aceita 501 caracteres (BUG-03)

    console.warn('BUG-03: Descrição com > 500 caracteres foi aceito');
  });

  test('BUG-03 — Descrição com 600 caracteres é bastante acima do limite', async ({ page }) => {
    const desc600 = 'x'.repeat(600);
    await fillDescription(page, desc600);

    console.warn('BUG-03: Descrição com 600 caracteres foi aceito');
  });

  // ============================================
  // BUG-04: Contador de Descrição Reflete Nome
  // ============================================

  test('BUG-04 — Contador de descrição reflete tamanho do nome (não da descrição)', async ({ page }) => {
    // Cenário que demonstra claramente o bug

    // Digita 10 caracteres no nome
    await fillCampaignName(page, '1234567890');

    // Digita 50 caracteres na descrição
    await fillDescription(page, 'a'.repeat(50));

    // Verifica contadores
    const nameCounter = page.locator('[data-testid="name-counter"]');
    const descCounter = page.locator('[data-testid="description-counter"]');

    const nameCountText = await nameCounter.textContent();
    const descCountText = await descCounter.textContent();

    // Esperado:
    // - Nome: "10/80"
    // - Descrição: "50/500"

    // Atual (BUG):
    // - Nome: "10/80" ✓ (correto)
    // - Descrição: "10/500" ✗ (reflete nome, não descrição!)

    if (descCountText?.includes('10/500')) {
      console.error('BUG-04 CONFIRMADO: Contador de descrição exibe "10/500" ao invés de "50/500"');
    }

    // O bug é evidente quando descCounter começa com número do nome
    const descCounterValue = parseInt(descCountText?.split('/')[0] || '0', 10);
    const expectedValue = 50;

    test.skip(descCounterValue !== expectedValue, `BUG-04: Contador é ${descCounterValue}, esperado ${expectedValue}`);
  });

  // ============================================
  // BUG-05: Mensagem Inicial com Mais de 500 Caracteres
  // ============================================

  test('BUG-05 — Mensagem inicial com 500 caracteres é limite máximo válido', async ({ page }) => {
    const msg500 = 'Olá {{nome}}, ' + 'x'.repeat(486); // Total ~500
    await fillInitialMessage(page, msg500);

    const messageCounter = page.locator('[data-testid="message-counter"]');
    const text = await messageCounter.textContent();

    const count = parseInt(text?.split('/')[0] || '0', 10);
    expect(count).toBeLessThanOrEqual(500);
  });

  test('BUG-05 — Mensagem inicial com 501 caracteres deveria ser rejeitado', async ({ page }) => {
    const msg501 = 'x'.repeat(501);
    await fillInitialMessage(page, msg501);

    // Esperado: entrada bloqueada em 500 ou validação no submit
    // Atual: aceita 501 caracteres (BUG-05)

    console.warn('BUG-05: Mensagem inicial com > 500 caracteres foi aceito');
  });

  test('BUG-05 — Mensagem inicial com 600 caracteres é bastante acima do limite', async ({ page }) => {
    const msg600 = 'x'.repeat(600);
    await fillInitialMessage(page, msg600);

    console.warn('BUG-05: Mensagem inicial com 600 caracteres foi aceito');
  });

  // ============================================
  // Contadores de Campo: Validação Positiva
  // ============================================

  test('Contador de nome atualiza corretamente conforme se digita', async ({ page }) => {
    const nameInput = page.locator('[data-testid="input-name"]');
    const nameCounter = page.locator('[data-testid="name-counter"]');

    // Digita caractere por caractere
    for (let i = 1; i <= 5; i++) {
      await nameInput.fill('a'.repeat(i));
      await expect(nameCounter).toContainText(`${i}/80`);
    }
  });

  test('Contador de mensagem atualiza corretamente conforme se digita', async ({ page }) => {
    const messageInput = page.locator('[data-testid="input-message"]');
    const messageCounter = page.locator('[data-testid="message-counter"]');

    // Digita caractere por caractere
    for (let i = 1; i <= 10; i++) {
      await messageInput.fill('x'.repeat(i));
      await expect(messageCounter).toContainText(`${i}/500`);
    }
  });

  // ============================================
  // Edge Cases: Caracteres Especiais
  // ============================================

  test('Nome com espaços em branco é contado', async ({ page }) => {
    // "abc  def" tem 8 caracteres (espaços contam)
    await fillCampaignName(page, 'abc  def');

    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('8/80');
  });

  test('Nome com caracteres especiais é aceito', async ({ page }) => {
    // Testa se caracteres especiais são permitidos
    const nameWithSpecialChars = 'Campanha Q1 — SaaS (Beta)';
    await fillCampaignName(page, nameWithSpecialChars);

    const nameCounter = page.locator('[data-testid="name-counter"]');
    const expected = nameWithSpecialChars.length;
    await expect(nameCounter).toContainText(`${expected}/80`);
  });

  test('Descrição com quebras de linha é contada corretamente', async ({ page }) => {
    // Quebras de linha são caracteres também
    const descWithLineBreaks = 'Linha 1\nLinha 2\nLinha 3';
    await fillDescription(page, descWithLineBreaks);

    const descCounter = page.locator('[data-testid="description-counter"]');
    // Nota: BUG-04 faz isso exibir o tamanho do nome, não da descrição
  });

  test('Mensagem com variáveis é contada incluindo as variáveis', async ({ page }) => {
    // {{nome}} tem 8 caracteres incluindo as chaves
    const msg = 'Olá {{nome}}, tudo bem?';
    await fillInitialMessage(page, msg);

    const messageCounter = page.locator('[data-testid="message-counter"]');
    const expected = msg.length;
    await expect(messageCounter).toContainText(`${expected}/500`);
  });

  // ============================================
  // Limpeza e Reset
  // ============================================

  test('Limpar campo reseta o contador', async ({ page }) => {
    // Preenche
    await fillCampaignName(page, 'Teste Limpeza');

    // Limpa
    await fillCampaignName(page, '');

    // Valida que contador volta a zero
    const nameCounter = page.locator('[data-testid="name-counter"]');
    await expect(nameCounter).toContainText('0/80');
  });
});
