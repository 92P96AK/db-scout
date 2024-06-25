const postgresql = `
WITH CONSTRAINTS_RES AS (
  SELECT
  ccu.column_name,
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  CASE
     -- WHEN tc.constraint_type = 'CHECK' THEN pg_get_constraintdef(c.oid) do it later
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
 FOREIGN_KEY_RES AS (
  SELECT
  ccu.column_name,
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_values
FROM
  information_schema.constraint_column_usage ccu
JOIN
  information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
JOIN
  pg_catalog.pg_constraint c ON ccu.constraint_name = c.conname
WHERE
  tc.constraint_type = 'FOREIGN KEY'
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
COALESCE(
  (
    SELECT array_to_json(array_agg(row_to_json(enu)))
    FROM (
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
) order by pg_type.typname
 ) enu
  ),
  '[]'
) AS enums,

COALESCE(
  (
    SELECT array_to_json(array_agg(row_to_json(p_key)))
    FROM (
     SELECT ist.table_name as name,
      COALESCE(
        (
          SELECT array_to_json(array_agg(row_to_json(p_key)))
          FROM (
            SELECT cor.constraint_name,cor.constraint_values, cor.column_name,cor.table_name
              from CONSTRAINTS_RES cor
              where cor.table_name=ist.table_name 
              and cor.constraint_type= 'PRIMARY KEY'
              order by cor.constraint_name
          ) p_key
        ),
        '[]'
      ) AS p_keys,
      COALESCE(
        (
          SELECT array_to_json(array_agg(row_to_json(f_key)))
          FROM (
            SELECT cor.constraint_name,cor.constraint_values, cor.column_name,cor.table_name
            from FOREIGN_KEY_RES cor
            where cor.table_name=ist.table_name 
            and cor.constraint_type= 'FOREIGN KEY'
            order by cor.constraint_name
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
            order by ucr.table_name
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
            isc.udt_name
            FROM information_schema.columns isc
            WHERE isc.table_name = ist.table_name
            order by isc.column_name
          ) col
        ),
        '[]'
      ) AS "cols"
      FROM information_schema.tables ist
      WHERE table_type = 'BASE TABLE'
      AND table_schema = '{{SCHEMA}}'
      AND table_name NOT IN ({{EXCLUDED_TABLES}})
      order by ist.table_name
    ) p_key
  ),
  '[]'
) AS tables
`
// const mysql = ``
// const mongodb = ``
export const DB_INFO_QUERY = {
  postgresql,
  // mysql,
  // mongodb,
}
