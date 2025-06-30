"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Mail, User, FileText, Clock, AlertCircle, RefreshCw } from "lucide-react"

interface Step8ConfirmationProps {
  emailEnviado: boolean
  statusVerificado: boolean
  propostaId: string | null
  nomeCliente: string
  emailCliente: string
}

export default function Step8Confirmation({
  emailEnviado,
  statusVerificado,
  propostaId,
  nomeCliente,
  emailCliente,
}: Step8ConfirmationProps) {
  // Estados internos para controle
  const [statusEmailAtual, setStatusEmailAtual] = useState(false)
  const [verificacaoCompleta, setVerificacaoCompleta] = useState(false)
  const [tentativasVerificacao, setTentativasVerificacao] = useState(0)

  // Logs detalhados para debug
  useEffect(() => {
    console.log("📧 STEP8 - Props recebidas:")
    console.log(`   emailEnviado: ${emailEnviado} (${typeof emailEnviado})`)
    console.log(`   statusVerificado: ${statusVerificado} (${typeof statusVerificado})`)
    console.log(`   propostaId: ${propostaId}`)
    console.log(`   nomeCliente: ${nomeCliente}`)
    console.log(`   emailCliente: ${emailCliente}`)
    console.log(`   Timestamp: ${new Date().toISOString()}`)
  }, [emailEnviado, statusVerificado, propostaId, nomeCliente, emailCliente])

  // Sincronizar estados internos com as props
  useEffect(() => {
    console.log("🔄 STEP8 - Sincronizando estados internos...")
    console.log(`   emailEnviado prop: ${emailEnviado}`)
    console.log(`   statusVerificado prop: ${statusVerificado}`)

    // Atualizar estados internos baseado nas props
    setStatusEmailAtual(emailEnviado)
    setVerificacaoCompleta(statusVerificado)

    console.log(`   statusEmailAtual atualizado para: ${emailEnviado}`)
    console.log(`   verificacaoCompleta atualizado para: ${statusVerificado}`)
  }, [emailEnviado, statusVerificado])

  // Função para recarregar a página
  const recarregarPagina = () => {
    window.location.reload()
  }

  // Função para criar nova proposta
  const criarNovaProposta = () => {
    window.location.href = "/proposta-digital"
  }

  // Status do email baseado nos estados internos
  const emailFoiEnviado = statusEmailAtual && verificacaoCompleta

  console.log("🎯 STEP8 - Status final calculado:")
  console.log(`   statusEmailAtual: ${statusEmailAtual}`)
  console.log(`   verificacaoCompleta: ${verificacaoCompleta}`)
  console.log(`   emailFoiEnviado: ${emailFoiEnviado}`)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Card principal de confirmação */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {emailFoiEnviado ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <Clock className="w-16 h-16 text-yellow-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {emailFoiEnviado ? "Proposta Enviada com Sucesso!" : "Processando Proposta..."}
          </CardTitle>
          <CardDescription className="text-lg">
            {emailFoiEnviado
              ? "Sua proposta foi criada e o email de validação foi enviado."
              : "Aguarde enquanto processamos sua proposta e enviamos o email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nome:</span>
                <p className="text-muted-foreground">{nomeCliente || "Não informado"}</p>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <p className="text-muted-foreground">{emailCliente || "Não informado"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status da proposta */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Status da Proposta
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>ID da Proposta:</span>
                <Badge variant="outline" className="font-mono">
                  {propostaId ? propostaId.slice(0, 8) + "..." : "Gerando..."}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={emailFoiEnviado ? "default" : "secondary"}>
                  {emailFoiEnviado ? "Enviada" : "Processando"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status do email */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Status do Email
            </h3>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                {emailFoiEnviado ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium">{emailFoiEnviado ? "Email enviado com sucesso!" : "Enviando email..."}</p>
                  <p className="text-sm text-muted-foreground">
                    {emailFoiEnviado ? "Verifique sua caixa de entrada e spam" : "Aguarde o processamento"}
                  </p>
                </div>
              </div>
              <Badge variant={emailFoiEnviado ? "default" : "secondary"}>
                {emailFoiEnviado ? "Enviado" : "Processando"}
              </Badge>
            </div>
          </div>

          {/* Próximos passos */}
          {emailFoiEnviado && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Próximos Passos
                </h3>
                <div className="space-y-2 text-sm">
                  <p>✅ Verifique seu email (incluindo a pasta de spam)</p>
                  <p>✅ Clique no link recebido para completar a proposta</p>
                  <p>✅ Preencha as informações adicionais solicitadas</p>
                  <p>✅ Assine digitalmente sua proposta</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={recarregarPagina} className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Atualizar Status
            </Button>
            <Button onClick={criarNovaProposta} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Nova Proposta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Debug - Step8 Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-gray-600">
            <div>Props emailEnviado: {emailEnviado ? "✅ true" : "❌ false"}</div>
            <div>Props statusVerificado: {statusVerificado ? "✅ true" : "❌ false"}</div>
            <div>Estado statusEmailAtual: {statusEmailAtual ? "✅ true" : "❌ false"}</div>
            <div>Estado verificacaoCompleta: {verificacaoCompleta ? "✅ true" : "❌ false"}</div>
            <div>Resultado emailFoiEnviado: {emailFoiEnviado ? "✅ true" : "❌ false"}</div>
            <div>Proposta ID: {propostaId || "null"}</div>
            <div>Tentativas: {tentativasVerificacao}</div>
            <div>Timestamp: {new Date().toLocaleString()}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
