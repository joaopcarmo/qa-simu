# Test Plan — Nova Campanha de Outbound

**Feature**: Criação de campanha de outbound automatizada operada por agente de IA.
**Ambiente**: localhost:5173 (dev local)
**Build**: main @ `<commit>`
**Executado por**: João Pedro · QA Engineer
**Data**: `22/05/26

## Convenções

- **Tipo**: Happy (caminho feliz), Edge (limites), Negative (entrada inválida).
- **Prioridade**: Crítica (bloqueia release), Alta (bug claro de regra de negócio), Média (UX/comportamento), Baixa (cosmético).
- **AC**: critério de aceitação no documento de feature.
- **Status**: Pass, Fail, Blocked.

---

## TC-01 · Nome com menos de 3 caracteres

**Tipo**: Negative · **Prioridade**: Alta · **AC**: 1

**Passos**
1. Abrir a tela "Nova campanha de outbound"
2. No campo "Nome da campanha", digitar `ab`
3. Tentar lançar a campanha

**Esperado**: validação dispara informando mínimo de 3 caracteres; submit não acontece.
**Obtido**: campo aceita 2 caracteres, lançamento ocorre normalmente.
**Status**: Fail · **Bug relacionado**: BUG-01

---

## TC-02 · Nome com mais de 80 caracteres

**Tipo**: Negative · **Prioridade**: Alta · **AC**: 1

**Passos**
1. No campo "Nome da campanha", colar uma string de 100 caracteres
2. Observar contador e comportamento do campo

**Esperado**: campo bloqueia digitação após 80 caracteres ou exibe erro de validação; contador alerta vermelho ao ultrapassar.
**Obtido**: campo aceita todos os 100 caracteres sem nenhum bloqueio ou aviso; contador mostra `100/80`.
**Status**: Fail · **Bug relacionado**: BUG-02

---

## TC-03 · Descrição com mais de 500 caracteres

**Tipo**: Negative · **Prioridade**: Média · **AC**: 2

**Passos**
1. No campo "Descrição", colar uma string de 600 caracteres
2. Observar contador e comportamento

**Esperado**: campo bloqueia entrada após 500 caracteres.
**Obtido**: campo aceita todos os 600 caracteres sem bloqueio.
**Status**: Fail · **Bug relacionado**: BUG-03

---

## TC-04 · Contador da descrição reflete o conteúdo correto

**Tipo**: Functional · **Prioridade**: Média · **AC**: 2

**Passos**
1. Digitar 10 caracteres no campo "Nome"
2. Digitar 50 caracteres no campo "Descrição"
3. Observar o contador da descrição

**Esperado**: contador da descrição mostra `50/500`.
**Obtido**: contador da descrição mostra `10/500` (está refletindo o tamanho do Nome).
**Status**: Fail · **Bug relacionado**: BUG-04

---

## TC-05 · Mensagem inicial com mais de 500 caracteres

**Tipo**: Negative · **Prioridade**: Média · **AC**: 5

**Passos**
1. No campo "Mensagem inicial", colar uma string de 600 caracteres
2. Observar comportamento

**Esperado**: campo bloqueia entrada após 500 caracteres.
**Obtido**: aceita todos os 600 caracteres.
**Status**: Fail · **Bug relacionado**: BUG-05

---

## TC-06 · Variáveis inválidas na mensagem inicial são sinalizadas

**Tipo**: Negative · **Prioridade**: Média · **AC**: 5

**Passos**
1. No campo "Mensagem inicial", digitar `Oi {{nome}}, sou da {{xyz}}`
2. Sair do campo (blur)

**Esperado**: a variável `{{xyz}}` é destacada como inválida (variáveis válidas: nome, empresa, cargo).
**Obtido**: nenhuma sinalização ocorre; o campo aceita qualquer variável inventada.
**Status**: Fail · **Bug relacionado**: BUG-06

---

## TC-07 · Input de CSV aceita apenas arquivos .csv

**Tipo**: Negative · **Prioridade**: Média · **AC**: 7

**Passos**
1. Selecionar a opção "Upload de CSV"
2. Clicar no input de arquivo
3. Selecionar um `.png` ou `.pdf` do sistema

**Esperado**: o seletor mostra apenas arquivos `.csv` (atributo `accept=".csv"` filtrando).
**Obtido**: o seletor mostra todos os tipos de arquivo, e qualquer formato pode ser anexado.
**Status**: Fail · **Bug relacionado**: BUG-07

---

## TC-08 · Preview de leads atualiza conforme a audiência

**Tipo**: Functional · **Prioridade**: Alta · **AC**: 8

**Passos**
1. Selecionar a opção "Segmento existente"
2. Selecionar o segmento "Trial expirado < 30 dias" (1.842 leads)
3. Observar o card "Leads que serão atingidos"

**Esperado**: card exibe `1.842`.
**Obtido**: card exibe `0` independentemente do segmento selecionado.
**Status**: Fail · **Bug relacionado**: BUG-08

---

## TC-09 · Lançar campanha exige campos obrigatórios

**Tipo**: Negative · **Prioridade**: Crítica · **AC**: 20

**Passos**
1. Abrir a tela com o formulário em estado inicial (todos os campos vazios)
2. Clicar em "Lançar campanha"

**Esperado**: validação dispara, destacando os campos obrigatórios ausentes (nome, objetivo, agente, mensagem inicial, audiência, canal, data de início); submit não ocorre.
**Obtido**: o submit ocorre normalmente, mensagem de sucesso "Campanha '' lançada com sucesso" aparece.
**Status**: Fail · **Bug relacionado**: BUG-09

---

## TC-10 · Data de início não aceita data no passado

**Tipo**: Negative · **Prioridade**: Alta · **AC**: 10

**Passos**
1. Preencher todos os campos obrigatórios
2. Definir "Data de início" como `01/01/2020`
3. Clicar em "Lançar campanha"

**Esperado**: validação dispara; data de início não pode ser anterior a hoje.
**Obtido**: data passada é aceita; campanha lançada com cronograma inválido.
**Status**: Fail · **Bug relacionado**: BUG-10

---

## TC-11 · Data de fim não pode ser anterior à data de início

**Tipo**: Negative · **Prioridade**: Alta · **AC**: 11

**Passos**
1. Definir "Data de início" como `01/12/2025`
2. Definir "Data de fim" como `01/11/2025`
3. Tentar lançar

**Esperado**: validação dispara; data de fim deve ser ≥ data de início.
**Obtido**: combinação aceita sem alerta.
**Status**: Fail · **Bug relacionado**: BUG-11

---

## TC-12 · Horário final não pode ser anterior ao horário inicial

**Tipo**: Negative · **Prioridade**: Média · **AC**: 12

**Passos**
1. Definir "Horário inicial" como `18:00`
2. Definir "Horário final" como `09:00`
3. Tentar lançar

**Esperado**: validação dispara; horário final deve ser ≥ horário inicial.
**Obtido**: combinação aceita sem alerta.
**Status**: Fail · **Bug relacionado**: BUG-12

---

## TC-13 · Lançar sem dia da semana selecionado

**Tipo**: Negative · **Prioridade**: Alta · **AC**: 13

**Passos**
1. Desmarcar todos os dias da semana (Seg–Dom)
2. Preencher demais campos obrigatórios
3. Clicar em "Lançar campanha"

**Esperado**: validação dispara; pelo menos um dia da semana é obrigatório.
**Obtido**: campanha é lançada sem nenhum dia selecionado.
**Status**: Fail · **Bug relacionado**: BUG-13

---

## TC-14 · Envios por lead respeita o range 1–10

**Tipo**: Negative · **Prioridade**: Média · **AC**: 14

**Passos**
1. No campo "Envios por lead", digitar `-5`
2. Repetir com `0`, `50`
3. Tentar lançar

**Esperado**: campo bloqueia ou alerta para valores fora do range 1–10.
**Obtido**: aceita negativos, zero e valores acima de 10 sem nenhuma validação.
**Status**: Fail · **Bug relacionado**: BUG-14

---

## TC-15 · Envios totais por dia respeita o range 1–10.000

**Tipo**: Negative · **Prioridade**: Média · **AC**: 15

**Passos**
1. No campo "Envios totais por dia", digitar `-100`
2. Repetir com `0`, `99999`

**Esperado**: validação dispara para valores fora do range 1–10.000.
**Obtido**: aceita qualquer valor.
**Status**: Fail · **Bug relacionado**: BUG-15

---

## TC-16 · Intervalo entre tentativas respeita o range 1–72

**Tipo**: Negative · **Prioridade**: Média · **AC**: 16

**Passos**
1. No campo "Intervalo entre tentativas (horas)", digitar `0`
2. Repetir com `-10`, `200`

**Esperado**: validação dispara para valores fora do range 1–72.
**Obtido**: aceita qualquer valor.
**Status**: Fail · **Bug relacionado**: BUG-16

---

## TC-17 · Máximo de tentativas respeita o range 0–5

**Tipo**: Negative · **Prioridade**: Média · **AC**: 17

**Passos**
1. No campo "Máximo de tentativas", digitar `-1`
2. Repetir com `100`

**Esperado**: validação dispara para valores fora do range 0–5.
**Obtido**: aceita qualquer valor.
**Status**: Fail · **Bug relacionado**: BUG-17

---

## TC-18 · Auto-close respeita o range 1–30

**Tipo**: Negative · **Prioridade**: Média · **AC**: 18

**Passos**
1. No campo "Encerrar contato após N dias sem resposta", digitar `0`
2. Repetir com `-5`, `999`

**Esperado**: validação dispara para valores fora do range 1–30.
**Obtido**: aceita qualquer valor.
**Status**: Fail · **Bug relacionado**: BUG-18

---

## TC-19 · Botão "Salvar rascunho" habilita ao preencher o nome

**Tipo**: Functional · **Prioridade**: Alta · **AC**: 19

**Passos**
1. Observar o botão "Salvar rascunho" no estado inicial
2. Preencher o campo "Nome" com `Teste`
3. Observar o botão novamente

**Esperado**: botão habilita assim que o nome tem ≥ 3 caracteres.
**Obtido**: botão permanece desabilitado independentemente do conteúdo do formulário.
**Status**: Fail · **Bug relacionado**: BUG-19

---

## TC-20 · Lançar campanha exibe modal de confirmação

**Tipo**: Functional · **Prioridade**: Alta · **AC**: 20

**Passos**
1. Preencher todos os campos obrigatórios validamente
2. Clicar em "Lançar campanha"

**Esperado**: modal de confirmação é exibido antes de efetivar o lançamento.
**Obtido**: campanha é lançada imediatamente, sem confirmação intermediária.
**Status**: Fail · **Bug relacionado**: BUG-20

---

## TC-21 · Cancelar com dados preenchidos exibe confirmação

**Tipo**: Functional · **Prioridade**: Média · **AC**: 21

**Passos**
1. Preencher pelo menos o nome e o objetivo
2. Clicar em "Cancelar"

**Esperado**: modal de confirmação é exibido pedindo para confirmar o descarte das alterações.
**Obtido**: formulário é descartado imediatamente, sem aviso.
**Status**: Fail · **Bug relacionado**: BUG-21

---

## TC-22 · Mensagem de feedback permanece por ao menos 3 segundos

**Tipo**: Functional · **Prioridade**: Média · **AC**: 22

**Passos**
1. Lançar uma campanha (ou salvar rascunho)
2. Cronometrar quanto tempo a mensagem "Campanha 'X' lançada..." permanece visível

**Esperado**: mensagem visível por pelo menos 3 segundos.
**Obtido**: mensagem some em aproximadamente 0,8 segundo, dificultando a leitura.
**Status**: Fail · **Bug relacionado**: BUG-22

---

## TC-23 · Cancelar reseta o nome do arquivo no input CSV (bônus)

**Tipo**: Functional · **Prioridade**: Baixa · **AC**: 21 (interpretação extensiva)

**Passos**
1. Selecionar "Upload de CSV"
2. Anexar um arquivo qualquer
3. Clicar em "Cancelar"

**Esperado**: o input de arquivo volta a exibir "Nenhum arquivo selecionado".
**Obtido**: o nome do arquivo continua visível, embora o estado interno (`form.csvFile`) tenha sido limpo.
**Status**: Fail · **Bug relacionado**: BUG-23

---

## TC-24 · Formulário é limpo após lançar com sucesso (bônus)

**Tipo**: Functional · **Prioridade**: Baixa · **AC**: não previsto (sugestão de produto)

**Passos**
1. Preencher e lançar uma campanha
2. Observar o estado do formulário após o feedback de sucesso

**Esperado**: formulário retorna ao estado inicial (ou usuário é redirecionado para a tela da campanha criada).
**Obtido**: todos os dados preenchidos permanecem visíveis no formulário após o lançamento.
**Status**: Fail · **Bug relacionado**: BUG-24

---

## Resumo da execução

| Total | Pass | Fail | Blocked |
|-------|------|------|---------|
| 24    | 0    | 24   | 0       |

24 falhas reportadas como 24 tickets de bug no Linear (BUG-01 a BUG-24).