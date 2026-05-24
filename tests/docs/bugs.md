# Bugs reportados — Nova Campanha de Outbound

Cada item abaixo corresponde a um ticket a ser aberto no Linear. Formato padronizado: título · resumo · passos · esperado · atual · ambiente · severidade · AC · TC.

**Ambiente padrão para todos os bugs**
- URL: `http://localhost:5173` (dev local)
- Browser: Chrome 130 · macOS 14
- Branch/commit: `main @ <commit>`

---

## BUG-01 · Campo "Nome" aceita menos de 3 caracteres

**Severidade**: Alta · **AC afetado**: 1 · **Caso de teste**: TC-01

**Resumo**: O campo "Nome da campanha" aceita strings com menos de 3 caracteres e permite o lançamento da campanha, contrariando o critério de aceitação que define mínimo de 3.

**Passos**
1. Abrir a tela "Nova campanha de outbound"
2. Digitar `ab` no campo "Nome da campanha"
3. Preencher os demais obrigatórios e clicar em "Lançar campanha"

**Esperado**: validação dispara informando mínimo de 3 caracteres; submit não acontece.
**Atual**: campo aceita 2 caracteres e a campanha é lançada normalmente.

---

## BUG-02 · Campo "Nome" aceita mais de 80 caracteres

**Severidade**: Alta · **AC afetado**: 1 · **Caso de teste**: TC-02

**Resumo**: O campo "Nome da campanha" não tem `maxLength` e não há validação no submit, permitindo strings acima de 80 caracteres.

**Passos**
1. Colar uma string de 100 caracteres no campo "Nome da campanha"
2. Observar o contador

**Esperado**: entrada bloqueada em 80 caracteres ou validação no submit.
**Atual**: campo aceita 100 caracteres; contador exibe `100/80` sem alerta visual.

---

## BUG-03 · Campo "Descrição" aceita mais de 500 caracteres

**Severidade**: Média · **AC afetado**: 2 · **Caso de teste**: TC-03

**Resumo**: O campo "Descrição" não tem `maxLength` e nenhuma validação no submit, permitindo entrada acima de 500 caracteres.

**Passos**
1. Colar 600 caracteres no campo "Descrição"

**Esperado**: bloqueia após 500 caracteres.
**Atual**: aceita os 600 sem bloqueio.

---

## BUG-04 · Contador da "Descrição" reflete o tamanho do campo "Nome"

**Severidade**: Alta · **AC afetado**: 2 · **Caso de teste**: TC-04

**Resumo**: O contador exibido abaixo do campo "Descrição" está vinculado ao length do campo "Nome", e não ao próprio conteúdo. Provável bug de copy-paste no JSX (`form.name.length` no lugar de `form.description.length`).

**Passos**
1. Digitar 10 caracteres em "Nome"
2. Digitar 50 caracteres em "Descrição"
3. Observar o contador abaixo da descrição

**Esperado**: contador exibe `50/500`.
**Atual**: contador exibe `10/500`.

---

## BUG-05 · Campo "Mensagem inicial" aceita mais de 500 caracteres

**Severidade**: Média · **AC afetado**: 5 · **Caso de teste**: TC-05

**Resumo**: O textarea "Mensagem inicial" não tem `maxLength` nem validação no submit, permitindo entrada acima de 500 caracteres.

**Passos**
1. Colar 600 caracteres no campo "Mensagem inicial"

**Esperado**: bloqueia após 500 caracteres.
**Atual**: aceita os 600.

---

## BUG-06 · Variáveis inválidas na mensagem inicial não são sinalizadas

**Severidade**: Média · **AC afetado**: 5 · **Caso de teste**: TC-06

**Resumo**: O campo aceita variáveis no formato `{{xyz}}` sem validar se a variável existe (as válidas são apenas `nome`, `empresa`, `cargo`). Risco: mensagem é enviada com placeholder não substituído.

**Passos**
1. Digitar no campo: `Oi {{nome}}, sou da {{xyz}}`
2. Sair do campo (blur)

