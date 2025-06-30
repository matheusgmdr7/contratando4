import { Suspense } from "react"
import PropostaWizardCorrigido from "@/components/proposta-digital/proposta-wizard-corrigido"
import { supabase } from "@/lib/supabase"

async function getTemplates() {
  try {
    const { data: templates, error } = await supabase
      .from("modelos_propostas")
      .select("*")
      .eq("ativo", true)
      .order("titulo")

    if (error) {
      console.error("Erro ao buscar templates:", error)
      return []
    }

    return templates || []
  } catch (error) {
    console.error("Erro ao buscar templates:", error)
    return []
  }
}

async function getCorretorPredefinido(searchParams: any) {
  const corretorId = searchParams?.corretor

  if (!corretorId) {
    return null
  }

  try {
    const { data: corretor, error } = await supabase
      .from("corretores")
      .select("id, nome, email")
      .eq("id", corretorId)
      .eq("ativo", true)
      .single()

    if (error) {
      console.error("Erro ao buscar corretor:", error)
      return null
    }

    return corretor
  } catch (error) {
    console.error("Erro ao buscar corretor:", error)
    return null
  }
}

export default async function PropostaDigitalPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const templates = await getTemplates()
  const corretorPredefinido = await getCorretorPredefinido(searchParams)

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PropostaWizardCorrigido templates={templates} corretorPredefinido={corretorPredefinido} />
    </Suspense>
  )
}
