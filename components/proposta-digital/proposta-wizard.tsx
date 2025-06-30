"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Importar os steps
import Step1SelectTemplate from "./steps/step1-select-template"
import Step2PlanInfo from "./steps/step2-plan-info"
import Step3Dependents from "./steps/step3-dependents"
import Step4Documents from "./steps/step4-documents"
import Step5HealthQuestionnaire from "./steps/step5-health-questionnaire"
import Step6PdfPreview from "./steps/step6-pdf-preview"
import Step7Signature from "./steps/step7-signature"
import Step8Confirmation from "./steps/step8-confirmation"

// Importar serviços
import { criarPropostaUnificada } from "@/services/propostas-service-unificado"

interface PropostaWizardProps {
  corretor?: {
    id: number
    nome: string
    email: string
    whatsapp?: string
  }
}

export default function PropostaWizard({ corretor }: PropostaWizardProps) {
  // Estados principais
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [propostaId, setPropostaId] = useState<string | null>(null)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [statusVerificado, setStatusVerificado] = useState(false)

  // Estados dos dados do formulário
  const [formData, setFormData] = useState({
    // Step 1 - Template
    template_id: "",
    template_titulo: "",

    // Step 2 - Informações do plano
    produto_id: "",
    produto_nome: "",
    produto_descricao: "",
    produto_operadora: "",
    produto_tipo: "",
    tabela_id: "",
    segmentacao: "",
    valor_mensal: 0,
    valor_total: 0,

    // Dados pessoais
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    rg: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    cns: "",
    nome_mae: "",
    sexo: "",
    orgao_emissor: "",

    // Step 3 - Dependentes
    dependentes: [] as any[],

    // Step 4 - Documentos
    documentos: {} as any,

    // Step 5 - Questionário de saúde
    questionario_saude: {} as any,

    // Step 7 - Assinatura
    assinatura: "",
  })

  const totalSteps = 8
  const progress = (currentStep / totalSteps) * 100

  // Logs detalhados para debug
  useEffect(() => {
    console.log(`🔄 WIZARD - Mudança de estado detectada:`)
    console.log(`   Step atual: ${currentStep}`)
    console.log(`   Email enviado: ${emailEnviado}`)
    console.log(`   Status verificado: ${statusVerificado}`)
    console.log(`   Proposta ID: ${propostaId}`)
    console.log(`   Timestamp: ${new Date().toISOString()}`)
  }, [currentStep, emailEnviado, statusVerificado, propostaId])

  // Função para atualizar dados do formulário
  const updateFormData = useCallback((newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
  }, [])

  // Função para avançar step
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep, totalSteps])

  // Função para voltar step
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  // Função para finalizar proposta - CORRIGIDA
  const finalizarProposta = useCallback(async () => {
    try {
      console.log("🚀 INICIANDO FINALIZAÇÃO DA PROPOSTA")
      console.log("=".repeat(50))

      setIsSubmitting(true)

      // Preparar dados para criação da proposta
      const dadosProposta = {
        ...formData,
        ...(corretor?.id ? { corretor_id: corretor.id, corretor_nome: corretor.nome } : {}),
        status: "parcial",
        data: new Date().toISOString(),
      }

      console.log("📋 Dados da proposta preparados:")
      console.log(JSON.stringify(dadosProposta, null, 2))

      // Criar/atualizar proposta
      console.log("💾 Criando proposta no banco...")
      const resultado = await criarPropostaUnificada(dadosProposta)

      if (!resultado.sucesso || !resultado.id) {
        throw new Error(resultado.erro || "Erro ao criar proposta")
      }

      console.log(`✅ Proposta criada com ID: ${resultado.id}`)

      // Definir ID da proposta IMEDIATAMENTE
      setPropostaId(resultado.id)

      // Enviar email via API route
      console.log("📧 Enviando email via API...")
      const emailResponse = await fetch("/api/enviar-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          nome: formData.nome,
          propostaId: resultado.id,
          corretor: corretor?.nome || "Sistema",
        }),
      })

      const emailResult = await emailResponse.json()
      console.log("📧 Resultado do envio de email:", emailResult)

      if (!emailResult.sucesso) {
        console.warn("⚠️ Falha no envio de email:", emailResult.erro)
        toast.error("Proposta criada, mas houve problema no envio do email")
      } else {
        console.log("✅ Email enviado com sucesso!")
        toast.success("Proposta enviada com sucesso!")
      }

      // Atualizar estados com delay para garantir sincronia
      setTimeout(() => {
        console.log("🔄 Atualizando estados após delay...")
        setEmailEnviado(emailResult.sucesso || false)
        setStatusVerificado(true)

        // Avançar para o step final
        setCurrentStep(8)

        console.log("✅ Estados atualizados e step avançado")
      }, 300)
    } catch (error) {
      console.error("❌ Erro na finalização:", error)
      toast.error("Erro ao finalizar proposta: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, corretor])

  // Renderizar step atual
  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      nextStep,
      prevStep,
      corretor,
    }

    switch (currentStep) {
      case 1:
        return <Step1SelectTemplate {...stepProps} />
      case 2:
        return <Step2PlanInfo {...stepProps} />
      case 3:
        return <Step3Dependents {...stepProps} />
      case 4:
        return <Step4Documents {...stepProps} />
      case 5:
        return <Step5HealthQuestionnaire {...stepProps} />
      case 6:
        return <Step6PdfPreview {...stepProps} />
      case 7:
        return <Step7Signature {...stepProps} onFinalize={finalizarProposta} isSubmitting={isSubmitting} />
      case 8:
        return (
          <Step8Confirmation
            emailEnviado={emailEnviado}
            statusVerificado={statusVerificado}
            propostaId={propostaId}
            nomeCliente={formData.nome}
            emailCliente={formData.email}
          />
        )
      default:
        return <div>Step não encontrado</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header com progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Proposta Digital - Step {currentStep} de {totalSteps}
            </span>
            {corretor && <span className="text-sm font-normal text-muted-foreground">Corretor: {corretor.nome}</span>}
          </CardTitle>
          <CardDescription>Complete todos os passos para finalizar sua proposta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do step atual */}
      <div className="min-h-[600px]">{renderCurrentStep()}</div>

      {/* Navegação (apenas para steps 1-6) */}
      {currentStep <= 6 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button onClick={nextStep} disabled={currentStep === totalSteps} className="flex items-center gap-2">
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>
              Step: {currentStep}/{totalSteps}
            </div>
            <div>Email Enviado: {emailEnviado ? "✅" : "❌"}</div>
            <div>Status Verificado: {statusVerificado ? "✅" : "❌"}</div>
            <div>Proposta ID: {propostaId || "Não definido"}</div>
            <div>Submitting: {isSubmitting ? "✅" : "❌"}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
