import { PostgresDataTypesAndOrm } from '../constants'
import { IDbInfoRes } from '../interface'
import DataParser from './data_parser'

export const GenSchema = async ({ tables, enums }: IDbInfoRes) => {
  const schema: any = {}
  await tables?.forEach(async (table) => {
    const cols: any = {}
    await table?.cols.forEach((c) => {
      const en = enums.find((e) => e.name === c.udt_name)
      const coldata = {
        type: PostgresDataTypesAndOrm[c.data_type]?.ormType || c.data_type?.toLowerCase(),
        required: c.is_nullable === 'NO',
        oneOf: en?.values ?? null,
        default: DataParser.getDefaultData(c.column_default),
        isPrimary: !!table.p_keys.find((col) => col.column_name === c.column_name),
        min: 0,
        max: c.character_maximum_length || null,
      }
      cols[`${c.column_name}`] = coldata
      schema[`${table.name}`] = cols
    })
  })
  return schema
}
