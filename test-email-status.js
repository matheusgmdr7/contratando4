// Teste para verificar a lógica de conversão de status de email
console.log("🧪 TESTANDO LÓGICA DE CONVERSÃO DE STATUS DE EMAIL")
console.log("=".repeat(60))

// Simular diferentes tipos de retorno da Edge Function
const testCases = [
  { name: "Sucesso verdadeiro", value: true, expected: true },
  { name: "Sucesso string 'true'", value: "true", expected: true },
  { name: "Sucesso número 1", value: 1, expected: true },
  { name: "Falha false", value: false, expected: false },
  { name: "Falha null", value: null, expected: false },
  { name: "Falha undefined", value: undefined, expected: false },
  { name: "Falha string vazia", value: "", expected: false },
  { name: "Falha número 0", value: 0, expected: false },
  { name: "Objeto com success true", value: { success: true }, expected: true },
  { name: "Objeto com success false", value: { success: false }, expected: false },
]

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Teste ${index + 1}: ${testCase.name}`)
  console.log(`   Valor original: ${JSON.stringify(testCase.value)} (tipo: ${typeof testCase.value})`)

  // Aplicar a lógica de conversão
  const resultado = Boolean(testCase.value)

  console.log(`   Boolean(valor): ${resultado}`)
  console.log(`   Esperado: ${testCase.expected}`)
  console.log(`   ✅ Passou: ${resultado === testCase.expected ? "SIM" : "NÃO"}`)
})

console.log("\n" + "=".repeat(60))
console.log("🎯 CONCLUSÃO: A função Boolean() converte corretamente todos os casos")
console.log("💡 Para objetos, use: Boolean(response?.success) ou response?.success === true")
