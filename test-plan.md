# Feature — Criação de Agente de IA

Stack: React + TypeScript + Vite.

## Contexto (saída fictícia do discovery)

Tela de cadastro de um novo agente de IA. O usuário define nome, tipo (Vendas/Retenção/Suporte), tom de voz, mensagem de boas-vindas, canais que o agente vai operar (WhatsApp/Email/Web Chat), limite diário de interações e se ele fica ativo ao ser criado.

## Critérios de aceitação

1. Campo **Nome** obrigatório, mínimo 3 caracteres, máximo 50.
2. Dropdown **Tipo** obrigatório, opções: Vendas, Retenção, Suporte.
3. Dropdown **Tom de voz** obrigatório, opções: Formal, Casual, Técnico.
4. **Mensagem de boas-vindas** obrigatória, máximo 280 caracteres. Exibir contador correto.
5. **Canais**: pelo menos um obrigatório (WhatsApp, Email, Web Chat).
6. **Limite diário** entre 1 e 1000, padrão 100.
7. Toggle **Ativar após criação**, padrão desligado.
8. Botão **Salvar** só habilitado quando todos os campos obrigatórios estão preenchidos corretamente.
9. Botão **Cancelar** limpa o formulário e volta ao estado inicial.
10. Ao salvar com sucesso, mostrar mensagem por pelo menos 3 segundos.
11. Labels conectados aos inputs (acessibilidade).

## Wireframe textual

```
+-----------------------------------------+
| Criar Agente de IA                      |
+-----------------------------------------+
| Nome do agente                          |
| [_____________________] 0/50            |
|                                         |
| Tipo            Tom de voz              |
| [Selecione  v]  [Selecione  v]          |
|                                         |
| Mensagem de boas-vindas                 |
| [                              ] 0/280  |
| [                              ]        |
|                                         |
| Canais                                  |
| [ ] WhatsApp  [ ] Email  [ ] Web Chat   |
|                                         |
| Limite diário de interações             |
| [ 100 ]                                 |
|                                         |
| [ ] Ativar após criação                 |
|                                         |
|              [ Cancelar ] [ Salvar ]    |
+-----------------------------------------+
```

## Setup do projeto

```bash
npm create vite@latest qa-pilot-agent -- --template react-ts
cd qa-pilot-agent
npm install
git init
git add .
git commit -m "chore: bootstrap"
gh repo create qa-pilot-agent --public --source=. --remote=origin --push
```


A tela tem bugs plantados. Quantos e quais é problema seu descobrir. Se no final quiser conferir o gabarito, me pede.
