import {
  COL_NAME_TEMPLATE,
  PRECISION_TEMPLATE,
  COL_TYPE_TEMPLATE,
  DEFAULT_VALUE_TEMPLATE,
  FOREIGN_KEYS_TEMPLATE,
  GLOBAL,
  NULLABLE_TEMPLATE,
  PRIMARY_KEYS_TEMPLATE,
  PostgresDataTypesAndOrm,
  SCHEMA_TYPE_TEMPLATE,
  TABLE_COLUMNS_WITH_NAME_TYPE_TEMPLATE,
  TABLE_TEMPLATE,
  NULLABLE_DATA,
  LENGTH_TEMPLATE,
  SCALE_TEMPLATE,
  CONSTRAINT_NAME_TEMPLATE,
  CONSTRAINT_VALUE_TEMPLATE,
  INDEX_VALUE_TEMPLATE,
  UNIQUE_INDEXES_TEMPLATE,
  ENUM_NAME_TEMPLATE,
  ENUM_VALUE_TEMPLATE,
  CREATE_ENUM_QUERY_TEMPLATE,
} from '../constants'
import {
  CREATE_ENUM_QUERY,
  CREATE_ENUM_TEMPLATE,
  CREATE_TABLE_QUERY,
  DEFAULT_TEMPLATE,
  FOREIGN_KEY_TEMPLATE,
  PRIMARY_KEY_TEMPLATE,
  TABLE_COL_TEMPLATE,
  UNIQUE_INDEX_TEMPLATE,
} from '../templates'
import {
  IParseTemplatesRes,
  IParseTableData,
  IPostgresCol,
  IPFConstraintsRes,
  IUniqueIndexesRes,
  IEnumRes,
  IPostgresRes,
} from '../interface'

export class ParseQueryTemplate {
  private parseTemplatesData: IPostgresRes
  constructor(data: IPostgresRes) {
    this.parseTemplatesData = data
  }

  public getMigrattion(): Promise<IParseTemplatesRes> {
    return new Promise(async (resolve, reject) => {
      try {
        const migration: IParseTemplatesRes = {
          schema: this.parseTemplatesData.schema,
          database: this.parseTemplatesData.database,
          tables: this.parseTemplatesData.tables.map((table, i) => {
            return {
              name: table.name,
              migration_query: this.getMigrationQuery(table),
            }
          }),
          enum: this.getEnumMigration(this.parseTemplatesData.enums),
        }
        resolve(migration)
      } catch (error) {
        reject(error)
      }
    })
  }

  private getMigrationQuery(table: IParseTableData): string {
    return CREATE_TABLE_QUERY.replace(new RegExp(`${SCHEMA_TYPE_TEMPLATE}`, GLOBAL), this.parseTemplatesData.schema)
      .replace(new RegExp(`${TABLE_TEMPLATE}`, GLOBAL), table.name)
      .replace(
        `${TABLE_COLUMNS_WITH_NAME_TYPE_TEMPLATE}`,
        this.getColumnsWithDataTypeAndDefault(table.cols, !!table.p_keys.length),
      )
      .replace(`${PRIMARY_KEYS_TEMPLATE}`, this.getPrimaryKeysWithConstraints(table.p_keys))
      .replace(`${UNIQUE_INDEXES_TEMPLATE}`, this.getUniqueIndexes(table.u_indexes))
      .replace(`${FOREIGN_KEYS_TEMPLATE}`, this.getForeignKeysWithConstraints(table.f_keys))
  }

  private getColumnsWithDataTypeAndDefault(cols: Array<IPostgresCol>, has_primary_keys: boolean): string {
    const total_cols = cols.length
    return cols
      .map(
        (col, i) =>
          `${TABLE_COL_TEMPLATE.replace(`${COL_NAME_TEMPLATE}`, col.column_name)
            .replace(`${COL_TYPE_TEMPLATE}`, PostgresDataTypesAndOrm[`${col.udt_name}`]?.type || `"${col.udt_name}"`)
            .replace(`${LENGTH_TEMPLATE}`, `${col.character_maximum_length}`)
            .replace(`${PRECISION_TEMPLATE}`, col.numeric_precision ? `${col.numeric_precision}` : '')
            .replace(`${SCALE_TEMPLATE}`, `${col.numeric_scale}`)
            .replace(`${NULLABLE_TEMPLATE}`, NULLABLE_DATA[`${col.is_nullable}`])
            .replace(
              `${DEFAULT_VALUE_TEMPLATE}`,
              col.column_default
                ? DEFAULT_TEMPLATE.replace(`${DEFAULT_VALUE_TEMPLATE}`, col.column_default?.split('::')[0] || '')
                : '',
            )}${total_cols > i + 1 || has_primary_keys ? ',' : ''} \n`,
      )
      .join('')
  }

  private getPrimaryKeysWithConstraints(pkeys: Array<IPFConstraintsRes>): string {
    return pkeys.length > 0
      ? PRIMARY_KEY_TEMPLATE.replace(`${CONSTRAINT_NAME_TEMPLATE}`, pkeys[0]?.constraint_name || '').replace(
          `${PRIMARY_KEYS_TEMPLATE}`,
          `${pkeys.map((pk) => `"${pk.column_name}"`).join(',')}`,
        )
      : ''
  }

  private getUniqueIndexes(uindexes: Array<IUniqueIndexesRes>): string {
    return uindexes.length > 0
      ? uindexes
          .map((u_index) => `${UNIQUE_INDEX_TEMPLATE.replace(`${INDEX_VALUE_TEMPLATE}`, u_index.index_def)} \n`)
          .join('')
      : ''
  }

  private getForeignKeysWithConstraints(fkeys: Array<IPFConstraintsRes>): string {
    return fkeys.length > 0
      ? fkeys
          .map(
            (fkey) =>
              `${FOREIGN_KEY_TEMPLATE.replace(`${SCHEMA_TYPE_TEMPLATE}`, this.parseTemplatesData.schema)
                .replace(`${TABLE_TEMPLATE}`, fkey.table_name)
                .replace(`${CONSTRAINT_NAME_TEMPLATE}`, fkey.constraint_name)
                .replace(`${CONSTRAINT_VALUE_TEMPLATE}`, fkey.constraint_values)} \n`,
          )
          .join('')
      : ''
  }

  private getEnumMigration(enums: Array<IEnumRes>): string {
    return enums.length > 0
      ? CREATE_ENUM_QUERY.replace(
          `${CREATE_ENUM_QUERY_TEMPLATE}`,
          enums
            .map((en, i) =>
              CREATE_ENUM_TEMPLATE.replace(`${ENUM_NAME_TEMPLATE}`, en.name).replace(
                `${ENUM_VALUE_TEMPLATE}`,
                en.values.map((e) => `'${e}'`).join(','),
              ),
            )
            .join(' \n'),
        )
      : ''
  }
}
