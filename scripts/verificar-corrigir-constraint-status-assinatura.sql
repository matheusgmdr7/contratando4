-- Verificar a constraint atual do status_assinatura
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%status_assinatura%' 
AND conrelid = 'propostas'::regclass;

-- Verificar valores únicos existentes na coluna
SELECT DISTINCT status_assinatura, COUNT(*) 
FROM propostas 
WHERE status_assinatura IS NOT NULL
GROUP BY status_assinatura;

-- Remover constraint existente se houver problema
ALTER TABLE propostas DROP CONSTRAINT IF EXISTS propostas_status_assinatura_check;

-- Criar nova constraint com valores corretos
ALTER TABLE propostas 
ADD CONSTRAINT propostas_status_assinatura_check 
CHECK (status_assinatura IN ('pendente', 'assinada', 'rejeitada'));

-- Verificar se a constraint foi criada corretamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'propostas_status_assinatura_check';
