# Feature — Nova Campanha de Outbound

Stack: React + TypeScript + Vite.

## Contexto (saída fictícia do discovery)

Tela de criação de uma campanha de prospecção automatizada operada por agente de IA. O usuário define nome e contexto, escolhe o agente que vai operar, a mensagem inicial (com suporte a variáveis), define a audiência (segmento existente ou upload de CSV), os canais ativos (WhatsApp/Email/SMS), o cronograma (datas, horários, dias da semana), limites de envio e critérios de qualificação/encerramento.

A campanha pode ser **salva como rascunho** (validação leve) ou **lançada** (validação completa).

## Critérios de aceitação

**Informações básicas**
1. Campo **Nome** obrigatório, mínimo 3, máximo 80 caracteres.
2. Campo **Descrição** opcional, máximo 500 caracteres, contador refletindo o conteúdo do próprio campo.
3. **Objetivo** obrigatório, opções: Vendas, Retenção, Reativação.

**Agente de IA**

4. **Agente** obrigatório (select).
5. **Mensagem inicial** obrigatória, máximo 500 caracteres, suporta as variáveis `{{nome}}`, `{{empresa}}`, `{{cargo}}`. Variáveis inválidas devem ser sinalizadas.

**Audiência**

6. **Origem dos leads** obrigatória: segmento existente OU upload de CSV.
7. Quando CSV, o input deve aceitar somente arquivos `.csv`.
8. **Preview de leads** deve refletir a quantidade real (do segmento ou do arquivo).

**Canais e cronograma**

9. Pelo menos um **canal** obrigatório.
10. **Data de início** obrigatória, não pode ser anterior ao dia atual.
11. **Data de fim** opcional, se preenchida deve ser ≥ data de início.
12. **Horário final** deve ser ≥ horário inicial.
13. Pelo menos um **dia da semana** selecionado.

**Limites**

14. **Envios por lead** entre 1 e 10, padrão 1.
15. **Envios totais por dia** entre 1 e 10.000, padrão 500.
16. **Intervalo entre tentativas** entre 1 e 72 horas, padrão 24.
17. **Máximo de tentativas** entre 0 e 5, padrão 2.

**Qualificação**

18. **Encerrar após N dias sem resposta** entre 1 e 30, padrão 7.

**Comportamento dos botões**

19. **Salvar rascunho** habilitado a partir do momento que o nome tem ≥ 3 caracteres. Demais campos opcionais nesse fluxo.
20. **Lançar campanha** exige todos os campos obrigatórios válidos e abre modal de confirmação antes de disparar.
21. **Cancelar** abre confirmação se houver dados preenchidos no formulário; caso vazio, volta direto.

**UX e acessibilidade**

22. Mensagem de feedback (rascunho/lançamento) visível por pelo menos 3 segundos.
23. Todos os labels conectados aos inputs (`htmlFor`/`id`).

## Setup do projeto

```bash
npm create vite@latest qa-simu -- --template react-ts
cd qa-simu
npm install
git init
git add .
git commit -m "chore: bootstrap"
gh repo create qa-simu --public --source=. --remote=origin --push
```

---

A tela tem **22 bugs plantados**. Quais bugs são, e a severidade de cada um, é problema seu descobrir no teste manual. Se no final quiser conferir o gabarito, me pede.