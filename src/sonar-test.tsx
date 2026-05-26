// sonar-test.ts
// Arquivo com problemas intencionais para teste do SonarCloud

// 1. Variáveis declaradas e nunca usadas
const unusedVariable = "isso nunca é usado";
let unusedNumber = 42;

// 2. Função com parâmetro nunca usado
function processData(data: any, unusedParam: any): any {
  console.log(data);
  return data;
}

// 3. Uso de 'any' explícito (code smell em TypeScript)
function riskyFunction(input: any): any {
  return input;
}

// 4. Código morto após return
function deadCode(): string {
  return "resultado";
  console.log("isso nunca executa");
  const x = 1 + 1;
}

// 5. Condição sempre verdadeira
function alwaysTrue(): void {
  const x = "texto";
  if (x === "texto" || x !== "texto") {
    console.log("sempre executa");
  }
}

// 6. Comparação com == em vez de ===
function looseComparison(value: any): boolean {
  return value == null;
}

// 7. console.log deixado no código (não deveria ir pra produção)
function calculateTotal(price: number, tax: number): number {
  console.log("calculando total...");
  console.log("price:", price);
  console.log("tax:", tax);
  return price + tax;
}

// 8. Variável redeclarada
function duplicateVar(): void {
  var x = 1;
  var x = 2;
  console.log(x);
}

// 9. Promise sem tratamento de erro
async function fetchData(url: string): Promise<void> {
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}

// 10. Função vazia sem motivo aparente
function emptyFunction(): void {
}

export { processData, riskyFunction, calculateTotal };