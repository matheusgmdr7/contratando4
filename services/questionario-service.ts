import { supabase } from "@/lib/supabase"

interface QuestionarioCompleto {
  [pessoaIndex: number]: {
    peso?: string
    altura?: string
    respostas: Record<number, { resposta: string; observacao?: string }>
  }
}

interface Dependente {
  nome: string
  cpf?: string
  data_nascimento?: string
  parentesco?: string
}

export async function salvarQuestionarioSaude(
  propostaId: string,
  questionarioCompleto: QuestionarioCompleto,
  dependentes: Dependente[] = [],
): Promise<void> {
  console.log("💾 Salvando questionário de saúde...")
  console.log("📋 Dados recebidos:", { propostaId, questionarioCompleto, dependentes })

  try {
    // Processar cada pessoa (titular + dependentes)
    for (const [pessoaIndex, dadosPessoa] of Object.entries(questionarioCompleto)) {
      const index = Number.parseInt(pessoaIndex)
      const pessoaTipo = index === 0 ? "titular" : "dependente"
      const pessoaNome = index === 0 ? "Titular" : dependentes[index - 1]?.nome || `Dependente ${index}`

      console.log(`👤 Processando ${pessoaTipo}: ${pessoaNome}`)

      // 1. Salvar dados básicos na tabela questionario_respostas
      const dadosBasicos = {
        proposta_id: propostaId,
        pessoa_tipo: pessoaTipo,
        pessoa_nome: pessoaNome,
        peso: dadosPessoa.peso || null,
        altura: dadosPessoa.altura || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("📝 Dados básicos preparados:", dadosBasicos)

      // Verificar se já existe registro
      const { data: existingRecord, error: checkError } = await supabase
        .from("questionario_respostas")
        .select("id")
        .eq("proposta_id", propostaId)
        .eq("pessoa_tipo", pessoaTipo)
        .maybeSingle()

      if (checkError) {
        console.error("❌ Erro ao verificar registro existente:", checkError)
        // Continuar mesmo com erro de verificação
      }

      let questionarioId: string

      if (existingRecord) {
        console.log("🔄 Atualizando registro existente...")
        const { data: updatedRecord, error: updateError } = await supabase
          .from("questionario_respostas")
          .update(dadosBasicos)
          .eq("id", existingRecord.id)
          .select("id")
          .single()

        if (updateError) {
          console.error("❌ Erro ao atualizar registro:", updateError)
          throw new Error(`Erro ao atualizar questionário de ${pessoaNome}: ${updateError.message}`)
        }

        questionarioId = updatedRecord.id
        console.log("✅ Registro atualizado com ID:", questionarioId)
      } else {
        console.log("➕ Inserindo novo registro...")
        const { data: newRecord, error: insertError } = await supabase
          .from("questionario_respostas")
          .insert(dadosBasicos)
          .select("id")
          .single()

        if (insertError) {
          console.error("❌ Erro ao inserir registro:", insertError)
          throw new Error(`Erro ao salvar questionário de ${pessoaNome}: ${insertError.message}`)
        }

        questionarioId = newRecord.id
        console.log("✅ Novo registro criado com ID:", questionarioId)
      }

      // 2. Salvar respostas individuais na tabela respostas_questionario
      if (dadosPessoa.respostas && Object.keys(dadosPessoa.respostas).length > 0) {
        console.log("📝 Salvando respostas individuais...")

        for (const [perguntaId, dadosResposta] of Object.entries(dadosPessoa.respostas)) {
          const respostaData = {
            questionario_id: questionarioId,
            pergunta_id: Number.parseInt(perguntaId),
            resposta: dadosResposta.resposta,
            observacao: dadosResposta.observacao || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Verificar se já existe resposta para esta pergunta
          const { data: existingAnswer, error: checkAnswerError } = await supabase
            .from("respostas_questionario")
            .select("id")
            .eq("questionario_id", questionarioId)
            .eq("pergunta_id", Number.parseInt(perguntaId))
            .maybeSingle()

          if (checkAnswerError) {
            console.warn("⚠️ Erro ao verificar resposta existente:", checkAnswerError)
          }

          if (existingAnswer) {
            // Atualizar resposta existente
            const { error: updateAnswerError } = await supabase
              .from("respostas_questionario")
              .update(respostaData)
              .eq("id", existingAnswer.id)

            if (updateAnswerError) {
              console.error(`❌ Erro ao atualizar resposta ${perguntaId}:`, updateAnswerError)
            } else {
              console.log(`✅ Resposta ${perguntaId} atualizada`)
            }
          } else {
            // Inserir nova resposta
            const { error: insertAnswerError } = await supabase.from("respostas_questionario").insert(respostaData)

            if (insertAnswerError) {
              console.error(`❌ Erro ao inserir resposta ${perguntaId}:`, insertAnswerError)
            } else {
              console.log(`✅ Resposta ${perguntaId} inserida`)
            }
          }
        }
      }
    }

    console.log("🎉 Questionário de saúde salvo com sucesso!")
  } catch (error) {
    console.error("❌ Erro ao salvar questionário:", error)
    throw error
  }
}

export async function buscarQuestionarioSaude(propostaId: string): Promise<QuestionarioCompleto | null> {
  try {
    console.log("🔍 Buscando questionário de saúde para proposta:", propostaId)

    // Buscar dados básicos
    const { data: questionarios, error: questionariosError } = await supabase
      .from("questionario_respostas")
      .select("*")
      .eq("proposta_id", propostaId)

    if (questionariosError) {
      console.error("❌ Erro ao buscar questionários:", questionariosError)
      return null
    }

    if (!questionarios || questionarios.length === 0) {
      console.log("ℹ️ Nenhum questionário encontrado")
      return null
    }

    const resultado: QuestionarioCompleto = {}

    // Para cada questionário, buscar as respostas
    for (const questionario of questionarios) {
      const pessoaIndex =
        questionario.pessoa_tipo === "titular" ? 0 : Number.parseInt(questionario.pessoa_nome.split(" ")[1]) || 1

      // Buscar respostas
      const { data: respostas, error: respostasError } = await supabase
        .from("respostas_questionario")
        .select("*")
        .eq("questionario_id", questionario.id)

      if (respostasError) {
        console.error("❌ Erro ao buscar respostas:", respostasError)
        continue
      }

      // Organizar respostas
      const respostasOrganizadas: Record<number, { resposta: string; observacao?: string }> = {}

      if (respostas) {
        for (const resposta of respostas) {
          respostasOrganizadas[resposta.pergunta_id] = {
            resposta: resposta.resposta,
            observacao: resposta.observacao || "",
          }
        }
      }

      resultado[pessoaIndex] = {
        peso: questionario.peso || "",
        altura: questionario.altura || "",
        respostas: respostasOrganizadas,
      }
    }

    console.log("✅ Questionário carregado:", resultado)
    return resultado
  } catch (error) {
    console.error("❌ Erro ao buscar questionário:", error)
    return null
  }
}
