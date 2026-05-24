import { test, expect } from '@playwright/test';
import {
  openCampaignForm,
  resetForm,
  fillBasicInfo,
  selectAgent,
  fillInitialMessage,
  selectSegmentAudience,
  uploadCSVAudience,
  selectChannels,
  setStartDateTomorrow,
  launchCampaign,
  waitForFeedback,
  fillCompleteValidForm,
} from './helpers';

// Testes do happy path - fluxos principais que devem funcionar corretamente

test.describe('Happy Path - Fluxos Principais', () => {
  test.beforeEach(async ({ page }) => {
    await openCampaignForm(page);
  });

  test.afterEach(async ({ page }) => {
    await resetForm(page);
  });

  // ============================================
  // TC-01: Happy Path com Segmento
  // ============================================

  test('TC-01 Happy path com segmento — preencher válido, escolher segmento, lançar, ver feedback', async ({ page }) => {
    const campaignName = 'Campanha Q1 Segmento';

    // Seção 1: Informações básicas
    await fillBasicInfo(page, {
      name: campaignName,
      description: 'Prospecção de trial expirado',
      objective: 'sales',
    });

    // Seção 2: Agente de IA
    await selectAgent(page, 'a1'); // Sara — SDR Outbound
    await fillInitialMessage(page, 'Olá {{nome}}, gostaria de conversar sobre {{empresa}}');

    // Seção 3: Audiência
    await selectSegmentAudience(page, 's1'); // Trial expirado < 30 dias

    // Seção 4: Canais e cronograma
    await selectChannels(page, ['email']);
    await setStartDateTomorrow(page);

    // Executa a ação
    await launchCampaign(page);

    // Validações
    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain(campaignName);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  // ============================================
  // TC-02: Happy Path com CSV
  // ============================================

  test('TC-02 Happy path com CSV — mesmo fluxo, upload de arquivo válido', async ({ page }) => {
    const campaignName = 'Campanha Q1 CSV';

    // Seção 1: Informações básicas
    await fillBasicInfo(page, {
      name: campaignName,
      objective: 'retention',
    });

    // Seção 2: Agente de IA
    await selectAgent(page, 'a3'); // Marina — Retenção Pro
    await fillInitialMessage(page, 'Oi {{nome}}, sentimos sua falta! Vamos conversar?');

    // Seção 3: Audiência - Upload CSV
    const csvContent = [
      'nome,email,telefone',
      'João Silva,joao@example.com,11999999999',
      'Maria Santos,maria@example.com,11999999998',
      'Pedro Costa,pedro@example.com,11999999997',
    ].join('\n');

    await uploadCSVAudience(page, 'leads.csv', csvContent);

    // Seção 4: Canais e cronograma
    await selectChannels(page, ['whatsapp', 'email']);
    await setStartDateTomorrow(page);

    // Executa a ação
    await launchCampaign(page);

    // Validações
    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain(campaignName);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  // ============================================
  // TC-03: Happy Path Completo com Todos os Dados
  // ============================================

  test('TC-03 Preencher formulário completo — todos os campos preenchidos, lançar com sucesso', async ({ page }) => {
    const campaignName = 'Campanha Premium Completa';

    // Usa o helper que preenche tudo com dados válidos
    await fillCompleteValidForm(page, {
      name: campaignName,
      description: 'Campanha com todos os campos preenchidos para teste de completude',
      objective: 'reactivation',
      agent: 'a4', // Tomás — Reativação
      initialMessage: 'Olá {{nome}} de {{empresa}}, como vai? Vi que você não tem acessado há um tempo...',
      channels: ['whatsapp', 'email', 'sms'],
    });

    // Lança a campanha
    await launchCampaign(page);

    // Valida sucesso
    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain(campaignName);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  // ============================================
  // TC-04: Diferentes Objetivos
  // ============================================

  test('TC-04 Lançar com objetivo "Vendas" — validação de fluxo específico', async ({ page }) => {
    await fillBasicInfo(page, {
      name: 'Campanha Vendas',
      objective: 'sales',
    });

    await selectAgent(page, 'a1');
    await fillInitialMessage(page, 'Oportunidade de negócio para {{empresa}}');
    await selectSegmentAudience(page, 's2');
    await selectChannels(page, ['email']);
    await setStartDateTomorrow(page);

    await launchCampaign(page);

    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  test('TC-05 Lançar com objetivo "Retenção" — validação de fluxo específico', async ({ page }) => {
    await fillBasicInfo(page, {
      name: 'Campanha Retenção',
      objective: 'retention',
    });

    await selectAgent(page, 'a3');
    await fillInitialMessage(page, 'Queremos mantê-lo conosco!');
    await selectSegmentAudience(page, 's4');
    await selectChannels(page, ['sms']);
    await setStartDateTomorrow(page);

    await launchCampaign(page);

    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  test('TC-06 Lançar com objetivo "Reativação" — validação de fluxo específico', async ({ page }) => {
    await fillBasicInfo(page, {
      name: 'Campanha Reativação',
      objective: 'reactivation',
    });

    await selectAgent(page, 'a4');
    await fillInitialMessage(page, 'Vamos reativar sua conta?');
    await selectSegmentAudience(page, 's3');
    await selectChannels(page, ['email', 'whatsapp']);
    await setStartDateTomorrow(page);

    await launchCampaign(page);

    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  // ============================================
  // TC-07: Diferentes Combinações de Canais
  // ============================================

  test('TC-07 Lançar apenas com WhatsApp', async ({ page }) => {
    await fillBasicInfo(page, {
      name: 'Campanha WhatsApp Only',
      objective: 'sales',
    });

    await selectAgent(page, 'a1');
    await fillInitialMessage(page, 'Mensagem via WhatsApp');
    await selectSegmentAudience(page, 's1');
    await selectChannels(page, ['whatsapp']);
    await setStartDateTomorrow(page);

    await launchCampaign(page);

    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  test('TC-08 Lançar apenas com Email', async ({ page }) => {
    await fillBasicInfo(page, {
      name: 'Campanha Email Only',
      objective: 'sales',
    });

    await selectAgent(page, 'a1');
    await fillInitialMessage(page, 'Mensagem via Email');
    await selectSegmentAudience(page, 's1');
    await selectChannels(page, ['email']);
    await setStartDateTomorrow(page);

    await launchCampaign(page);

    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  test('TC-09 Lançar apenas com SMS', async ({ page }) => {
    await fillBasicInfo(page, {
      name: 'Campanha SMS Only',
      objective: 'sales',
    });

    await selectAgent(page, 'a1');
    await fillInitialMessage(page, 'Mensagem via SMS');
    await selectSegmentAudience(page, 's1');
    await selectChannels(page, ['sms']);
    await setStartDateTomorrow(page);

    await launchCampaign(page);

    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain('lançada com sucesso');
  });

  test('TC-10 Lançar com todos os 3 canais combinados', async ({ page }) => {
    await fillBasicInfo(page, {
      name: 'Campanha Omnichannel',
      objective: 'sales',
    });

    await selectAgent(page, 'a1');
    await fillInitialMessage(page, 'Campanha multicanal');
    await selectSegmentAudience(page, 's1');
    await selectChannels(page, ['whatsapp', 'email', 'sms']);
    await setStartDateTomorrow(page);

    await launchCampaign(page);

    const feedbackText = await waitForFeedback(page);
    expect(feedbackText).toContain('lançada com sucesso');
  });
});
