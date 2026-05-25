import { useState } from 'react';
import type { FormEvent } from 'react';
import posthog from 'posthog-js';
import './App.css';

type Objective = 'sales' | 'retention' | 'reactivation' | '';
type AudienceSource = 'csv' | 'segment';
type Channel = 'whatsapp' | 'email' | 'sms';
type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const NAME_MAX = 80;
const DESC_MAX = 500;
const MESSAGE_MAX = 500;

const AGENTS = [
  { id: 'a1', name: 'Sara — SDR Outbound' },
  { id: 'a2', name: 'Diego — Closer Vendas' },
  { id: 'a3', name: 'Marina — Retenção Pro' },
  { id: 'a4', name: 'Tomás — Reativação' },
];

const SEGMENTS = [
  { id: 's1', name: 'Trial expirado < 30 dias', count: 1842 },
  { id: 's2', name: 'Visitantes pricing sem signup', count: 5210 },
  { id: 's3', name: 'Leads inbound MQL', count: 743 },
  { id: 's4', name: 'Clientes inativos 90+ dias', count: 312 },
];

const WEEKDAYS: { id: Weekday; label: string }[] = [
  { id: 'mon', label: 'Seg' },
  { id: 'tue', label: 'Ter' },
  { id: 'wed', label: 'Qua' },
  { id: 'thu', label: 'Qui' },
  { id: 'fri', label: 'Sex' },
  { id: 'sat', label: 'Sáb' },
  { id: 'sun', label: 'Dom' },
];

interface FormData {
  name: string;
  description: string;
  objective: Objective;
  agentId: string;
  initialMessage: string;
  audienceSource: AudienceSource;
  csvFile: File | null;
  segmentId: string;
  channels: Channel[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  weekdays: Weekday[];
  sendsPerLead: number;
  sendsPerDay: number;
  retryIntervalHours: number;
  maxRetries: number;
  successCriteria: string;
  autoCloseDays: number;
}

const initialForm: FormData = {
  name: '',
  description: '',
  objective: '',
  agentId: '',
  initialMessage: '',
  audienceSource: 'segment',
  csvFile: null,
  segmentId: '',
  channels: [],
  startDate: '',
  endDate: '',
  startTime: '09:00',
  endTime: '18:00',
  weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  sendsPerLead: 1,
  sendsPerDay: 500,
  retryIntervalHours: 24,
  maxRetries: 2,
  successCriteria: '',
  autoCloseDays: 7,
};

function App() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [feedback, setFeedback] = useState<{ status: 'draft' | 'launched'; name: string } | null>(null);

