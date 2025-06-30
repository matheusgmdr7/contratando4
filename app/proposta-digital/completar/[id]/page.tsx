"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Info,
  Heart,
  ArrowRight,
  ArrowLeft,
  PenTool,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import Step5HealthQuestionnaire from "@/components/proposta-digital/steps/step5-health-questionnaire"
import Step7Signature from "@/components/proposta-digital/steps/step7-signature"
import { useForm, FormProvider } from "react-hook-form"
import { salvarQuestionarioSaude } from "@/services/questionario-service"

interface Proposta {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  data_nascimento: string
  endereco: string
  cep: string
  cidade: string
  estado: string
  produto_nome?: string
  sigla_plano?: string
  valor_total: number
  quantidade_dependentes?: number
  dependentes_dados?: any[]
  observacoes?: string
  caracteristicas_plano?: string
  observacao?: string
  produto_descricao?: string
  status: string
  created_at: string
  assinado_em?: string
  assinatura_imagem?: string
  assinatura?: string
  questionario_completo?: boolean
  ip_assinatura?: string
  user_agent?: string
  status_assinatura?: string
  tem_dependentes?: boolean
  cobertura?: string
  acomodacao?: string
  valor?: string
  valor_mensal?: string
  corretor_id?: string
}

const ETAPAS = [
  { id: 1, nome: "Dados do Titular", descricao: "Informações pessoais", icon: User },
  { id: 2, nome: "Dependentes", descricao: "Dados dos dependentes", icon: Users },
  { id: 3, nome: "Informações do Plano", descricao: "Detalhes do plano escolhido", icon: FileText },
  { id: 4, nome: "Questionário de Saúde", descricao: "Declaração de saúde", icon: Heart },
  { id: 5, nome: "Assinatura Digital", descricao: "Finalização da proposta", icon: PenTool },
]

