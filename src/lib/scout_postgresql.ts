import { IEnumRes, IPostgresRes, IPostgresTableRes } from '../interface'
import { DB_INFO_QUERY, ENUM_INFO_QUERY } from '../queries'
import { GLOBAL, PUBLIC, SCHEMA_TYPE_TEMPLATE } from '../constants'
import { PostgresqlClient } from '../clients'

export class ScoutPostgresqlDb {
  private client: PostgresqlClient
  constructor(dbUrl: string) {
    this.client = new PostgresqlClient(dbUrl)
  }
  getDatabaseInfo(): Promise<IPostgresRes> {
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
}
