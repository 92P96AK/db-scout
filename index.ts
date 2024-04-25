import fs from 'fs'
import path from 'path'
import { ScoutPostgresqlDb } from './src/lib'
import { IFile, Props } from './src/interface'
import { ValidateDatabaseUrl, createFiles, readFileSync } from './src/utils'
import { DB_SCOUT, DB_SCOUT_CONFIG_JSON } from './src/constants'
import { PostgresqlClient } from './src/clients'
import { DBSCOUT_SYSTEM_INFO_QUERY } from './src/queries'

export class DbScout {
  private props!: Props
  private folderDir: string

  constructor(props?: Props) {
    this.folderDir = path.join(process.cwd(), DB_SCOUT_CONFIG_JSON)
    this.readConfigSync(this.folderDir, props)
    // this.updateDbScoutTableInfo()
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
        const migrationData = await new ScoutPostgresqlDb({
          sourceDbUrl: this.props.sourceDbUrl,
          destinationDbUrl: this.props.destinationDbUrl,
        }).getMigrationWithOrder()
        if (!fs.existsSync(this.folderDir)) {
          fs.mkdirSync(this.folderDir, { recursive: true })
        }
        // const migrationDir = path.join(this.folderDir, `${Date.now()}`)
        if (!fs.existsSync(this.folderDir)) {
          fs.mkdirSync(this.folderDir, { recursive: true })
        }
        const migrations = migrationData.tables.map((t) => t.migration_query).join('\n')
        const files: Array<IFile> = [
          {
            filePath: path.join(this.folderDir, 'migration.sql'),
            data: ` /*
            Created by pradip kharal 
            https://github.com/92P96AK 
            */
              ${migrations}`,
          },
        ]
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
          const migrationquery = fs.readFileSync(`${this.props.outputDirectory}/migration.sql`, 'utf8')
          if (!migrationquery) {
            throw new Error('Migration not fount')
          }
          const migration = await new PostgresqlClient(this.props.destinationDbUrl).runMigrationWithTransaction(
            migrationquery,
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

  public updateDbScoutTableInfo(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.props.destinationDbUrl && !this.props.sourceDbUrl) {
          throw new Error('source or destination db url not found')
        }
        ;[this.props.sourceDbUrl, this.props.destinationDbUrl].forEach(async (dbUrl) => {
          if (dbUrl) {
            try {
              await new PostgresqlClient(dbUrl).runMigrationWithTransaction(DBSCOUT_SYSTEM_INFO_QUERY)
            } catch (error) {
              throw new Error(error)
            }
          }
        })
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }
  public genDoc(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await new ScoutPostgresqlDb({
          sourceDbUrl: this.props.sourceDbUrl,
          destinationDbUrl: this.props.destinationDbUrl,
        }).getDatabaseDocumentation()

        if (!fs.existsSync(this.folderDir)) {
          fs.mkdirSync(this.folderDir, { recursive: true })
        }
        const docDir = path.join(this.folderDir, `documentation`)
        if (!fs.existsSync(docDir)) {
          fs.mkdirSync(docDir, { recursive: true })
        }
        const files: Array<IFile> = [
          {
            filePath: path.join(docDir, 'info.txt'),
            data,
          },
        ]
        if (files.length > 0) {
          await createFiles(files)
        }
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }
  public genInterface(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await new ScoutPostgresqlDb({
          sourceDbUrl: this.props.sourceDbUrl,
          destinationDbUrl: this.props.destinationDbUrl,
        }).getInterfaces()
        if (!fs.existsSync(this.folderDir)) {
          fs.mkdirSync(this.folderDir, { recursive: true })
        }
        const interfaceDir = path.join(this.folderDir, `interfaces`)
        if (!fs.existsSync(interfaceDir)) {
          fs.mkdirSync(interfaceDir, { recursive: true })
        }
        const files: Array<IFile> = [
          {
            filePath: path.join(interfaceDir, 'index.ts'),
            data,
          },
        ]
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
