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

-- Create table {{TABLE}} 

CREATE TABLE {{SCHEMA}}.{{TABLE}} (
 {{TABLE_COLUMNS_WITH_NAME_TYPE}}
  {{PRIMARY_KEYS}}
);

{{UNIQUE_INDEXES}}

{{FOREIGN_KEYS}}
`

export const CREATE_ENUM_TEMPLATE = 'CREATE TYPE {{NAME}} AS ENUM ({{VALUES}});'
export const CREATE_ENUM_QUERY = `/*
Created by pradip kharal 
https://github.com/92P96AK 
*/

-- Create enums

{{CREATE_ENUM}}
`
