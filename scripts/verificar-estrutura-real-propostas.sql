-- Verificar estrutura real da tabela propostas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'propostas' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existe a coluna email_validacao_enviado
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'propostas' 
        AND column_name = 'email_validacao_enviado'
        AND table_schema = 'public'
) as coluna_existe;

-- Verificar dados de uma proposta específica
SELECT 
    id,
    nome,
    email,
    email_validacao_enviado,
    email_enviado_em,
    created_at,
    updated_at
FROM propostas 
ORDER BY created_at DESC 
LIMIT 5;
