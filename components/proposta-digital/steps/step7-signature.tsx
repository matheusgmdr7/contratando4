"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PenTool, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react"

export default function Step7Signature() {
  const { setValue, watch } = useFormContext()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false)

  const proposta = watch()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Limpar canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)

    let x, y
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

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

    let x, y
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)

    if (hasSignature) {
      const canvas = canvasRef.current
      if (!canvas) return

      const signatureData = canvas.toDataURL("image/png")
      setValue("assinatura", signatureData)
      setValue("assinado_em", new Date().toISOString())
      setValue("ip_assinatura", "127.0.0.1") // Em produção, capturar IP real
      setValue("user_agent", navigator.userAgent)
      setValue("status_assinatura", "assinado")
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setValue("assinatura", "")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <PenTool className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Assinatura Digital</h2>
        </div>
        <p className="text-gray-600">Assine digitalmente para finalizar sua proposta</p>
      </div>

      {/* Canvas de assinatura */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Área de Assinatura</CardTitle>
          <CardDescription>Desenhe sua assinatura no espaço abaixo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-32 md:h-48 border border-gray-300 rounded bg-white cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={clearSignature} disabled={!hasSignature}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <p className="text-sm text-gray-500 self-center">
              {hasSignature ? "Assinatura capturada" : "Desenhe sua assinatura acima"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Declaração de veracidade */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Declaração de Veracidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="declaration"
              checked={acceptedDeclaration}
              onCheckedChange={(checked) => setAcceptedDeclaration(checked as boolean)}
            />
            <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
              <strong>Declaração de Veracidade:</strong> Declaro que todas as informações prestadas nesta proposta são
              verdadeiras e completas. Estou ciente de que a omissão ou falsidade de informações pode resultar na perda
              do direito à cobertura ou no cancelamento do contrato.
            </Label>
          </div>

          {/* Informação sobre assinatura digital */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Assinatura Digital:</strong> Sua assinatura digital tem a mesma validade jurídica de uma
              assinatura manuscrita, conforme a Lei 14.063/2020. Os dados desta proposta serão armazenados de forma
              segura e criptografada.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status de validação */}
      {hasSignature && acceptedDeclaration && (
        <Alert className="max-w-2xl mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pronto para finalizar!</strong> Todos os requisitos foram atendidos. Você pode prosseguir para
            finalizar sua proposta.
          </AlertDescription>
        </Alert>
      )}

      {/* Aviso final */}
      <Alert className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> Após finalizar, sua proposta será enviada para análise. Você receberá um e-mail de
          confirmação com os próximos passos.
        </AlertDescription>
      </Alert>
    </div>
  )
}
