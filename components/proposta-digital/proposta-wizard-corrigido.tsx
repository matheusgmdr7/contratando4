"use client"

import { useState, useCallback } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import Step1SelectTemplate from "./steps/step1-select-template"
import Step2PlanInfo from "./steps/step2-plan-info"
import Step3Dependents from "./steps/step3-dependents"
import Step4Documents from "./steps/step4-documents"
import Step5HealthQuestionnaire from "./steps/step5-health-questionnaire"
import Step6PdfPreview from "./steps/step6-pdf-preview"
import Step7Signature from "./steps/step7-signature"
import Step8Confirmation from "./steps/step8-confirmation"
import { validarCPF } from "@/utils/validacoes"
import { supabase } from "@/lib/supabase"

// Schema do formulário
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
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  endereco: z.string().min(5, "Endereço é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  cep: z.string().min(8, "CEP inválido"),
  profissao: z.string().min(2, "Profissão é obrigatória"),
  renda: z.string().min(1, "Renda é obrigatória"),
  plano_escolhido: z.string().optional(),
  valor_plano: z.string().optional(),
  dependentes: z.array(z.any()).optional(),
  documentos: z.array(z.any()).optional(),
  questionario_saude: z.array(z.any()).optional(),
  assinatura: z.string().min(1, "Assinatura é obrigatória"),
})

type FormValues = z.infer<typeof formSchema>

interface PropostaWizardCorrigidoProps {
  templates: any[]
  corretorPredefinido?: any
}

