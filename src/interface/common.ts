import { IEnumRes, IPFConstraintsRes, IPostgresCol, IUniqueIndexesRes } from './postgresql'

export interface IParseTableData {
  name: string
  cols: Array<IPostgresCol>
  p_keys: Array<IPFConstraintsRes>
  f_keys: Array<IPFConstraintsRes>
  u_indexes: Array<IUniqueIndexesRes>
}
export interface IParseTemplatesData {
  database: string
  schema: string
  tables: Array<IParseTableData>
  enums: Array<IEnumRes>
}
export interface IparseTableRes {
  name: string
  migration_query: string
}
export interface IParseTemplatesRes {
  tables: Array<IparseTableRes>
}

export interface IMigrationOrder {
  name: string
  f_keys: Array<{
    column_name: string
    table_name: string
  }>
}

export interface ImigrationRes extends IParseTemplatesRes {}
