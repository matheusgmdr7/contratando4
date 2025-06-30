"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertTriangle, Copy, MessageCircle, ExternalLink, X } from "lucide-react"
import { toast } from "sonner"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    propostaId: string
    nomeCliente: string
    emailCliente: string
    whatsappCliente: string
    valorProposta: number
    emailEnviado: boolean
    linkProposta: string
    nomeCorretor: string
  }
}

export default function SuccessModal({ isOpen, onClose, data }: SuccessModalProps) {
  const [copied, setCopied] = useState(false)

  console.log("Modal - Dados recebidos:", data)
  console.log("Modal - Email enviado:", data.emailEnviado, typeof data.emailEnviado)
  console.log("Modal - Conversão Boolean:", Boolean(data.emailEnviado))

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Link copiado para a área de transferência")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Erro ao copiar link")
    }
  }

  const openWhatsApp = () => {
    const message = `Olá ${data.nomeCliente}! Sua proposta de plano de saúde foi criada com sucesso. Para finalizar o processo, acesse o link: ${data.linkProposta}`
    const whatsappUrl = `https://wa.me/${data.whatsappCliente.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const openLink = () => {
    window.open(data.linkProposta, "_blank")
  }

  const emailStatus = Boolean(data.emailEnviado)
  console.log("Modal - Status final do email:", emailStatus)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <DialogTitle className="text-2xl font-bold text-green-700">Proposta Criada</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status do Email */}
          <Card className={emailStatus ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                {emailStatus ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${emailStatus ? "text-green-800" : "text-orange-800"}`}>
                    {emailStatus ? "Email enviado automaticamente" : "Email não foi enviado automaticamente"}
                  </h3>
                  <p className={`text-sm mt-1 ${emailStatus ? "text-green-700" : "text-orange-700"}`}>
                    {emailStatus
                      ? `Link da proposta enviado para ${data.emailCliente}`
                      : `Você precisará enviar o link manualmente para ${data.emailCliente}`}
                  </p>
                  {!emailStatus && (
                    <p className="text-xs text-orange-600 mt-2">
                      Use os botões abaixo para enviar via WhatsApp ou copiar o link
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Proposta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cliente</p>
                    <p className="font-semibold">{data.nomeCliente}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-sm">{data.emailCliente}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">WhatsApp</p>
                    <p className="text-sm">{data.whatsappCliente}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ID da Proposta</p>
                    <p className="font-mono text-sm">{data.propostaId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {data.valorProposta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Corretor</p>
                    <p className="text-sm">{data.nomeCorretor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Link da Proposta */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Link da Proposta</h3>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <code className="flex-1 text-sm text-gray-700 break-all">{data.linkProposta}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(data.linkProposta)}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Ações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={openWhatsApp} className="w-full" variant="default">
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar via WhatsApp
            </Button>
            <Button onClick={openLink} className="w-full bg-transparent" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Link da Proposta
            </Button>
          </div>

          {/* Próximos Passos */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-blue-800 mb-2">Próximos Passos</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. O cliente receberá o link para completar a proposta</li>
                <li>2. Ele preencherá a declaração de saúde</li>
                <li>3. Assinará digitalmente a proposta</li>
                <li>4. A proposta será finalizada automaticamente</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
