-- Verificar se a tabela questionario_respostas existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'questionario_respostas'
);

-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS questionario_respostas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposta_id UUID NOT NULL,
    pessoa_tipo VARCHAR(20) NOT NULL CHECK (pessoa_tipo IN ('titular', 'dependente')),
    pessoa_nome VARCHAR(255) NOT NULL,
    pessoa_index INTEGER NOT NULL DEFAULT 0,
    peso DECIMAL(5,2), -- peso em kg (ex: 70.50)
    altura INTEGER, -- altura em cm (ex: 175)
    pergunta_id INTEGER NOT NULL,
    pergunta_texto TEXT NOT NULL,
    resposta VARCHAR(10) NOT NULL CHECK (resposta IN ('sim', 'nao')),
    detalhes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_questionario_respostas_proposta_id ON questionario_respostas(proposta_id);
CREATE INDEX IF NOT EXISTS idx_questionario_respostas_pessoa_tipo ON questionario_respostas(pessoa_tipo);
CREATE INDEX IF NOT EXISTS idx_questionario_respostas_pergunta_id ON questionario_respostas(pergunta_id);

-- Adicionar comentários
COMMENT ON TABLE questionario_respostas IS 'Armazena as respostas do questionário de saúde para cada pessoa da proposta';
COMMENT ON COLUMN questionario_respostas.proposta_id IS 'ID da proposta relacionada';
COMMENT ON COLUMN questionario_respostas.pessoa_tipo IS 'Tipo da pessoa: titular ou dependente';
COMMENT ON COLUMN questionario_respostas.pessoa_nome IS 'Nome da pessoa que respondeu';
COMMENT ON COLUMN questionario_respostas.pessoa_index IS 'Índice da pessoa (0=titular, 1+=dependentes)';
COMMENT ON COLUMN questionario_respostas.peso IS 'Peso da pessoa em kg';
COMMENT ON COLUMN questionario_respostas.altura IS 'Altura da pessoa em cm';
COMMENT ON COLUMN questionario_respostas.pergunta_id IS 'ID da pergunta (1-21)';
COMMENT ON COLUMN questionario_respostas.pergunta_texto IS 'Texto da pergunta';
COMMENT ON COLUMN questionario_respostas.resposta IS 'Resposta: sim ou nao';
COMMENT ON COLUMN questionario_respostas.detalhes IS 'Detalhes adicionais quando resposta for sim';

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questionario_respostas' 
ORDER BY ordinal_position;
