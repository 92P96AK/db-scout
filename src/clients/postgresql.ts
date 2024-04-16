import { Client } from 'pg'
import { IConfig } from '../interface'
import { ParseUrl } from '../utils'

export class PostgresqlClient {
  public parsedUrl: IConfig
  private client: Client

  constructor(dbUrl: string) {
    try {
      this.parsedUrl = new ParseUrl(dbUrl).getParsedUrl()
      this.client = new Client()
    } catch (error) {
      throw error
    }
  }

  startConnection(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        this.client = new Client({
          user: this.parsedUrl.user,
          host: this.parsedUrl.host,
          database: this.parsedUrl.database,
          password: this.parsedUrl.password,
          port: this.parsedUrl.port,
          // ssl: this.parsedUrl.ssl,
        })
        await this.client.connect()
        resolve(true)
      } catch (error) {
        throw new Error(`Failed to start database connection: ${error}`)
      }
    })
  }

  query<T>(query: string): Promise<Array<T>> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.startConnection()
        const { rows } = await this.client.query(query)
        resolve(rows)
      } catch (error) {
        throw new Error(`Database query error: ${error}`)
      } finally {
        await this.endConnection()
      }
    })
  }

  endConnection(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.client.end()
        resolve(true)
      } catch (error) {
        throw new Error(`Failed to end database connection: ${error}`)
      }
    })
  }
}