export default function PropostaWizardCorrigido({ templates, corretorPredefinido }: PropostaWizardCorrigidoProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🎯 CORREÇÃO CRÍTICA: Estados com callback para garantir sincronia
  const [propostaId, setPropostaId] = useState<string | null>(null)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [statusVerificado, setStatusVerificado] = useState(false)

  const router = useRouter()

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      corretor_nome: corretorPredefinido?.nome || "",
      corretor_id: corretorPredefinido?.id || "",
    },
    mode: "onChange",
  })

  // 🎯 FUNÇÃO CORRIGIDA PARA ENVIO DE EMAIL
  const enviarEmailProposta = useCallback(async (dadosProposta: any): Promise<boolean> => {
    try {
      console.log("📧 INICIANDO ENVIO DE EMAIL...")
      console.log("   Dados da proposta:", dadosProposta)

      const linkProposta = `${window.location.origin}/proposta-digital/completar/${dadosProposta.id}`

      const payload = {
        to: dadosProposta.email,
        subject: "Sua Proposta de Plano de Saúde",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Olá ${dadosProposta.nome}!</h2>
            <p>Sua proposta de plano de saúde foi criada com sucesso!</p>
            <p><strong>ID da Proposta:</strong> ${dadosProposta.id}</p>
            <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
              <p style="margin: 0;"><strong>Para completar sua proposta, clique no link abaixo:</strong></p>
              <a href="${linkProposta}" style="display: inline-block; margin-top: 10px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
                Completar Proposta
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
              <span style="word-break: break-all;">${linkProposta}</span>
            </p>
          </div>
        `,
      }

      console.log("📧 PAYLOAD DO EMAIL:", payload)

      const response = await fetch("/api/enviar-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("📧 RESPONSE STATUS:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ ERRO NA RESPOSTA:", errorText)
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("📧 RESULTADO DO ENVIO:", result)

      const sucesso = result.success === true
      console.log("📧 EMAIL ENVIADO COM SUCESSO:", sucesso)

      return sucesso
    } catch (error) {
      console.error("❌ ERRO NO ENVIO DE EMAIL:", error)
      return false
    }
  }, [])

  // 🎯 FUNÇÃO CORRIGIDA PARA SUBMISSÃO
  const onSubmit = useCallback(
    async (data: FormValues) => {
      try {
        setIsSubmitting(true)
        console.log("🚀 INICIANDO SUBMISSÃO...")

        // ETAPA 1: Criar proposta no banco
        console.log("💾 CRIANDO PROPOSTA NO BANCO...")
        const { data: novaProposta, error } = await supabase
          .from("propostas")
          .insert([
            {
              nome: data.nome,
              email: data.email,
              telefone: data.telefone,
              cpf: data.cpf,
              data_nascimento: data.data_nascimento,
              endereco: data.endereco,
              cidade: data.cidade,
              estado: data.estado,
              cep: data.cep,
              profissao: data.profissao,
              renda: data.renda,
              corretor_id: data.corretor_id,
              corretor_nome: data.corretor_nome,
              template_id: data.template_id,
              template_titulo: data.template_titulo,
              plano_escolhido: data.plano_escolhido,
              valor_plano: data.valor_plano,
              dependentes: data.dependentes || [],
              questionario_saude: data.questionario_saude || [],
              assinatura: data.assinatura,
              status: "pendente",
              email_enviado: false,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("❌ ERRO AO CRIAR PROPOSTA:", error)
          throw new Error("Erro ao criar proposta: " + error.message)
        }

        console.log("✅ PROPOSTA CRIADA:", novaProposta)

        // ETAPA 2: Definir ID da proposta IMEDIATAMENTE
        const idProposta = novaProposta.id
        console.log("🆔 ID DA PROPOSTA:", idProposta)

        // 🎯 CORREÇÃO CRÍTICA: Usar callback para garantir que o estado seja atualizado
        setPropostaId(idProposta)

        // ETAPA 3: Enviar email
        console.log("📧 ENVIANDO EMAIL...")
        const emailFoiEnviado = await enviarEmailProposta({
          id: idProposta,
          nome: data.nome,
          email: data.email,
        })

        console.log("📧 RESULTADO DO ENVIO:", emailFoiEnviado)

        // ETAPA 4: Atualizar flag no banco
        if (emailFoiEnviado) {
          console.log("🔄 ATUALIZANDO FLAG NO BANCO...")
          const { error: updateError } = await supabase
            .from("propostas")
            .update({ email_enviado: true })
            .eq("id", idProposta)

          if (updateError) {
            console.error("❌ ERRO AO ATUALIZAR FLAG:", updateError)
          } else {
            console.log("✅ FLAG ATUALIZADA NO BANCO!")
          }
        }

        // 🎯 CORREÇÃO CRÍTICA: Usar setTimeout para garantir que os estados sejam atualizados
        setTimeout(() => {
          console.log("🔄 ATUALIZANDO ESTADOS...")
          setEmailEnviado(emailFoiEnviado)
          setStatusVerificado(true)

          console.log("📊 ESTADOS ATUALIZADOS:")
          console.log("   emailEnviado:", emailFoiEnviado)
          console.log("   statusVerificado: true")
          console.log("   propostaId:", idProposta)

          // ETAPA 5: Avançar para step 8
          console.log("➡️ AVANÇANDO PARA STEP 8...")
          setCurrentStep(8)

          // ETAPA 6: Toast de sucesso
          console.log("🎉 MOSTRANDO TOAST DE SUCESSO...")
          toast.success("Proposta enviada com sucesso!")
        }, 100)
      } catch (error) {
        console.error("❌ ERRO NA SUBMISSÃO:", error)
        toast.error(`Erro ao enviar proposta: ${error.message}`)
      } finally {
        setIsSubmitting(false)
      }
    },
    [enviarEmailProposta],
  )

  // 🎯 FUNÇÃO PARA REENVIO DE EMAIL (para o Step8)
  const reenviarEmail = useCallback(async (): Promise<boolean> => {
    if (!propostaId) {
      console.error("❌ ID da proposta não disponível")
      return false
    }

    try {
      console.log("📧 REENVIANDO EMAIL...")
      const data = methods.getValues()

      const sucesso = await enviarEmailProposta({
        id: propostaId,
        nome: data.nome,
        email: data.email,
      })

      if (sucesso) {
        // Atualizar estados
        setEmailEnviado(true)
        setStatusVerificado(true)

        // Atualizar flag no banco
        await supabase.from("propostas").update({ email_enviado: true }).eq("id", propostaId)
      }

      return sucesso
    } catch (error) {
      console.error("❌ ERRO NO REENVIO:", error)
      return false
    }
  }, [propostaId, enviarEmailProposta, methods])

  // Navegação entre steps
  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Dados para o Step8
  const data = methods.getValues()
  const linkProposta = `${typeof window !== "undefined" ? window.location.origin : ""}/proposta-digital/completar/${propostaId}`

  console.log("🎯 RENDERIZAÇÃO DO WIZARD:")
  console.log("   currentStep:", currentStep)
  console.log("   propostaId:", propostaId)
  console.log("   emailEnviado:", emailEnviado)
  console.log("   statusVerificado:", statusVerificado)

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-white">
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Nova Proposta</h1>
              <span className="text-sm opacity-90">Etapa {currentStep} de 8</span>
            </div>
            <div className="w-full bg-blue-700 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps Content */}
          <div className="p-6">
            {currentStep === 1 && <Step1SelectTemplate templates={templates} onNext={nextStep} />}

            {currentStep === 2 && <Step2PlanInfo onNext={nextStep} onPrev={prevStep} />}

            {currentStep === 3 && <Step3Dependents onNext={nextStep} onPrev={prevStep} />}

            {currentStep === 4 && <Step4Documents onNext={nextStep} onPrev={prevStep} />}

            {currentStep === 5 && <Step5HealthQuestionnaire onNext={nextStep} onPrev={prevStep} />}

            {currentStep === 6 && <Step6PdfPreview onNext={nextStep} onPrev={prevStep} />}

            {currentStep === 7 && (
              <Step7Signature onNext={nextStep} onPrev={prevStep} onSubmit={onSubmit} isSubmitting={isSubmitting} />
            )}

            {currentStep === 8 && (
              <Step8Confirmation
                propostaId={propostaId || ""}
                nomeCliente={data.nome}
                emailCliente={data.email}
                telefoneCliente={data.telefone}
                nomeCorretor={data.corretor_nome}
                linkProposta={linkProposta}
                emailEnviado={emailEnviado}
                statusVerificado={statusVerificado}
                onEnviarEmail={reenviarEmail}
              />
            )}
          </div>
        </Card>
      </div>
    </FormProvider>
  )
}
