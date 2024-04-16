export interface IConfig {
  user: string
  password: string
  host: string
  port: number
  database: string
  ssl: string
  schema: string | null
}
