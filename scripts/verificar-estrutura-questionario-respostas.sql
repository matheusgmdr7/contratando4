-- Verificar e criar tabela questionario_respostas se não existir
CREATE TABLE IF NOT EXISTS questionario_respostas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposta_id UUID NOT NULL,
    pessoa_tipo VARCHAR(20) NOT NULL CHECK (pessoa_tipo IN ('titular', 'dependente')),
    pessoa_nome VARCHAR(255) NOT NULL,
    peso VARCHAR(10),
    altura VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT unique_questionario_pessoa UNIQUE (proposta_id, pessoa_tipo, pessoa_nome)
);

-- Verificar e criar tabela respostas_questionario se não existir
CREATE TABLE IF NOT EXISTS respostas_questionario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    questionario_id UUID NOT NULL REFERENCES questionario_respostas(id) ON DELETE CASCADE,
    pergunta_id INTEGER NOT NULL,
    resposta VARCHAR(10) NOT NULL CHECK (resposta IN ('sim', 'nao')),
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT unique_resposta_pergunta UNIQUE (questionario_id, pergunta_id)
);

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_questionario_respostas_proposta_id ON questionario_respostas(proposta_id);
CREATE INDEX IF NOT EXISTS idx_questionario_respostas_pessoa_tipo ON questionario_respostas(pessoa_tipo);
CREATE INDEX IF NOT EXISTS idx_respostas_questionario_questionario_id ON respostas_questionario(questionario_id);
CREATE INDEX IF NOT EXISTS idx_respostas_questionario_pergunta_id ON respostas_questionario(pergunta_id);

-- Verificar estrutura das tabelas
SELECT 
    'questionario_respostas' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'questionario_respostas'
ORDER BY ordinal_position;

SELECT 
    'respostas_questionario' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'respostas_questionario'
ORDER BY ordinal_position;
