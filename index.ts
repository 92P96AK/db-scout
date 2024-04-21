import fs from 'fs'
import path from 'path'
import { ScoutPostgresqlDb } from './src/lib'
import { IFile, Props } from './src/interface'
import { ValidateDatabaseUrl, createFiles, readFileSync } from './src/utils'
import { DB_SCOUT, DB_SCOUT_CONFIG_JSON } from './src/constants'
import { PostgresqlClient } from './src/clients'

export class DbScout {
  private props!: Props
  private folderDir: string

  constructor(props?: Props) {
    this.folderDir = path.join(process.cwd(), DB_SCOUT_CONFIG_JSON)
    this.readConfigSync(this.folderDir, props)
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
      this.folderDir = path.join(process.cwd(), this.props?.outputDirectory || DB_SCOUT)
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
        const migrationData = await new ScoutPostgresqlDb(this.props.sourceDbUrl).getMigrationWithOrder()
        if (!fs.existsSync(this.folderDir)) {
          fs.mkdirSync(this.folderDir, { recursive: true })
        }
        const files: Array<IFile> = []
        migrationData.tables.forEach((t) =>
          files.push({ filePath: path.join(this.folderDir, t.name + '.sql'), data: t.migration_query }),
        )
        if (migrationData.migrationOrder) {
          const json = {
            isCircularDependent: migrationData.isCircularDependent,
            migrationOrder: migrationData.migrationOrder,
          }
          files.push({ filePath: path.join(this.folderDir, '__metadata.json'), data: JSON.stringify(json) })
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

  public runMigrationWithTransaction(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.props.destinationDbUrl && this.props.outputDirectory) {
          const migration = await new PostgresqlClient(this.props.destinationDbUrl).runMigrationWithTransaction(
            this.props.outputDirectory,
          )
          resolve(migration)
          return
        }
        throw new Error('error occurred')
      } catch (error) {
        reject(error)
      }
    })
  }
}
