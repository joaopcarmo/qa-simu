import { Page } from '@playwright/test';

// Tipos para melhor type-safety
export type Objective = 'sales' | 'retention' | 'reactivation';
export type Channel = 'whatsapp' | 'email' | 'sms';
export type AudienceSource = 'segment' | 'csv';

export interface CampaignFormData {
  name: string;
  description?: string;
  objective?: Objective;
  agent?: string;
  initialMessage: string;
  audienceSource?: AudienceSource;
  segment?: string;
  csvFile?: { fileName: string; content: string };
  channels?: Channel[];
  startDate: string;
  endDate?: string;
}

// ============================================
// Helpers de Navegação e Estado
// ============================================

/**
 * Abre a página de nova campanha e aguarda carregamento completo
 */
export async function openCampaignForm(page: Page): Promise<void> {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
}

/**
 * Reseta o formulário ao estado inicial
 */
export async function resetForm(page: Page): Promise<void> {
  const cancelButton = page.locator('[data-testid="btn-cancel"]');
  // Se houver dados, cancela (aceita o reset imediato, sem modal, por enquanto)
  const nameInput = page.locator('[data-testid="input-name"]');
  const currentValue = await nameInput.inputValue();

  if (currentValue) {
    await cancelButton.click();
  }
}

/**
 * Aguarda o feedback de sucesso/rascunho aparecer
 */
export async function waitForFeedback(
  page: Page,
  options: { timeout?: number } = {}
): Promise<string> {
  const feedback = page.locator('[data-testid="feedback"]');
  await feedback.waitFor({ state: 'visible', timeout: options.timeout || 5000 });
  return await feedback.textContent() || '';
}

/**
 * Aguarda o feedback desaparecer (ou tempo máximo)
 */
export async function waitForFeedbackToDisappear(
  page: Page,
  options: { timeout?: number } = {}
): Promise<void> {
  const feedback = page.locator('[data-testid="feedback"]');
  try {
    await feedback.waitFor({ state: 'hidden', timeout: options.timeout || 5000 });
  } catch {
    // Timeout - feedback ainda visível, não é erro
  }
}

// ============================================
// Helpers de Preenchimento - Seção Básica
// ============================================

/**
 * Preenche o campo "Nome da campanha"
 */
export async function fillCampaignName(page: Page, name: string): Promise<void> {
  await page.fill('[data-testid="input-name"]', name);
}

/**
 * Preenche o campo "Descrição"
 */
export async function fillDescription(page: Page, description: string): Promise<void> {
  await page.fill('[data-testid="input-description"]', description);
}

/**
 * Seleciona o objetivo da campanha
 */
export async function selectObjective(page: Page, objective: Objective): Promise<void> {
  await page.check(`[data-testid="radio-${objective}"]`);
}

/**
 * Preenche a seção básica completa
 */
export async function fillBasicInfo(
  page: Page,
  data: { name: string; description?: string; objective?: Objective }
): Promise<void> {
  await fillCampaignName(page, data.name);
  if (data.description) {
    await fillDescription(page, data.description);
  }
  if (data.objective) {
    await selectObjective(page, data.objective);
  }
}

// ============================================
// Helpers de Preenchimento - Agente de IA
// ============================================

/**
 * Seleciona um agente da lista
 */
export async function selectAgent(page: Page, agentId: string): Promise<void> {
  await page.selectOption('[data-testid="select-agent"]', agentId);
}

/**
 * Preenche a mensagem inicial
 */
export async function fillInitialMessage(page: Page, message: string): Promise<void> {
  await page.fill('[data-testid="input-message"]', message);
}

/**
 * Preenche a seção do agente completa
 */
export async function fillAgentSection(
  page: Page,
  data: { agent: string; message: string }
): Promise<void> {
  await selectAgent(page, data.agent);
  await fillInitialMessage(page, data.message);
}

// ============================================
// Helpers de Preenchimento - Audiência
// ============================================

/**
 * Seleciona audiência por segmento existente
 */
export async function selectSegmentAudience(page: Page, segmentId: string): Promise<void> {
  await page.check('[data-testid="radio-segment"]');
  await page.selectOption('[data-testid="select-segment"]', segmentId);
}

/**
 * Seleciona audiência por upload de CSV
 */
export async function uploadCSVAudience(
  page: Page,
  fileName: string,
  csvContent: string
): Promise<void> {
  await page.check('[data-testid="radio-csv"]');

  const fileInput = page.locator('[data-testid="input-csv"]');
  await fileInput.setInputFiles({
    name: fileName,
    mimeType: 'text/csv',
    buffer: Buffer.from(csvContent),
  });
}

/**
 * Preenche a seção de audiência
 */
export async function fillAudienceSection(
  page: Page,
  data: { type: AudienceSource; segmentId?: string; csvFile?: { fileName: string; content: string } }
): Promise<void> {
  if (data.type === 'segment' && data.segmentId) {
    await selectSegmentAudience(page, data.segmentId);
  } else if (data.type === 'csv' && data.csvFile) {
    await uploadCSVAudience(page, data.csvFile.fileName, data.csvFile.content);
  }
}

// ============================================
// Helpers de Preenchimento - Canais e Cronograma
// ============================================

/**
 * Seleciona um canal de comunicação
 */
