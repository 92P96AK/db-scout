import { IEnumRes, IPostgresRes, IPostgresTableRes, ImigrationRes } from '../interface'
import { DB_INFO_QUERY, ENUM_INFO_QUERY } from '../queries'
import { GLOBAL, PUBLIC, SCHEMA_TYPE_TEMPLATE } from '../constants'
import { PostgresqlClient } from '../clients'
import { MigrationOrder, ParseQueryTemplate } from '../utils'

export class ScoutPostgresqlDb {
  private client: PostgresqlClient
  private migrationOrderClass: MigrationOrder
  constructor(dbUrl: string) {
    this.client = new PostgresqlClient(dbUrl)
    this.migrationOrderClass = new MigrationOrder()
  }
  private getDatabaseInfo(): Promise<IPostgresRes> {
    return new Promise(async (resolve, reject) => {
      try {
        const tables: Array<IPostgresTableRes> = await this.client.query(
          DB_INFO_QUERY.replace(new RegExp(`${SCHEMA_TYPE_TEMPLATE}`, GLOBAL), this.client.parsedUrl.schema || PUBLIC),
        )
        const enums: Array<IEnumRes> = await this.client.query(ENUM_INFO_QUERY)
        resolve({
          database: this.client.parsedUrl.database,
          schema: this.client.parsedUrl.schema || PUBLIC,
          tables,
          enums,
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  getMigrationWithOrder(): Promise<ImigrationRes> {
    return new Promise(async (resolve, reject) => {
      try {
        const datas = await this.getDatabaseInfo()
        const circularDependency = await this.migrationOrderClass.checkCircularDependency(datas.tables)
        if (circularDependency.length) {
          throw new Error(
            ` you have circular dependent tables : ${circularDependency
              .map((cd) => cd.map((c) => c.name).join(','))
              .join('|')}`,
          )
        }
        const order = await this.migrationOrderClass.getMigrationOrder(datas.tables)
        const queries = await new ParseQueryTemplate({
          database: datas.database,
          schema: datas.schema,
          tables: order,
          enums: datas.enums
        }).getMigrattion()
        resolve({
          ...queries,
          migrationOrder: order.map((d) => d.name),
          isCircularDependent: false,
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