export default function CompletarPropostaPage() {
  const params = useParams()
  const router = useRouter()
  const propostaId = params.id as string

  const [proposta, setProposta] = useState<Proposta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFinalizando, setIsFinalizando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [formData, setFormData] = useState<any>({
    assinatura_imagem: "",
    declaracao_veracidade: false,
  })

  const methods = useForm({
    defaultValues: {
      questionario_saude: {},
      assinatura: "",
      dependentes: [],
    },
  })

  const obterCaracteristicasPlano = (proposta: Proposta): string => {
    if (proposta.produto_descricao?.trim()) return proposta.produto_descricao.trim()
    if (proposta.observacoes?.trim()) return proposta.observacoes.trim()
    return "Informações do plano não disponíveis"
  }

  const formatarDataNascimento = (dataString: string): string => {
    try {
      if (dataString.includes("-") && dataString.length === 10) {
        const [ano, mes, dia] = dataString.split("-")
        return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${ano}`
      }

      const data = new Date(dataString)
      if (isNaN(data.getTime())) {
        return dataString
      }

      data.setDate(data.getDate() + 1)
      return data.toLocaleDateString("pt-BR")
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return dataString
    }
  }

  const carregarProposta = async () => {
    try {
      console.log("Carregando proposta:", propostaId)
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("propostas")
        .select(`
          id,
          nome,
          email,
          telefone,
          cpf,
          data_nascimento,
          endereco,
          cep,
          cidade,
          estado,
          produto_nome,
          sigla_plano,
          valor_total,
          quantidade_dependentes,
          dependentes_dados,
          produto_descricao,
          observacoes,
          status,
          created_at,
          assinado_em,
          assinatura_imagem,
          assinatura,
          questionario_completo,
          ip_assinatura,
          user_agent,
          status_assinatura,
          tem_dependentes,
          cobertura,
          acomodacao,
          valor_mensal,
          corretor_id
        `)
        .eq("id", propostaId)
        .single()

      if (error) {
        console.error("Erro ao carregar proposta:", error)
        throw new Error(`Erro ao carregar proposta: ${error.message}`)
      }

      if (!data) {
        throw new Error("Proposta não encontrada")
      }

      console.log("Proposta carregada:", data)
      setProposta(data)

      methods.setValue("dependentes", data.dependentes_dados || [])

      // Determinar etapa inicial baseado no progresso
      if (data.status_assinatura === "assinada") {
        setEtapaAtual(5) // Já finalizada
      } else if (data.questionario_completo) {
        setEtapaAtual(5) // Ir para assinatura
      } else {
        setEtapaAtual(1) // Começar do início
      }
    } catch (error) {
      console.error("Erro ao carregar proposta:", error)
      setError(error.message || "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const salvarQuestionarioSaudeHandler = async (questionarioData: any) => {
    if (!proposta) return false

    try {
      console.log("Salvando questionário de saúde...")

      await salvarQuestionarioSaude(proposta.id, questionarioData, proposta.dependentes_dados || [])

      const { error: updateError } = await supabase
        .from("propostas")
        .update({ questionario_completo: true })
        .eq("id", proposta.id)

      if (updateError) {
        console.error("Erro ao atualizar proposta:", updateError)
        throw new Error(`Erro ao atualizar proposta: ${updateError.message}`)
      }

      return true
    } catch (error) {
      console.error("Erro ao salvar questionário:", error)
      toast.error(`Erro ao salvar questionário: ${error.message}`)
      return false
    }
  }

  const finalizarProposta = async () => {
    if (!proposta) return

    try {
      console.log("Iniciando finalização da proposta:", proposta.id)
      setIsFinalizando(true)

      const userAgent = navigator.userAgent
      const ipAddress = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => "Não disponível")

      const assinatura = formData.assinatura_imagem

      if (!assinatura) {
        toast.error("Assinatura é obrigatória para finalizar a proposta")
        return
      }

      const { error: updateError } = await supabase
        .from("propostas")
        .update({
          status: "finalizada",
          status_assinatura: "assinada",
          assinado_em: new Date().toISOString(),
          assinatura: assinatura,
          assinatura_imagem: assinatura,
          ip_assinatura: ipAddress,
          user_agent: userAgent,
        })
        .eq("id", proposta.id)

      if (updateError) {
        console.error("Erro ao atualizar proposta:", updateError)
        throw new Error(`Erro ao finalizar proposta: ${updateError.message}`)
      }

      console.log("Proposta finalizada com sucesso")
      toast.success("Proposta finalizada com sucesso!")
      router.push(`/proposta-digital/sucesso?id=${proposta.id}`)
    } catch (error) {
      console.error("Erro ao finalizar proposta:", error)
      toast.error(`Erro ao finalizar proposta: ${error.message || "Erro desconhecido"}`)
    } finally {
      setIsFinalizando(false)
    }
  }

  const proximaEtapa = async () => {
    if (etapaAtual === 4) {
      // Salvar questionário de saúde
      const questionarioData = methods.getValues("questionario_saude")
      const sucesso = await salvarQuestionarioSaudeHandler(questionarioData)
      if (!sucesso) return
    }

    if (etapaAtual < ETAPAS.length) {
      setEtapaAtual(etapaAtual + 1)
    }
  }

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1)
    }
  }

  // Função para atualizar formData
  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  useEffect(() => {
    carregarProposta()
  }, [propostaId])

  // Atualizar formData quando proposta for carregada
  useEffect(() => {
    if (proposta) {
      setFormData({
        assinatura_imagem: proposta.assinatura_imagem || "",
        declaracao_veracidade: proposta.status_assinatura === "assinada",
      })
    }
  }, [proposta])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando proposta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!proposta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Proposta não encontrada.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const caracteristicasPlano = obterCaracteristicasPlano(proposta)
  const progressoAtual = (etapaAtual / ETAPAS.length) * 100
  const etapaAtualData = ETAPAS[etapaAtual - 1]
  const Icon = etapaAtualData.icon

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finalizar Proposta</h1>
                <p className="text-gray-600">Complete os dados para finalizar sua proposta de plano de saúde</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Proposta</p>
                <p className="font-mono text-sm">{propostaId.slice(0, 8)}...</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progressoAtual)}% completo</span>
              </div>
              <Progress value={progressoAtual} className="h-2" />
            </div>

            {/* Current Step */}
            <div className="flex items-center justify-center mt-6">
              <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    Etapa {etapaAtual} de {ETAPAS.length}
                  </p>
                  <p className="text-sm text-blue-700">{etapaAtualData.nome}</p>
                </div>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="flex justify-center mt-6 overflow-x-auto">
              <div className="flex space-x-2">
                {ETAPAS.map((etapa, index) => {
                  const StepIcon = etapa.icon
                  const isActive = etapa.id === etapaAtual
                  const isCompleted = etapa.id < etapaAtual

                  return (
                    <div key={etapa.id} className="flex flex-col items-center min-w-0">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          isActive
                            ? "border-blue-600 bg-blue-600 text-white"
                            : isCompleted
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                      </div>
                      <span
                        className={`mt-1 text-xs font-medium text-center ${
                          isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {etapa.nome}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Etapa 1: Dados do Titular */}
          {etapaAtual === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Titular
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="font-medium">{proposta.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{proposta.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p className="font-medium">{proposta.telefone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPF</p>
                    <p className="font-medium">{proposta.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">{formatarDataNascimento(proposta.data_nascimento)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cidade/Estado</p>
                    <p className="font-medium">
                      {proposta.cidade}/{proposta.estado}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Endereço Completo</p>
                  <p className="font-medium">{proposta.endereco}</p>
                  <p className="text-sm text-muted-foreground">CEP: {proposta.cep}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etapa 2: Dependentes */}
          {etapaAtual === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Dependentes ({proposta.quantidade_dependentes || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proposta.dependentes_dados &&
                Array.isArray(proposta.dependentes_dados) &&
                proposta.dependentes_dados.length > 0 ? (
                  <div className="space-y-4">
                    {proposta.dependentes_dados.map((dependente, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Dependente {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Nome</p>
                            <p className="font-medium">{dependente.nome || "Não informado"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Data de Nascimento</p>
                            <p className="font-medium">
                              {dependente.data_nascimento
                                ? formatarDataNascimento(dependente.data_nascimento)
                                : "Não informado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Parentesco</p>
                            <p className="font-medium">{dependente.parentesco || "Não informado"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum dependente cadastrado nesta proposta</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Etapa 3: Informações do Plano */}
          {etapaAtual === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plano</p>
                    <p className="font-medium">{proposta.produto_nome || proposta.sigla_plano || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Mensal</p>
                    <p className="font-medium text-lg text-green-600">
                      R$ {proposta.valor_total?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cobertura</p>
                    <p className="font-medium">{proposta.cobertura || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Acomodação</p>
                    <p className="font-medium">{proposta.acomodacao || "Não informado"}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4" />
                    <p className="text-sm font-medium text-muted-foreground">Características do Plano</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-line">{caracteristicasPlano}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etapa 4: Questionário de Saúde */}
          {etapaAtual === 4 && <Step5HealthQuestionnaire onNext={proximaEtapa} onBack={etapaAnterior} />}

          {/* Etapa 5: Assinatura Digital */}
          {etapaAtual === 5 && (
            <div className="space-y-6">
              <Step7Signature 
                onNext={proximaEtapa}
                onPrev={etapaAnterior}
                formData={formData}
                updateFormData={updateFormData}
              />

              {/* Finalização */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                    <h2 className="text-2xl font-bold">Pronto para Finalizar</h2>
                    <p className="text-muted-foreground">
                      Todos os dados foram preenchidos. Clique no botão abaixo para finalizar sua proposta.
                    </p>
                    <Button
                      onClick={finalizarProposta}
                      disabled={isFinalizando || proposta.status === "finalizada"}
                      size="lg"
                      className="w-full md:w-auto"
                    >
                      {isFinalizando ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finalizando...
                        </>
                      ) : proposta.status === "finalizada" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Proposta Finalizada
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Finalizar Proposta
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navegação */}
          {etapaAtual < 5 && (
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={etapaAnterior} disabled={etapaAtual === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <Button onClick={proximaEtapa} disabled={etapaAtual === ETAPAS.length}>
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  )
}
