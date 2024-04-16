export interface IPostgresCol {
  table_name: string
  table_schema: string
  column_name: string
  ordinal_position: number
  column_default: string
  is_nullable: 'YES' | 'NO'
  data_type: string
  character_maximum_length: number
  character_octet_length: number
  numeric_precision: number
  numeric_precision_radix: number
  numeric_scale: number
  datetime_precision: number
  interval_type: string
  interval_precision: number
  udt_catalog: string
  udt_schema: string
  udt_name: string
  maximum_cardinality: number
  is_self_referencing: 'YES' | 'NO'
  is_identity: 'YES' | 'NO'
  identity_generation: string
  identity_start: string
  identity_increment: string
  identity_maximum: string
  identity_minimum: string
  identity_cycle: 'YES' | 'NO'
  is_generated: 'ALWAYS' | 'BY DEFAULT' | 'NEVER'
  generation_expression: string
  is_updatable: 'YES' | 'NO'
}

export interface IPostgresRes {
  database: string
  schema: string
  tables: Array<IPostgresTableRes>
  enums: Array<IEnumRes>
}

export interface IPostgresTableRes {
  name: string
  cols: Array<IPostgresCol>
  p_keys: Array<IPFConstraintsRes>
  f_keys: Array<IPFConstraintsRes>
  u_indexes: Array<IUniqueIndexesRes>
}
export interface IEnumRes {
  name: string
  values: Array<string>
}

export interface IPFConstraintsRes {
  column_name: string
  constraint_name: string
  constraint_values: string
  table_name: string
}

export interface IUniqueIndexesRes {
  table_name: string
  index_name: string
  index_def: string
}
