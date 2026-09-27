-- ============================================================
-- APP 5 PORQUES (industrial) — coluna `analise` na tabela analises
-- Guarda as travas do rigor por analise: triagem (gemba + tipo),
-- nivel da causa (N1-N5), governabilidade e a classificacao por porque
-- (fato/hipotese/opiniao/inferencia + evidencia).
--
-- Sem isto, o app cai no fallback e salva SEM as travas. Rode UMA VEZ no
-- SQL Editor do Supabase deste app (projeto pysscrbqnjluqomvrrzf).
-- Seguro e idempotente.
--
-- Formato do JSONB gravado pelo app:
--   {
--     "gemba": true|false|null,
--     "tipo": "ver_agir|kaizen|5porques|ishikawa|a3",
--     "nivel": "N1..N5",
--     "governabilidade": "dentro_alcada|escalar",
--     "porques_meta": [ [ {"tipo":"fato|hipotese|opiniao|inferencia","evidencia":"..."} x5 ] x3 causas ]
--   }
-- ============================================================

alter table analises
  add column if not exists analise jsonb default '{}'::jsonb;

-- avisa o PostgREST sobre a coluna nova (senao as gravacoes podem dar erro de cache)
notify pgrst, 'reload schema';

-- Conferencia rapida (opcional): deve listar a coluna 'analise'
-- select column_name, data_type from information_schema.columns
--   where table_name = 'analises' order by ordinal_position;
