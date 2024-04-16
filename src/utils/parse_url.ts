import { IConfig } from '../interface'

export class ParseUrl {
  private parsedUrl: URL
  constructor(dbUrl: string) {
    this.parsedUrl = new URL(dbUrl)
  }
  getParsedUrl(): IConfig {
    return {
      user: this.parsedUrl.username,
      password: this.parsedUrl.password,
      host: this.parsedUrl.hostname,
      port: parseInt(this.parsedUrl.port),
      database: this.parsedUrl.pathname.substring(1),
      ssl: this.parsedUrl.searchParams.has('sslmode')
        ? this.parsedUrl.searchParams.get('sslmode') || 'disable'
        : 'disable',
      schema: this.parsedUrl.searchParams.has('schema') ? this.parsedUrl.searchParams.get('schema') : null,
    }
  }
}
