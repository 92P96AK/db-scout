import { DB_URL_REGEX } from '../../constants'
import { URL_VALIDATION_ERROR } from '../../templates'

export class ValidateDatabaseUrl {
  private dbUrl: string
  constructor(dbUrl: string) {
    this.dbUrl = dbUrl
  }
  validate(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (DB_URL_REGEX.test(this.dbUrl)) {
        resolve(this.dbUrl)
        return
      }
      reject(
        new Error(
          URL_VALIDATION_ERROR.replace('{{DB_URL_REGEX}}', `${DB_URL_REGEX}`).replace('{{DB_URL}}', this.dbUrl),
        ),
      )
    })
  }
}
