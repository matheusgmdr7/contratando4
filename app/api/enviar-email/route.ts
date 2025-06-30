import { type NextRequest, NextResponse } from "next/server"
import { enviarEmailValidacaoProposta } from "@/services/email-service"

export async function POST(request: NextRequest) {
  try {
    console.log("📧 API ROUTE - Recebendo requisição de envio de email")

    const body = await request.json()
    console.log("📧 Dados recebidos:", body)

    const { email, nome, propostaId, corretor } = body

    // Validação dos dados obrigatórios
    if (!email || !nome || !propostaId) {
      console.error("❌ Dados obrigatórios faltando:", { email, nome, propostaId })
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Dados obrigatórios faltando: email, nome ou propostaId",
        },
        { status: 400 },
      )
    }

    console.log("📧 Iniciando envio de email...")
    console.log(`   Para: ${email}`)
    console.log(`   Nome: ${nome}`)
    console.log(`   Proposta: ${propostaId}`)
    console.log(`   Corretor: ${corretor || "Sistema"}`)

    // Enviar email usando o serviço
    const resultado = await enviarEmailValidacaoProposta(email, nome, propostaId)

    console.log(`📧 Resultado do envio: ${resultado}`)

    if (resultado) {
      console.log("✅ Email enviado com sucesso via API route")
      return NextResponse.json({
        sucesso: true,
        mensagem: "Email enviado com sucesso",
        propostaId,
        email,
        nome,
      })
    } else {
      console.error("❌ Falha no envio de email")
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Falha no envio de email",
          propostaId,
          email,
          nome,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("💥 Erro na API route de envio de email:", error)
    return NextResponse.json(
      {
        sucesso: false,
        erro: "Erro interno do servidor: " + error.message,
      },
      { status: 500 },
    )
  }
}