**Esperado**: `{{xyz}}` é destacado como variável inválida.
**Atual**: nenhuma sinalização ocorre.

---

## BUG-07 · Input de CSV aceita qualquer tipo de arquivo

**Severidade**: Média · **AC afetado**: 7 · **Caso de teste**: TC-07

**Resumo**: O `<input type="file">` não tem o atributo `accept=".csv"`, permitindo anexar arquivos de qualquer formato (PDF, PNG, etc.). Risco: erro silencioso no processamento da audiência ou crash do back-end.

**Passos**
1. Selecionar "Upload de CSV"
2. Anexar um arquivo `.png` ou `.pdf`

**Esperado**: seletor do sistema mostra apenas arquivos `.csv`.
**Atual**: qualquer arquivo é aceito.

---

## BUG-08 · Preview de leads sempre exibe zero

**Severidade**: Alta · **AC afetado**: 8 · **Caso de teste**: TC-08

**Resumo**: O card "Leads que serão atingidos" exibe sempre `0`, independentemente do segmento selecionado ou do CSV anexado. A função de cálculo está retornando constante zero.

**Passos**
1. Selecionar a opção "Segmento existente"
2. Selecionar qualquer segmento da lista

**Esperado**: card exibe a quantidade real do segmento (ex: `1.842` para "Trial expirado < 30 dias").
**Atual**: card exibe `0`.

---

## BUG-09 · Lançar campanha não valida campos obrigatórios

**Severidade**: Crítica · **AC afetado**: 20 · **Caso de teste**: TC-09

**Resumo**: O botão "Lançar campanha" dispara o submit sem validar nenhum dos campos obrigatórios (nome, objetivo, agente, mensagem inicial, audiência, canal, data de início). Permite criar uma campanha em branco.

**Passos**
1. Abrir a tela com todos os campos em estado inicial (vazios)
2. Clicar em "Lançar campanha"

**Esperado**: validação dispara, campos obrigatórios são destacados, submit não ocorre.
**Atual**: submit ocorre, mensagem "Campanha '' lançada com sucesso" é exibida.

---

## BUG-10 · Data de início aceita datas no passado

**Severidade**: Alta · **AC afetado**: 10 · **Caso de teste**: TC-10

**Resumo**: O input de data de início não tem o atributo `min` apontando para o dia atual e não há validação no submit, permitindo agendar uma campanha para uma data já passada.

**Passos**
1. Preencher demais obrigatórios
2. Definir "Data de início" como `01/01/2020`
3. Clicar em "Lançar campanha"

**Esperado**: validação dispara; data de início ≥ hoje.
**Atual**: data passada aceita; campanha lançada com cronograma inválido.

---

## BUG-11 · Data de fim aceita valor anterior à data de início

**Severidade**: Alta · **AC afetado**: 11 · **Caso de teste**: TC-11

**Resumo**: Não há validação cruzada entre os campos de data; a data de fim pode ser anterior à data de início sem qualquer alerta.

**Passos**
1. Definir "Data de início" como `01/12/2025`
2. Definir "Data de fim" como `01/11/2025`
3. Lançar a campanha

**Esperado**: validação dispara; data de fim ≥ data de início.
**Atual**: combinação aceita.

---

## BUG-12 · Horário final aceita valor anterior ao horário inicial

**Severidade**: Média · **AC afetado**: 12 · **Caso de teste**: TC-12

**Resumo**: Não há validação cruzada entre horário inicial e final; é possível configurar uma janela inválida (ex: das 18h às 9h do mesmo dia).

**Passos**
1. Definir "Horário inicial" como `18:00`
2. Definir "Horário final" como `09:00`
3. Lançar

**Esperado**: validação dispara; horário final ≥ horário inicial.
**Atual**: combinação aceita.

---

## BUG-13 · Lançamento permitido sem nenhum dia da semana selecionado

**Severidade**: Alta · **AC afetado**: 13 · **Caso de teste**: TC-13

