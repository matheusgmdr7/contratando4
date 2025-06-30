"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, PenTool, RotateCcw, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Step7SignatureProps {
  onNext: () => void
  onPrev: () => void
  formData: any
  updateFormData: (data: any) => void
}

export default function Step7Signature({ onNext, onPrev, formData, updateFormData }: Step7SignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [declaracaoAceita, setDeclaracaoAceita] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas
    canvas.width = canvas.offsetWidth
    canvas.height = 200

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Limpar canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Carregar assinatura existente se houver
    if (formData.assinatura_imagem) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasSignature(true)
      }
      img.src = formData.assinatura_imagem
    }

    if (formData.declaracao_veracidade) {
      setDeclaracaoAceita(true)
    }
  }, [formData.assinatura_imagem, formData.declaracao_veracidade])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)

    let clientX: number, clientY: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let clientX: number, clientY: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()

    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL("image/png")
    updateFormData({
      assinatura_imagem: dataURL,
      declaracao_veracidade: declaracaoAceita,
    })
  }

  const handleSubmit = async () => {
    if (!hasSignature) {
      toast.error("Por favor, assine no campo acima")
      return
    }

    if (!declaracaoAceita) {
      toast.error("Você deve aceitar a declaração de veracidade")
      return
    }

    setIsSubmitting(true)

    try {
      // Salvar assinatura
      saveSignature()

      // Aguardar um momento para garantir que os dados foram salvos
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast.success("Assinatura registrada com sucesso!")
      onNext()
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error)
      toast.error("Erro ao salvar assinatura. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Assinatura Digital
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Declaração de Veracidade */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Declaração de Veracidade</h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-700 leading-relaxed">
                Declaro que todas as informações prestadas nesta proposta são verdadeiras e completas. Estou ciente de
                que a omissão ou falsidade de informações pode resultar na perda do direito à cobertura ou no
                cancelamento do contrato. Autorizo a operadora a verificar as informações prestadas e a solicitar exames
                médicos complementares, se necessário.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="declaracao"
                checked={declaracaoAceita}
                onCheckedChange={(checked) => setDeclaracaoAceita(checked as boolean)}
              />
              <label
                htmlFor="declaracao"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Li e aceito a declaração de veracidade acima
              </label>
            </div>
          </div>

          {/* Campo de Assinatura */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sua Assinatura</h3>
              <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                className="w-full h-48 border border-gray-200 rounded cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Assine no campo acima usando o mouse ou toque na tela
              </p>
            </div>
          </div>

          {!hasSignature && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sua assinatura é obrigatória para finalizar a proposta. Por favor, assine no campo acima.
              </AlertDescription>
            </Alert>
          )}

          {/* Informações sobre Assinatura Digital */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Sobre a Assinatura Digital</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sua assinatura digital tem a mesma validade jurídica de uma assinatura manuscrita</li>
              <li>• Os dados são criptografados e armazenados com segurança</li>
              <li>• A assinatura será anexada ao documento final da proposta</li>
              <li>• Você receberá uma cópia da proposta assinada por email</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Navegação */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          Voltar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!hasSignature || !declaracaoAceita || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalizando...
            </>
          ) : (
            "Finalizar Proposta"
          )}
        </Button>
      </div>
    </div>
  )
}
