import fs from 'fs'
import path from 'path'
import { ScoutPostgresqlDb } from './src/lib'
import { IFile, Props } from './src/interface'
import { ParseQueryTemplate, ValidateDatabaseUrl, createFiles, readFileSync } from './src/utils'
import { DB_SCOUT, DB_SCOUT_CONFIG_JSON } from './src/constants'

export class DbScout {
  private props: Props
  private folderDir: string

  constructor(props?: Props) {
    const configUrl = path.join(process.cwd(), DB_SCOUT_CONFIG_JSON)
    this.readConfigSync(configUrl, props)
  }
  private readConfigSync(configUrl: string, prp?: Props) {
    try {
      if (fs.existsSync(configUrl)) {
        const config: Props = readFileSync<Props>(configUrl)
        this.props = config
      } else if (prp) {
        this.props = prp
      } else {
        throw new Error(`You must provide valid configuration or sourceDbUrl in ${DB_SCOUT_CONFIG_JSON}`)
      }
      this.folderDir = path.join(process.cwd(), this.props?.destinationUrl || DB_SCOUT)
      if (this.props.sourceDbUrl) {
        new ValidateDatabaseUrl(this.props.sourceDbUrl).validate()
      } else {
        throw new Error(`You must provide valid sourceDbUrl`)
      }
    } catch (error) {
      throw error
    }
  }

  public getMigration(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbInfo = await new ScoutPostgresqlDb(this.props.sourceDbUrl).getDatabaseInfo()
        const migration = await new ParseQueryTemplate(dbInfo).getMigrattion()

        if (!fs.existsSync(this.folderDir)) {
          fs.mkdirSync(this.folderDir, { recursive: true })
        }
        const files: Array<IFile> = []
        migration.tables.forEach((t) =>
          files.push({ filePath: path.join(this.folderDir, t.name + '.sql'), data: t.migration_query }),
        )
        if (migration?.enum) {
          files.push({ filePath: path.join(this.folderDir, '_enums.sql'), data: migration?.enum })
        }
        if (files.length > 0) {
          await createFiles(files)
        }
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }
}
