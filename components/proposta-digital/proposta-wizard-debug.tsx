"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Step8ConfirmationDebug from "./steps/step8-confirmation-debug"
import { validarCPF } from "@/utils/validacoes"

// Schema simplificado para debug
const formSchema = z.object({
  corretor_nome: z.string().min(3, "Nome do corretor é obrigatório"),
  corretor_id: z.string().optional(),
  template_id: z.string().min(1, "Selecione um modelo de proposta"),
  template_titulo: z.string().optional(),
  nome: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .refine((cpf) => validarCPF(cpf), { message: "CPF inválido" }),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  assinatura: z.string().min(1, "Assinatura é obrigatória"),
})

type FormValues = z.infer<typeof formSchema>

interface PropostaWizardDebugProps {
  templates: any[]
  corretorPredefinido?: any
}

export default function PropostaWizardDebug({ templates, corretorPredefinido }: PropostaWizardDebugProps) {
  const [currentStep, setCurrentStep] = useState(8) // Começar direto no Step 8 para debug
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [propostaId, setPropostaId] = useState<string | null>(null)

  // ESTADOS CRÍTICOS PARA DEBUG - COM LOGS DETALHADOS
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [statusVerificado, setStatusVerificado] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any[]>([])

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      corretor_nome: corretorPredefinido?.nome || "Corretor Teste",
      corretor_id: corretorPredefinido?.id || "corretor_123",
      template_id: "template_123",
      template_titulo: "Modelo Teste",
      nome: "Cliente Teste",
      cpf: "12345678901",
      email: "cliente@teste.com",
      telefone: "11999999999",
      assinatura: "Assinatura Teste",
    },
    mode: "onChange",
  })

  // FUNÇÃO DE DEBUG PARA ADICIONAR LOGS
  const adicionarDebugLog = (etapa: string, dados: any) => {
    const timestamp = new Date().toLocaleTimeString()
    const novoLog = {
      timestamp,
      etapa,
      dados: JSON.stringify(dados, null, 2),
    }

    console.log(`🔍 DEBUG LOG - ${timestamp} - ${etapa}:`, dados)
    setDebugInfo((prev) => [...prev, novoLog])
  }

  // SIMULAÇÃO DO PROCESSO DE ENVIO - FOCADO NO STATUS DO EMAIL
  const simularEnvioProposta = async () => {
    try {
      setIsSubmitting(true)
      adicionarDebugLog("INÍCIO", "Processo de envio iniciado")

      const data = methods.getValues()
      adicionarDebugLog("DADOS_FORMULÁRIO", data)

      // ETAPA 1: Simular criação da proposta
      adicionarDebugLog("CRIANDO_PROPOSTA", "Simulando criação no banco...")

      const propostaSimulada = {
        id: `prop_debug_${Date.now()}`,
        nome: data.nome,
        email: data.email,
        status: "pendente",
      }

      adicionarDebugLog("PROPOSTA_CRIADA", propostaSimulada)
      setPropostaId(propostaSimulada.id)

      // ETAPA 2: Simular envio de email
      adicionarDebugLog("ENVIANDO_EMAIL", {
        para: data.email,
        nome: data.nome,
        proposta_id: propostaSimulada.id,
      })

      // Simular delay do email
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // ETAPA 3: CRÍTICA - Definir resultado do email
      const emailFoiEnviado = true // Simular sucesso

      adicionarDebugLog("EMAIL_RESULTADO", {
        sucesso: emailFoiEnviado,
        tipo: typeof emailFoiEnviado,
        valor: emailFoiEnviado,
      })

      // ETAPA 4: CRÍTICA - Atualizar estados COM LOGS DETALHADOS
      console.log("🎯 ANTES DE ATUALIZAR ESTADOS:")
      console.log("   emailEnviado atual:", emailEnviado)
      console.log("   statusVerificado atual:", statusVerificado)

      adicionarDebugLog("ANTES_ATUALIZAR_ESTADOS", {
        emailEnviado_antes: emailEnviado,
        statusVerificado_antes: statusVerificado,
      })

      // ATUALIZAR ESTADOS
      console.log("🔄 CHAMANDO setEmailEnviado(true)...")
      setEmailEnviado(true)

      console.log("🔄 CHAMANDO setStatusVerificado(true)...")
      setStatusVerificado(true)

      adicionarDebugLog("CHAMADAS_SET_STATE", {
        setEmailEnviado_chamado_com: true,
        setStatusVerificado_chamado_com: true,
        timestamp: new Date().toISOString(),
      })

      console.log("🎯 APÓS CHAMAR SET STATES:")
      console.log("   setEmailEnviado foi chamado com: true")
      console.log("   setStatusVerificado foi chamado com: true")

      // ETAPA 5: VERIFICAR ESTADOS APÓS UM TIMEOUT
      setTimeout(() => {
        console.log("🎯 VERIFICAÇÃO APÓS TIMEOUT (100ms):")
        console.log("   emailEnviado state atual:", emailEnviado)
        console.log("   statusVerificado state atual:", statusVerificado)

        adicionarDebugLog("VERIFICAÇÃO_ESTADOS_TIMEOUT", {
          emailEnviado_state: emailEnviado,
          statusVerificado_state: statusVerificado,
          propostaId_state: propostaId,
        })
      }, 100)

      // ETAPA 6: TOAST DE SUCESSO
      console.log("🎉 GERANDO TOAST DE SUCESSO...")
      toast.success("Proposta enviada com sucesso!")

      adicionarDebugLog("TOAST_GERADO", {
        mensagem: "Proposta enviada com sucesso!",
        timestamp: new Date().toISOString(),
      })

      console.log("✅ PROCESSO SIMULADO CONCLUÍDO!")
    } catch (error) {
      console.error("❌ ERRO NA SIMULAÇÃO:", error)
      adicionarDebugLog("ERRO", {
        mensagem: error.message,
        stack: error.stack,
      })
      toast.error(`Erro: ${error.message}`)
    } finally {
      setIsSubmitting(false)
      adicionarDebugLog("FINALIZANDO", "setIsSubmitting(false)")
    }
  }

  // FUNÇÃO PARA ENVIO MANUAL DE EMAIL (para o Step8)
  const enviarEmailManual = async (): Promise<boolean> => {
    console.log("📧 ENVIO MANUAL INICIADO...")
    adicionarDebugLog("ENVIO_MANUAL", "Tentativa de envio manual")

    try {
      // Simular envio manual
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const sucesso = true

      if (sucesso) {
        console.log("📧 ENVIO MANUAL - Atualizando estados...")

        adicionarDebugLog("ENVIO_MANUAL_ANTES", {
          emailEnviado_antes: emailEnviado,
          statusVerificado_antes: statusVerificado,
        })

        setEmailEnviado(true)
        setStatusVerificado(true)

        adicionarDebugLog("ENVIO_MANUAL_SUCESSO", {
          setEmailEnviado_chamado_com: true,
          setStatusVerificado_chamado_com: true,
        })

        return true
      }

      return false
    } catch (error) {
      console.error("❌ ERRO NO ENVIO MANUAL:", error)
      adicionarDebugLog("ENVIO_MANUAL_ERRO", error.message)
      return false
    }
  }

  // EFEITO PARA MONITORAR MUDANÇAS DE ESTADO - COM LOGS DETALHADOS
  useEffect(() => {
    console.log("🔄 USEEFFECT - MUDANÇA DE ESTADO DETECTADA:")
    console.log("   emailEnviado:", emailEnviado)
    console.log("   statusVerificado:", statusVerificado)
    console.log("   propostaId:", propostaId)

    adicionarDebugLog("USEEFFECT_MUDANÇA", {
      emailEnviado,
      statusVerificado,
      propostaId,
      timestamp: new Date().toISOString(),
    })
  }, [emailEnviado, statusVerificado, propostaId])

  // EFEITO ESPECÍFICO PARA emailEnviado
  useEffect(() => {
    console.log("📧 USEEFFECT ESPECÍFICO - emailEnviado mudou para:", emailEnviado)
    adicionarDebugLog("USEEFFECT_EMAIL", {
      novoValor: emailEnviado,
      tipo: typeof emailEnviado,
    })
  }, [emailEnviado])

  // EFEITO ESPECÍFICO PARA statusVerificado
  useEffect(() => {
    console.log("🔍 USEEFFECT ESPECÍFICO - statusVerificado mudou para:", statusVerificado)
    adicionarDebugLog("USEEFFECT_STATUS", {
      novoValor: statusVerificado,
      tipo: typeof statusVerificado,
    })
  }, [statusVerificado])

  // DADOS PARA O STEP8
  const data = methods.getValues()
  const linkProposta = `${typeof window !== "undefined" ? window.location.origin : "https://contratandoplanos.com.br"}/proposta-digital/completar/${propostaId}`

  console.log("🎯 RENDERIZAÇÃO DO WIZARD:")
  console.log("   currentStep:", currentStep)
  console.log("   propostaId:", propostaId)
  console.log("   emailEnviado:", emailEnviado)
  console.log("   statusVerificado:", statusVerificado)
  console.log("   isSubmitting:", isSubmitting)

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-6xl mx-auto shadow-lg border-0 bg-white">
          {/* Header de Debug */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
            <h1 className="text-2xl font-bold">🔧 Debug - Status do Envio de Email</h1>
            <p className="text-sm opacity-90">Análise detalhada da comunicação entre Wizard e Step8</p>
          </div>

          {/* Controles de Debug */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex gap-4 mb-4">
              <Button onClick={simularEnvioProposta} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Simulando..." : "🚀 Simular Envio de Proposta"}
              </Button>

              <Button
                onClick={() => {
                  const novoValor = !emailEnviado
                  console.log(`🔄 TOGGLE EMAIL - Mudando de ${emailEnviado} para ${novoValor}`)
                  setEmailEnviado(novoValor)
                  adicionarDebugLog("TOGGLE_EMAIL", {
                    valorAnterior: emailEnviado,
                    novoValor: novoValor,
                  })
                }}
                variant="outline"
              >
                Toggle Email: {emailEnviado ? "✅" : "❌"}
              </Button>

              <Button
                onClick={() => {
                  const novoValor = !statusVerificado
                  console.log(`🔄 TOGGLE STATUS - Mudando de ${statusVerificado} para ${novoValor}`)
                  setStatusVerificado(novoValor)
                  adicionarDebugLog("TOGGLE_STATUS", {
                    valorAnterior: statusVerificado,
                    novoValor: novoValor,
                  })
                }}
                variant="outline"
              >
                Toggle Status: {statusVerificado ? "✅" : "❌"}
              </Button>

              <Button
                onClick={() => {
                  const novoId = `prop_manual_${Date.now()}`
                  console.log(`🔄 GERAR ID - Novo ID: ${novoId}`)
                  setPropostaId(novoId)
                  adicionarDebugLog("GERAR_ID", { novoId })
                }}
                variant="outline"
              >
                Gerar ID
              </Button>
            </div>

            {/* Estados Atuais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-sm">📧 Email Enviado</h3>
                <p className="text-2xl font-bold text-center mt-2">{emailEnviado ? "✅ TRUE" : "❌ FALSE"}</p>
                <p className="text-xs text-gray-500 text-center">Tipo: {typeof emailEnviado}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-sm">🔍 Status Verificado</h3>
                <p className="text-2xl font-bold text-center mt-2">{statusVerificado ? "✅ TRUE" : "❌ FALSE"}</p>
                <p className="text-xs text-gray-500 text-center">Tipo: {typeof statusVerificado}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-sm">🆔 Proposta ID</h3>
                <p className="text-sm font-mono text-center mt-2 break-all">{propostaId || "Não definido"}</p>
                <p className="text-xs text-gray-500 text-center">Tipo: {typeof propostaId}</p>
              </div>
            </div>
          </div>

          {/* Step8 com Props Explícitas */}
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">📋 Step8 Confirmation (Props Explícitas)</h2>

            {/* Debug das Props */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">🔍 Props sendo passadas para Step8:</h3>
              <div className="text-sm text-yellow-700 space-y-1 font-mono">
                <p>
                  <strong>propostaId:</strong> "{propostaId}" (tipo: {typeof propostaId})
                </p>
                <p>
                  <strong>emailEnviado:</strong> {String(emailEnviado)} (tipo: {typeof emailEnviado})
                </p>
                <p>
                  <strong>statusVerificado:</strong> {String(statusVerificado)} (tipo: {typeof statusVerificado})
                </p>
                <p>
                  <strong>nomeCliente:</strong> "{data.nome}" (tipo: {typeof data.nome})
                </p>
                <p>
                  <strong>emailCliente:</strong> "{data.email}" (tipo: {typeof data.email})
                </p>
                <p>
                  <strong>linkProposta:</strong> "{linkProposta}"
                </p>
              </div>
            </div>

            {/* Renderizar Step8 */}
            <Step8ConfirmationDebug
              propostaId={propostaId || ""}
              nomeCliente={data.nome}
              emailCliente={data.email}
              telefoneCliente={data.telefone}
              nomeCorretor={data.corretor_nome}
              linkProposta={linkProposta}
              emailEnviado={emailEnviado}
              statusVerificado={statusVerificado}
              onEnviarEmail={enviarEmailManual}
            />
          </div>

          {/* Logs de Debug */}
          <div className="p-6 border-t bg-gray-50">
            <h3 className="font-semibold mb-4">📋 Logs de Debug ({debugInfo.length} entradas)</h3>
            <div className="bg-black text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-xs">
              {debugInfo.length === 0 ? (
                <p className="text-gray-500">Nenhum log ainda. Clique em "Simular Envio" para começar.</p>
              ) : (
                debugInfo.map((log, index) => (
                  <div key={index} className="mb-2 border-b border-gray-700 pb-2">
                    <div className="text-yellow-400 font-bold">
                      [{log.timestamp}] {log.etapa}
                    </div>
                    <pre className="text-green-400 whitespace-pre-wrap text-xs mt-1">{log.dados}</pre>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  setDebugInfo([])
                  console.clear()
                }}
                size="sm"
                variant="outline"
              >
                🗑️ Limpar Logs
              </Button>

              <Button
                onClick={() => {
                  const logsText = debugInfo
                    .map((log) => `[${log.timestamp}] ${log.etapa}\n${log.dados}\n---`)
                    .join("\n")
                  navigator.clipboard.writeText(logsText)
                  toast.success("Logs copiados!")
                }}
                size="sm"
                variant="outline"
              >
                📋 Copiar Logs
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </FormProvider>
  )
}
