export const PRIMARY_KEY_TEMPLATE = 'CONSTRAINT "{{CONSTRAINT_NAME}}" PRIMARY KEY ({{PRIMARY_KEYS}})'
export const FOREIGN_KEY_TEMPLATE =
  'ALTER TABLE "{{SCHEMA}}"."{{TABLE}}" ADD CONSTRAINT "{{CONSTRAINT_NAME}}" {{CONSTRAINT_VALUE}};'
export const UNIQUE_INDEX_TEMPLATE = '{{INDEX_VALUE}};'
export const DEFAULT_TEMPLATE = 'DEFAULT {{DEFAULT_VALUE}}'
export const TABLE_COL_TEMPLATE = '"{{COL_NAME}}" {{COL_TYPE}} {{NULLABLE}} {{DEFAULT_VALUE}}'
export const CREATE_TABLE_QUERY = `/*
   Created by pradip kharal 
   https://github.com/92P96AK 
   */

   {{CREATE_ENUM_QUERY}}
-- Create table {{TABLE}} 

CREATE TABLE IF NOT EXISTS {{SCHEMA}}."{{TABLE}}" (
 {{TABLE_COLUMNS_WITH_NAME_TYPE}}
  {{PRIMARY_KEYS}}
);

{{UNIQUE_INDEXES}}

{{FOREIGN_KEYS}}
`

export const CREATE_ENUM_TEMPLATE = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = '{{NAME}}'
    ) THEN
        EXECUTE 'CREATE TYPE "{{NAME}}" AS ENUM ({{VALUES}})';
    END IF;
END $$;
`
export const CREATE_ENUM_QUERY = `
-- Create enums

{{CREATE_ENUM}}
`