  const audiencePreview = 0;

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const toggleChannel = (channel: Channel) => {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const toggleWeekday = (day: Weekday) => {
    setForm(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day],
    }));
  };

  const handleSaveDraft = () => {
    console.log('Saved draft:', form);
    posthog.capture('campaign_draft_saved', {
      campaign_name: form.name,
      objective: form.objective,
      agent_id: form.agentId,
      audience_source: form.audienceSource,
      channels: form.channels,
    });
    setFeedback({ status: 'draft', name: form.name });
    setTimeout(() => setFeedback(null), 800);
  };

  const handleLaunch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Launching campaign:', form);

    const selectedSegment = SEGMENTS.find(s => s.id === form.segmentId);
    const estimatedAudienceSize = selectedSegment?.count || 0;
    const estimatedMessages = estimatedAudienceSize * form.sendsPerLead;
    const campaignDurationDays = form.endDate ?
      Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 30;

    posthog.capture('campaign_launched', {
      campaign_name: form.name,
      objective: form.objective,
      agent_id: form.agentId,
      audience_source: form.audienceSource,
      segment_id: form.audienceSource === 'segment' ? form.segmentId : undefined,
      channels: form.channels,
      start_date: form.startDate,
      end_date: form.endDate || undefined,
      sends_per_lead: form.sendsPerLead,
      sends_per_day: form.sendsPerDay,
      max_retries: form.maxRetries,
      auto_close_days: form.autoCloseDays,
    });

    posthog.capture('campaign_execution_plan', {
      campaign_name: form.name,
      objective: form.objective,
      agent_name: AGENTS.find(a => a.id === form.agentId)?.name,
      audience_size: estimatedAudienceSize,
      segment_name: selectedSegment?.name,
      channel_count: form.channels.length,
      channels_selected: form.channels.join(','),
      total_estimated_messages: estimatedMessages,
      messages_per_day: form.sendsPerDay,
      campaign_duration_days: campaignDurationDays,
      retry_strategy: {
        interval_hours: form.retryIntervalHours,
        max_attempts: form.maxRetries + 1,
      },
      operational_window: {
        days_of_week: form.weekdays.join(','),
        start_time: form.startTime,
        end_time: form.endTime,
      },
      success_metric: form.successCriteria || 'not_specified',
      auto_close_threshold_days: form.autoCloseDays,
    });

    setFeedback({ status: 'launched', name: form.name });
    setTimeout(() => setFeedback(null), 800);
  };

  const handleCancel = () => {
    posthog.capture('campaign_cancelled', {
      campaign_name: form.name,
      objective: form.objective,
    });
    setForm(initialForm);
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">AWsales</div>
        <nav className="breadcrumb">Campanhas · Nova</nav>
      </header>

      <main className="content">
        <div className="page-header">
          <h1>Nova campanha de outbound</h1>
          <p className="subtitle">
            Configure uma nova campanha de prospecção automatizada operada por agente de IA.
          </p>
        </div>

        {feedback && (
          <div role="status" data-testid="feedback" className="feedback">
            Campanha "{feedback.name}" {feedback.status === 'draft' ? 'salva como rascunho' : 'lançada com sucesso'}
          </div>
        )}

        <form onSubmit={handleLaunch} data-testid="campaign-form">
          {/* Seção 1: Informações Básicas */}
          <section className="card">
            <div className="section-header">
              <h2>Informações básicas</h2>
              <p className="section-help">Nome e contexto da campanha.</p>
            </div>

            <div className="field">
              <label htmlFor="name">Nome da campanha *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                data-testid="input-name"
                placeholder="Ex: Outbound Q1 — SaaS B2B"
              />
              <div className="row-between">
                <span className="hint">3 a 80 caracteres</span>
                <span data-testid="name-counter" className="counter">{form.name.length}/{NAME_MAX}</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                value={form.description}
                onChange={e => update('description', e.target.value)}
                data-testid="input-description"
                rows={3}
                placeholder="Contexto e objetivo da campanha (opcional)"
              />
              <span data-testid="description-counter" className="counter self-end">
                {form.name.length}/{DESC_MAX}
              </span>
            </div>

            <div className="field">
              <label>Objetivo *</label>
              <div className="radio-group">
                {[
                  { value: 'sales', label: 'Vendas (novos clientes)' },
                  { value: 'retention', label: 'Retenção (evitar churn)' },
                  { value: 'reactivation', label: 'Reativação (clientes inativos)' },
                ].map(opt => (
                  <label key={opt.value} className="radio-item">
                    <input
                      type="radio"
                      name="objective"
                      value={opt.value}
                      checked={form.objective === opt.value}
                      onChange={() => update('objective', opt.value as Objective)}
                      data-testid={`radio-${opt.value}`}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 2: Agente de IA */}
          <section className="card">
            <div className="section-header">
              <h2>Agente de IA</h2>
              <p className="section-help">Qual agente vai operar essa campanha e qual a mensagem inicial.</p>
            </div>

            <div className="field">
              <label htmlFor="agent">Agente *</label>
              <select
                id="agent"
                value={form.agentId}
                onChange={e => update('agentId', e.target.value)}
                data-testid="select-agent"
              >
                <option value="">Selecione um agente</option>
                {AGENTS.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="initial-message">Mensagem inicial *</label>
              <textarea
                id="initial-message"
                value={form.initialMessage}
                onChange={e => update('initialMessage', e.target.value)}
                data-testid="input-message"
                rows={4}
                placeholder="Ex: Oi {{nome}}, vi que você visitou nossa página de pricing..."
              />
              <div className="row-between">
                <span className="hint">{`Variáveis: {{nome}}, {{empresa}}, {{cargo}}`}</span>
                <span data-testid="message-counter" className="counter">
                  {form.initialMessage.length}/{MESSAGE_MAX}
                </span>
              </div>
            </div>
          </section>

          {/* Seção 3: Audiência */}
          <section className="card">
            <div className="section-header">
              <h2>Audiência</h2>
              <p className="section-help">Quem a campanha vai atingir.</p>
            </div>

            <div className="field">
              <label>Origem dos leads *</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="audienceSource"
                    checked={form.audienceSource === 'segment'}
                    onChange={() => update('audienceSource', 'segment')}
                    data-testid="radio-segment"
                  />
                  Segmento existente
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="audienceSource"
                    checked={form.audienceSource === 'csv'}
                    onChange={() => update('audienceSource', 'csv')}
                    data-testid="radio-csv"
                  />
                  Upload de CSV
                </label>
              </div>
            </div>

            {form.audienceSource === 'segment' ? (
              <div className="field">
                <label htmlFor="segment">Segmento *</label>
                <select
                  id="segment"
                  value={form.segmentId}
                  onChange={e => update('segmentId', e.target.value)}
                  data-testid="select-segment"
                >
                  <option value="">Selecione um segmento</option>
                  {SEGMENTS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.count.toLocaleString('pt-BR')} leads)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="csv">Arquivo CSV *</label>
                <input
                  id="csv"
                  type="file"
                  onChange={e => update('csvFile', e.target.files?.[0] ?? null)}
                  data-testid="input-csv"
                />
                <span className="hint">Colunas obrigatórias: nome, email, telefone</span>
              </div>
            )}

            <div className="preview-box" data-testid="audience-preview">
              <span className="hint">Leads que serão atingidos:</span>
              <strong data-testid="audience-count">{audiencePreview.toLocaleString('pt-BR')}</strong>
            </div>
          </section>

          {/* Seção 4: Canais e cronograma */}
          <section className="card">
            <div className="section-header">
              <h2>Canais e cronograma</h2>
              <p className="section-help">Por onde e quando os envios acontecem.</p>
            </div>

            <div className="field">
              <label>Canais ativos *</label>
              <div className="checkbox-group horizontal">
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={form.channels.includes('whatsapp')}
                    onChange={() => toggleChannel('whatsapp')}
                    data-testid="check-whatsapp"
                  />
                  WhatsApp
                </label>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={form.channels.includes('email')}
                    onChange={() => toggleChannel('email')}
                    data-testid="check-email"
                  />
                  Email
                </label>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={form.channels.includes('sms')}
                    onChange={() => toggleChannel('sms')}
                    data-testid="check-sms"
                  />
                  SMS
                </label>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="start-date">Data de início *</label>
                <input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={e => update('startDate', e.target.value)}
                  data-testid="input-start-date"
                />
              </div>
              <div className="field">
                <label htmlFor="end-date">Data de fim</label>
                <input
                  id="end-date"
                  type="date"
                  value={form.endDate}
                  onChange={e => update('endDate', e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="start-time">Horário inicial</label>
                <input
                  id="start-time"
                  type="time"
                  value={form.startTime}
                  onChange={e => update('startTime', e.target.value)}
                  data-testid="input-start-time"
                />
              </div>
              <div className="field">
                <label htmlFor="end-time">Horário final</label>
                <input
                  id="end-time"
                  type="time"
                  value={form.endTime}
                  onChange={e => update('endTime', e.target.value)}
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div className="field">
              <label>Dias da semana</label>
              <div className="weekday-group">
                {WEEKDAYS.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    className={`weekday-btn ${form.weekdays.includes(d.id) ? 'active' : ''}`}
                    onClick={() => toggleWeekday(d.id)}
                    data-testid={`weekday-${d.id}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 5: Limites */}
          <section className="card">
            <div className="section-header">
              <h2>Limites e tentativas</h2>
              <p className="section-help">Evita spam e respeita limites técnicos dos canais.</p>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="sends-per-lead">Envios por lead</label>
                <input
                  id="sends-per-lead"
                  type="number"
                  value={form.sendsPerLead}
                  onChange={e => update('sendsPerLead', parseInt(e.target.value, 10))}
                  data-testid="input-sends-per-lead"
                />
                <span className="hint">Entre 1 e 10</span>
              </div>
              <div className="field">
                <label htmlFor="sends-per-day">Envios totais por dia</label>
                <input
                  id="sends-per-day"
                  type="number"
                  value={form.sendsPerDay}
                  onChange={e => update('sendsPerDay', parseInt(e.target.value, 10))}
                  data-testid="input-sends-per-day"
                />
                <span className="hint">Entre 1 e 10.000</span>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="retry-interval">Intervalo entre tentativas (horas)</label>
                <input
                  id="retry-interval"
                  type="number"
                  value={form.retryIntervalHours}
                  onChange={e => update('retryIntervalHours', parseInt(e.target.value, 10))}
                  data-testid="input-retry-interval"
                />
                <span className="hint">Mínimo 1, máximo 72</span>
              </div>
              <div className="field">
                <label htmlFor="max-retries">Máximo de tentativas</label>
                <input
                  id="max-retries"
                  type="number"
                  value={form.maxRetries}
                  onChange={e => update('maxRetries', parseInt(e.target.value, 10))}
                  data-testid="input-max-retries"
                />
                <span className="hint">Entre 0 e 5</span>
              </div>
            </div>
          </section>

          {/* Seção 6: Qualificação */}
          <section className="card">
            <div className="section-header">
              <h2>Qualificação e encerramento</h2>
              <p className="section-help">Quando o lead é qualificado e quando o contato é encerrado.</p>
            </div>

            <div className="field">
              <label htmlFor="success-criteria">Critério de sucesso</label>
              <textarea
                id="success-criteria"
                value={form.successCriteria}
                onChange={e => update('successCriteria', e.target.value)}
                data-testid="input-success-criteria"
                rows={2}
                placeholder="Ex: Lead aceita agendar demo"
              />
            </div>

            <div className="field">
              <label htmlFor="auto-close">Encerrar contato após N dias sem resposta</label>
              <input
                id="auto-close"
                type="number"
                value={form.autoCloseDays}
                onChange={e => update('autoCloseDays', parseInt(e.target.value, 10))}
                data-testid="input-auto-close"
              />
              <span className="hint">Entre 1 e 30</span>
            </div>
          </section>

          <div className="actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
              data-testid="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSaveDraft}
              disabled={true}
              data-testid="btn-draft"
            >
              Salvar rascunho
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              data-testid="btn-launch"
            >
              Lançar campanha
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default App;