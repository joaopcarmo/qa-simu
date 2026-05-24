# SonarCloud Setup Guide

Este documento explica como configurar o SonarCloud para este projeto.

## Passos de Configuração

### 1. Criar conta no SonarCloud
- Acesse [https://sonarcloud.io](https://sonarcloud.io)
- Faça login com sua conta GitHub
- Autorize o SonarCloud a acessar seus repositórios

### 2. Criar organização (se necessário)
- Se você já tem uma organização no SonarCloud, use-a
- Caso contrário, crie uma nova organização
- Anote o `sonar.organization` - você vai precisar dele

### 3. Adicionar repositório
- No SonarCloud, vá em "Analyze new project"
- Selecione este repositório (qa-simu)
- Siga as instruções para criar um novo projeto

### 4. Gerar token SONAR_TOKEN
- No SonarCloud, vá em Settings > Security > Tokens
- Clique em "Generate Tokens"
- Dê um nome (ex: "GitHub Actions")
- Copie o token gerado

### 5. Adicionar segredo no GitHub
- No repositório GitHub, vá em Settings > Secrets and variables > Actions
- Clique em "New repository secret"
- Nome: `SONAR_TOKEN`
- Valor: Cole o token que você gerou no passo anterior
- Clique em "Add secret"

### 6. Atualizar sonar-project.properties
- Edite o arquivo `sonar-project.properties` no raiz do projeto
- Atualize as seguintes linhas com suas informações:
  ```
  sonar.projectKey=SEU_PROJECT_KEY
  sonar.organization=SUA_ORGANIZATION
  ```

### 7. Fazer push e verificar
- Faça um commit com as alterações
- Faça push para a branch principal
- O GitHub Actions vai rodar automaticamente
- Verifique se o SonarCloud aparece nos checks do PR/commit

## Troubleshooting

### Token não funciona
- Verifique se o token foi copiado corretamente
- Confirme que o secret foi adicionado com o nome exato `SONAR_TOKEN`

### Projeto não aparece no SonarCloud
- Verifique se `sonar.projectKey` e `sonar.organization` estão corretos
- Verifique o log do GitHub Actions para mensagens de erro

### Análise não cobre todo o código
- Se você quer cobertura de testes, configure o coverage no seu projeto
- Adicione o caminho correto em `sonar.javascript.lcov.reportPaths`

## Configurações adicionais (opcional)

### Adicionar cobertura de testes
1. Instale coverador (ex: c8):
   ```
   npm install --save-dev c8
   ```

2. Atualize o script test no package.json:
   ```json
   "test": "c8 --reporter=lcov --reporter=text playwright test"
   ```

3. Descomente a linha de cobertura em `sonar-project.properties`:
   ```
   sonar.javascript.lcov.reportPaths=coverage/lcov.info
   ```

## Recursos úteis
- [Documentação SonarCloud](https://docs.sonarcloud.io)
- [Documentação SonarCloud GitHub Action](https://github.com/SonarSource/sonarcloud-github-action)
