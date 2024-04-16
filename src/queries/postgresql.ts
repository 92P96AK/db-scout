export const DB_INFO_QUERY = `
WITH CONSTRAINTS_RES AS (
  SELECT
  ccu.column_name,
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  CASE
     -- WHEN tc.constraint_type = 'CHECK' THEN pg_get_constraintdef(c.oid) do it later
     -- WHEN tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE') THEN ccu.constraint_name do it later
      WHEN tc.constraint_type = 'PRIMARY KEY' THEN ccu.constraint_name
      WHEN tc.constraint_type = 'FOREIGN KEY' THEN pg_get_constraintdef(c.oid)
     --  WHEN tc.constraint_type = 'NOT NULL' THEN 'NOT NULL' do it later
      ELSE null
  END AS constraint_values
FROM
  information_schema.constraint_column_usage ccu
JOIN
  information_schema.table_constraints tc
ON
  ccu.constraint_name = tc.constraint_name
  AND ccu.constraint_schema = tc.constraint_schema
JOIN
  pg_catalog.pg_constraint c
ON
  ccu.constraint_name = c.conname
  AND tc.constraint_schema = c.connamespace::regnamespace::text
),
UNIQUE_CONSTRAINTS_RES AS (
  SELECT tablename as table_name,indexname as index_name,indexdef as index_def
  FROM pg_indexes
  WHERE schemaname = '{{SCHEMA}}'
  AND indexdef LIKE '% UNIQUE%'
  AND indexname NOT IN (
    SELECT conname
    FROM pg_constraint
    WHERE contype = 'p' AND connamespace = (
      SELECT oid
      FROM pg_namespace
      WHERE nspname = '{{SCHEMA}}'
    )
  )
) 

SELECT 
ist.table_name as name,
COALESCE(
  (
    SELECT array_to_json(array_agg(row_to_json(p_key)))
    FROM (
      SELECT cor.constraint_name,cor.constraint_values, cor.column_name,cor.table_name
        from CONSTRAINTS_RES cor
        where cor.table_name=ist.table_name 
        and cor.constraint_type= 'PRIMARY KEY'
    ) p_key
  ),
  '[]'
) AS p_keys,
COALESCE(
  (
    SELECT array_to_json(array_agg(row_to_json(f_key)))
    FROM (
      SELECT cor.constraint_name,cor.constraint_values, cor.column_name,cor.table_name
      from CONSTRAINTS_RES cor
      where cor.table_name=ist.table_name 
      and cor.constraint_type= 'FOREIGN KEY'
    ) f_key
  ),
  '[]'
) AS f_keys,
COALESCE(
  (
    SELECT array_to_json(array_agg(row_to_json(u_index)))
    FROM (
      SELECT ucr.table_name, ucr.index_name, ucr.index_def
      from UNIQUE_CONSTRAINTS_RES ucr
      where ucr.table_name=ist.table_name
    ) u_index
  ),
  '[]'
) AS u_indexes,
COALESCE(
  (
    SELECT array_to_json(array_agg(row_to_json(col)))
    FROM (
      SELECT 
      isc.table_name,
      isc.table_schema,
      isc.column_name,
      isc.ordinal_position,
      isc.column_default,
      isc.is_nullable,
      isc.data_type,
      isc.character_maximum_length,
      isc.character_octet_length,
      isc.numeric_precision,
      isc.numeric_precision_radix,
      isc.numeric_scale,
      isc.datetime_precision,
      isc.interval_type,
      isc.interval_precision,
      isc.udt_catalog,
      isc.udt_schema,
      isc.udt_name,
      isc.maximum_cardinality,
      isc.is_self_referencing,
      isc.is_updatable,
      isc.is_identity,
    COALESCE(
        (
          SELECT array_to_json(array_agg(row_to_json(enum)))
          FROM (
            SELECT 
              pge."enumlabel"
              from pg_enum pge
              join pg_type pgt
              on pgt.oid=pge.enumtypid
              where pgt.typname = isc.udt_name
          ) enum
        ),
        '[]'
      ) AS enums
      FROM information_schema.columns isc
      WHERE isc.table_name = ist.table_name
      order by isc.ordinal_position asc
    ) col
  ),
  '[]'
) AS "cols"
FROM information_schema.tables ist
WHERE table_type = 'BASE TABLE'
AND table_schema = '{{SCHEMA}}';

`

export const GEN_ENUM_QUERY = `
SELECT 'CREATE TYPE ' || pg_type.typname || ' AS ENUM (' ||
string_agg(quote_literal(pg_enum.enumlabel), ', ' ORDER BY enumsortorder) || ');' AS create_enum_query
FROM pg_type
JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
GROUP BY pg_type.typname
`

export const ENUM_INFO_QUERY = `
SELECT pg_type.typname as name,
COALESCE(
  (
      SELECT array_agg(pg_enum.enumlabel::text)
      FROM pg_enum 
      WHERE pg_enum.enumtypid = pg_type.oid
  ),
  ARRAY[]::text[]
) AS values
FROM pg_type
WHERE EXISTS (
SELECT 1
FROM pg_enum
WHERE pg_enum.enumtypid = pg_type.oid
)
`