"use client"

import PropostaWizardDebug from "@/components/proposta-digital/proposta-wizard-debug"

export default function DebugPropostaWizardPage() {
  const templates = [
    {
      id: "template_1",
      titulo: "Modelo Básico",
      descricao: "Modelo padrão para propostas",
    },
    {
      id: "template_2",
      titulo: "Modelo Premium",
      descricao: "Modelo completo com todas as opções",
    },
  ]

  const corretorPredefinido = {
    id: "corretor_debug",
    nome: "Corretor Debug",
    email: "corretor@debug.com",
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PropostaWizardDebug templates={templates} corretorPredefinido={corretorPredefinido} />
    </div>
  )
}