**Resumo**: É possível desmarcar todos os dias da semana e ainda assim lançar a campanha. Campanha lançada sem dia válido nunca seria executada pelo backend.

**Passos**
1. Desmarcar Seg, Ter, Qua, Qui, Sex
2. Preencher demais obrigatórios
3. Lançar

**Esperado**: validação dispara; ao menos um dia obrigatório.
**Atual**: campanha lançada sem nenhum dia ativo.

---

## BUG-14 · "Envios por lead" aceita valores fora do range 1–10

**Severidade**: Média · **AC afetado**: 14 · **Caso de teste**: TC-14

**Resumo**: O input numérico não tem `min`/`max` nem validação no submit. Aceita negativos, zero e valores acima de 10.

**Passos**
1. Digitar `-5` em "Envios por lead"
2. Repetir com `0` e `50`

**Esperado**: validação dispara para valores fora de 1–10.
**Atual**: aceita qualquer valor.

---

## BUG-15 · "Envios totais por dia" aceita valores fora do range 1–10.000

**Severidade**: Média · **AC afetado**: 15 · **Caso de teste**: TC-15

**Resumo**: Input sem `min`/`max` e sem validação no submit.

**Passos**
1. Digitar `-100` em "Envios totais por dia"
2. Repetir com `0` e `99999`

**Esperado**: validação dispara para valores fora de 1–10.000.
**Atual**: aceita qualquer valor.

---

## BUG-16 · "Intervalo entre tentativas" aceita valores fora do range 1–72

**Severidade**: Média · **AC afetado**: 16 · **Caso de teste**: TC-16

**Resumo**: Input sem `min`/`max`. Aceitar `0` pode causar loop infinito no agendamento de retries no back-end.

**Passos**
1. Digitar `0` no campo "Intervalo entre tentativas (horas)"
2. Repetir com `-10` e `200`

**Esperado**: validação dispara para valores fora de 1–72.
**Atual**: aceita qualquer valor.

---

## BUG-17 · "Máximo de tentativas" aceita valores fora do range 0–5

**Severidade**: Média · **AC afetado**: 17 · **Caso de teste**: TC-17

**Resumo**: Input sem `min`/`max`. Aceitar valores acima de 5 pode estourar limites de canais (WhatsApp tem limite de tentativas por número).

**Passos**
1. Digitar `-1` em "Máximo de tentativas"
2. Repetir com `100`

**Esperado**: validação dispara para valores fora de 0–5.
**Atual**: aceita qualquer valor.

---

## BUG-18 · "Encerrar contato após N dias" aceita valores fora do range 1–30

**Severidade**: Média · **AC afetado**: 18 · **Caso de teste**: TC-18

**Resumo**: Input sem `min`/`max`.

**Passos**
1. Digitar `0` no campo "Encerrar contato após N dias sem resposta"
2. Repetir com `-5` e `999`

**Esperado**: validação dispara para valores fora de 1–30.
**Atual**: aceita qualquer valor.

---

## BUG-19 · Botão "Salvar rascunho" permanentemente desabilitado

**Severidade**: Alta · **AC afetado**: 19 · **Caso de teste**: TC-19

**Resumo**: O botão "Salvar rascunho" está hardcoded como `disabled={true}` no JSX, impedindo o uso da funcionalidade em qualquer cenário.

**Passos**
1. Abrir a tela em estado inicial — botão desabilitado
2. Preencher o nome com `Teste` — botão segue desabilitado
3. Preencher todos os campos do formulário — botão segue desabilitado

**Esperado**: botão habilita quando o nome tem ≥ 3 caracteres.
**Atual**: botão permanece desabilitado em todos os cenários.

**Hipótese de causa**: atributo `disabled={true}` literal no botão (ao invés de derivado do estado do form).

---

## BUG-20 · Lançar campanha não exibe modal de confirmação

**Severidade**: Alta · **AC afetado**: 20 · **Caso de teste**: TC-20

