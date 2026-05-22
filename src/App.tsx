import { useState, type SubmitEvent } from 'react';
import './App.css';

type AgentType = 'sales' | 'retention' | 'support' | '';
type Tone = 'formal' | 'casual' | 'technical' | '';
type Channel = 'whatsapp' | 'email' | 'webchat';

interface AgentFormData {
  name: string;
  type: AgentType;
  tone: Tone;
  welcomeMessage: string;
  channels: Channel[];
  dailyLimit: number;
  activateOnCreate: boolean;
}

const NAME_MAX = 50;
const MESSAGE_MAX = 280;

const initialForm: AgentFormData = {
  name: '',
  type: '',
  tone: '',
  welcomeMessage: '',
  channels: [],
  dailyLimit: 100,
  activateOnCreate: false,
};

function App() {
  const [form, setForm] = useState<AgentFormData>(initialForm);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Saving agent:', form);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 500);
  };

  const handleCancel = () => {
    console.log('Cancelled');
  };

  const toggleChannel = (channel: Channel) => {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} data-testid="agent-form">
        <h1>Criar Agente de IA</h1>

        {showSuccess && (
          <div role="status" data-testid="success-message" className="success">
            Agente criado com sucesso
          </div>
        )}

        <div className="field">
          <label>Nome do agente</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            data-testid="input-name"
          />
          <span data-testid="name-counter" className="counter">
            {form.name.length}/{NAME_MAX}
          </span>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as AgentType })}
              data-testid="select-type"
            >
              <option value="">Selecione</option>
              <option value="sales">Vendas</option>
              <option value="retention">Retenção</option>
              <option value="support">Suporte</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="tone">Tom de voz</label>
            <select
              id="tone"
              value={form.tone}
              onChange={e => setForm({ ...form, tone: e.target.value as Tone })}
              data-testid="select-tone"
            >
              <option value="">Selecione</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="technical">Técnico</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="welcome">Mensagem de boas-vindas</label>
          <textarea
            id="welcome"
            value={form.welcomeMessage}
            onChange={e => setForm({ ...form, welcomeMessage: e.target.value })}
            data-testid="input-welcome"
            rows={3}
          />
          <span data-testid="welcome-counter" className="counter">
            {form.welcomeMessage.length}/{MESSAGE_MAX}
          </span>
        </div>

        <fieldset className="field">
          <legend>Canais</legend>
          <label className="inline">
            <input
              type="checkbox"
              checked={form.channels.includes('whatsapp')}
              onChange={() => toggleChannel('whatsapp')}
              data-testid="check-whatsapp"
            />
            WhatsApp
          </label>
          <label className="inline">
            <input
              type="checkbox"
              checked={form.channels.includes('email')}
              onChange={() => toggleChannel('email')}
              data-testid="check-email"
            />
            Email
          </label>
          <label className="inline">
            <input
              type="checkbox"
              checked={form.channels.includes('webchat')}
              onChange={() => toggleChannel('webchat')}
              data-testid="check-webchat"
            />
            Web Chat
          </label>
        </fieldset>

        <div className="field">
          <label htmlFor="limit">Limite diário de interações</label>
          <input
            id="limit"
            type="number"
            value={form.dailyLimit}
            onChange={e => setForm({ ...form, dailyLimit: parseInt(e.target.value) })}
            data-testid="input-limit"
          />
        </div>

        <div className="field">
          <label className="inline">
            <input
              type="checkbox"
              checked={form.activateOnCreate}
              onChange={e => setForm({ ...form, activateOnCreate: e.target.checked })}
              data-testid="check-activate"
            />
            Ativar após criação
          </label>
        </div>

        <div className="actions">
          <button type="button" onClick={handleCancel} data-testid="btn-cancel">
            Cancelar
          </button>
          <button type="submit" data-testid="btn-save">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;