export async function toggleChannel(page: Page, channel: Channel): Promise<void> {
  const testId = {
    whatsapp: 'check-whatsapp',
    email: 'check-email',
    sms: 'check-sms',
  };
  await page.check(`[data-testid="${testId[channel]}"]`);
}

/**
 * Seleciona múltiplos canais
 */
export async function selectChannels(page: Page, channels: Channel[]): Promise<void> {
  for (const channel of channels) {
    await toggleChannel(page, channel);
  }
}

/**
 * Define a data de início (formato YYYY-MM-DD)
 */
export async function setStartDate(page: Page, dateString: string): Promise<void> {
  await page.fill('[data-testid="input-start-date"]', dateString);
}

/**
 * Define a data de fim (formato YYYY-MM-DD)
 */
export async function setEndDate(page: Page, dateString: string): Promise<void> {
  await page.fill('[data-testid="input-end-date"]', dateString);
}

/**
 * Define a data de início para amanhã (padrão seguro)
 */
export async function setStartDateTomorrow(page: Page): Promise<string> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  await setStartDate(page, dateStr);
  return dateStr;
}

/**
 * Define o horário inicial
 */
export async function setStartTime(page: Page, time: string): Promise<void> {
  await page.fill('[data-testid="input-start-time"]', time);
}

/**
 * Define o horário final
 */
export async function setEndTime(page: Page, time: string): Promise<void> {
  await page.fill('[data-testid="input-end-time"]', time);
}

/**
 * Preenche canais e cronograma
 */
export async function fillChannelsAndSchedule(
  page: Page,
  data: {
    channels?: Channel[];
    startDate?: string;
    endDate?: string;
  }
): Promise<void> {
  if (data.channels) {
    await selectChannels(page, data.channels);
  }
  if (data.startDate) {
    await setStartDate(page, data.startDate);
  }
  if (data.endDate) {
    await setEndDate(page, data.endDate);
  }
}

// ============================================
// Helpers de Ações - Botões
// ============================================

/**
 * Clica em "Lançar campanha"
 */
export async function launchCampaign(page: Page): Promise<void> {
  await page.click('[data-testid="btn-launch"]');
}

/**
 * Clica em "Salvar rascunho"
 */
export async function saveDraft(page: Page): Promise<void> {
  await page.click('[data-testid="btn-draft"]');
}

/**
 * Clica em "Cancelar"
 */
export async function cancelForm(page: Page): Promise<void> {
  await page.click('[data-testid="btn-cancel"]');
}

// ============================================
// Helpers de Validação
// ============================================

/**
 * Valida se um campo tem um valor específico
 */
export async function expectFieldValue(page: Page, testId: string, expectedValue: string): Promise<void> {
  const field = page.locator(`[data-testid="${testId}"]`);
  await field.evaluate((el: HTMLInputElement) => {
    if (el.value !== expectedValue) {
      throw new Error(`Expected "${expectedValue}" but got "${el.value}"`);
    }
  });
}

/**
 * Valida o contador de caracteres de um campo
 */
export async function expectCharacterCounter(
  page: Page,
  testId: string,
  expectedCount: number
): Promise<void> {
  const counter = page.locator(`[data-testid="${testId}"]`);
  const text = await counter.textContent();
  const currentCount = parseInt(text?.split('/')[0] || '0', 10);

  if (currentCount !== expectedCount) {
    throw new Error(`Expected counter to be "${expectedCount}" but got "${currentCount}"`);
  }
}

/**
 * Valida se o feedback aparece e contém um texto específico
 */
export async function expectFeedbackContains(page: Page, expectedText: string): Promise<void> {
  const feedback = page.locator('[data-testid="feedback"]');
  const text = await feedback.textContent();

  if (!text?.includes(expectedText)) {
    throw new Error(`Expected feedback to contain "${expectedText}" but got "${text}"`);
  }
}

/**
 * Preenche um formulário completo com dados válidos para teste
 */
export async function fillCompleteValidForm(
  page: Page,
  overrides: Partial<CampaignFormData> = {}
): Promise<void> {
  const defaults: CampaignFormData = {
    name: 'Campanha Teste',
    description: 'Descrição de teste',
    objective: 'sales',
    agent: 'a1',
    initialMessage: 'Olá {{nome}}, teste de campanha',
    audienceSource: 'segment',
    segment: 's1',
    channels: ['email'],
    startDate: '', // Preenchido abaixo
  };

  const data = { ...defaults, ...overrides };

  // Seção básica
  await fillBasicInfo(page, {
    name: data.name,
    description: data.description,
    objective: data.objective,
  });

  // Agente
  if (data.agent) {
    await selectAgent(page, data.agent);
  }
  await fillInitialMessage(page, data.initialMessage);

  // Audiência
  if (data.audienceSource === 'segment' && data.segment) {
    await selectSegmentAudience(page, data.segment);
  } else if (data.audienceSource === 'csv' && data.csvFile) {
    await uploadCSVAudience(page, data.csvFile.fileName, data.csvFile.content);
  }

  // Canais e cronograma
  if (data.channels) {
    await selectChannels(page, data.channels);
  }

  const startDate = data.startDate || (await setStartDateTomorrow(page));
  if (data.startDate) {
    await setStartDate(page, data.startDate);
  }
}