**Resumo**: O lançamento de uma campanha é uma ação irreversível (dispara envios para leads reais). Atualmente o clique em "Lançar campanha" efetiva a ação imediatamente, sem etapa de confirmação.

**Passos**
1. Preencher um formulário válido
2. Clicar em "Lançar campanha"

**Esperado**: modal de confirmação ("Deseja realmente lançar esta campanha?") é exibido antes da efetivação.
**Atual**: campanha é lançada imediatamente.

---

## BUG-21 · Cancelar não exibe confirmação com dados preenchidos

**Severidade**: Média · **AC afetado**: 21 · **Caso de teste**: TC-21

**Resumo**: Clicar em "Cancelar" descarta o formulário sem alerta, mesmo quando há dados preenchidos. Usuário pode perder o trabalho por engano.

**Passos**
1. Preencher pelo menos nome e objetivo
2. Clicar em "Cancelar"

**Esperado**: modal pedindo confirmação do descarte.
**Atual**: formulário descartado imediatamente.

---

## BUG-22 · Mensagem de feedback some em menos de 1 segundo

**Severidade**: Média · **AC afetado**: 22 · **Caso de teste**: TC-22

**Resumo**: A mensagem de sucesso após lançar/salvar rascunho é exibida por aproximadamente 800ms, contrariando o critério que define mínimo de 3 segundos. Usuário mal consegue ler antes de sumir.

**Passos**
1. Preencher e lançar uma campanha
2. Cronometrar o tempo da mensagem na tela

**Esperado**: feedback visível por pelo menos 3 segundos.
**Atual**: feedback desaparece em ~800ms.

**Hipótese de causa**: `setTimeout(() => setFeedback(null), 800)` em vez de 3000ms.

---

## BUG-23 · Input de CSV não reseta visualmente ao cancelar (bônus)

**Severidade**: Baixa · **AC afetado**: 21 (interpretação extensiva) · **Caso de teste**: TC-23

**Resumo**: Ao clicar em "Cancelar", o estado interno (`form.csvFile`) volta para `null`, mas o `<input type="file">` continua exibindo o nome do arquivo anteriormente selecionado. Estado e UI ficam dessincronizados.

**Passos**
1. Selecionar "Upload de CSV"
2. Anexar qualquer arquivo
3. Clicar em "Cancelar"
4. Observar o input de arquivo

**Esperado**: input volta a exibir "Nenhum arquivo selecionado".
**Atual**: nome do arquivo permanece visível mesmo com o estado interno limpo.

**Hipótese de causa**: input file é parcialmente uncontrolled no React. Solução típica é forçar remount via `key` ou usar `ref` para limpar manualmente o `value`.

---

## BUG-24 · Formulário permanece preenchido após lançar com sucesso (bônus)

**Severidade**: Baixa · **AC afetado**: não previsto (sugestão de produto) · **Caso de teste**: TC-24

**Resumo**: Após o lançamento bem-sucedido de uma campanha, o formulário permanece com todos os dados preenchidos. Usuário pode acidentalmente lançar a mesma campanha de novo.

**Passos**
1. Preencher e lançar uma campanha
2. Observar o estado do formulário após o feedback

**Esperado**: formulário retorna ao estado inicial OU usuário é redirecionado para a tela da campanha criada.
**Atual**: formulário permanece preenchido como antes do submit.

**Observação**: comportamento não está explícito nos ACs, mas é expectativa razoável de produto.

---

## Resumo

| Severidade | Quantidade |
|------------|------------|
| Crítica    | 1          |
| Alta       | 9          |
| Média      | 12         |
| Baixa      | 2          |
| **Total**  | **24**     |

**Crítica**: BUG-09 (lançar sem validação).
**Altas**: BUG-01, 02, 04, 08, 10, 11, 13, 19, 20.
**Médias**: BUG-03, 05, 06, 07, 12, 14, 15, 16, 17, 18, 21, 22.
**Baixas**: BUG-23, 24 (bônus encontrados no exploratório).