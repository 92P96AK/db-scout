import { ScoutPostgresqlDb } from './lib'
import { IPostgreSQlSeed, Props } from './interface'
import { ValidateDatabaseUrl, File, Path, GenSeedQuery, MigrationOrder, GenSchema } from './utils'
import { DB_SCOUT, DB_SCOUT_CONFIG_JSON } from './constants'
import { PostgresqlClient } from './clients'
import queries from './queries'
import { Random } from 'uncertainjs'
export type { RelationalSchema as Schema } from 'uncertainjs'
export class DbScout {
  private props!: Props
  private folderDir: string
  private file: File
  private path: Path
  private random: Random
  private psqlScout: ScoutPostgresqlDb
  private migrationOrderClass: MigrationOrder

  constructor(props?: Props) {
    this.path = new Path()
    this.folderDir = this.path.joinWithCwd(DB_SCOUT_CONFIG_JSON)
    this.file = new File()
    this.random = new Random()
    this.readConfigSync(this.folderDir, props)
    this.psqlScout = new ScoutPostgresqlDb({
      sourceDbUrl: this.props.sourceDbUrl,
      destinationDbUrl: this.props.destinationDbUrl,
    })
    this.migrationOrderClass = new MigrationOrder()
    // this.updateDbScoutTableInfo()
  }

  private readConfigSync(configUrl: string, prp?: Props) {
    try {
      if (this.file.existsSync(configUrl)) {
        const config: Props = this.file.readAndParseJsonFileSync<Props>(configUrl)
        this.props = config
      } else if (prp) {
        this.props = prp
      } else {
        throw new Error(`You must provide valid configuration or sourceDbUrl in ${DB_SCOUT_CONFIG_JSON}`)
      }
      this.folderDir = this.path.joinWithCwd(this.props?.outputDirectory || DB_SCOUT)
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
        const migrationData = await this.psqlScout.getMigration()

        const migrations = migrationData.tables.map((t) => t.migration_query).join('\n')
        resolve('-- https://github.com/92P96AK ' + migrations)
      } catch (error) {
        reject(error)
      }
    })
  }

  public generateMigration(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const migrationData = await this.psqlScout.getMigration()

        if (!this.file.existsSync(this.folderDir)) {
          this.file.mkdirSync(this.folderDir)
        }
        const migrationDir = this.path.join(this.folderDir, `${Date.now()}`)
        const migrations = migrationData.tables.map((t) => t.migration_query).join('\n')
        const fileData = {
          filePath: this.path.join(migrationDir, 'migration.sql'),
          data: '-- https://github.com/92P96AK ' + migrations,
        }
        await this.file.createFile(fileData)
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }

  private getMigrationDiff(): Promise<string> {
    // later
    return new Promise(async (resolve, reject) => {
      try {
        const migrationData = await this.psqlScout.getMigration()

        if (!this.file.existsSync(this.folderDir)) {
          this.file.mkdirSync(this.folderDir)
        }
        const migrations = migrationData.tables.map((t) => t.migration_query).join('\n')
        const fileData = {
          filePath: this.path.join(this.folderDir, 'migration.sql'),
          data: '-- https://github.com/92P96AK ' + migrations,
        }
        await this.file.createFile(fileData)
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }

  public runMigration(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.props.destinationDbUrl && this.props.outputDirectory) {
          const migrationquery = this.file.readFileSync(`${this.props.outputDirectory}/migration.sql`)
          if (!migrationquery) {
            throw new Error('Migration not fount')
          }
          const migration = await new PostgresqlClient(this.props.destinationDbUrl).runQueryWithTransaction(
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

  private updateDbScoutTableInfo(): Promise<string> {
    // later
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.props.destinationDbUrl && !this.props.sourceDbUrl) {
          throw new Error('source or destination db url not found')
        }
        ;[this.props.sourceDbUrl, this.props.destinationDbUrl].forEach(async (dbUrl) => {
          if (dbUrl) {
            try {
              await new PostgresqlClient(dbUrl).runQueryWithTransaction(queries.dbscout.system_info)
            } catch (error) {
              throw new Error(`${error}`)
            }
          }
        })
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }

  public getDocumentation(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.psqlScout.getDatabaseDocumentation()
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  public generateDocumentation(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.psqlScout.getDatabaseDocumentation()

        if (!this.file.existsSync(this.folderDir)) {
          this.file.mkdirSync(this.folderDir)
        }
        const docDir = this.path.join(this.folderDir, `documentation`)
        if (!this.file.existsSync(docDir)) {
          this.file.mkdirSync(docDir)
        }
        const fileData = {
          filePath: this.path.join(docDir, 'info.txt'),
          data,
        }
        await this.file.createFile(fileData)
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }

  public getInterface(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.psqlScout.getInterfaces()
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  public generateInterface(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.psqlScout.getInterfaces()
        const interfaceDir = this.path.join(this.folderDir, `interfaces`)
        if (!this.file.existsSync(interfaceDir)) {
          this.file.mkdirSync(interfaceDir)
        }
        const fileData = {
          filePath: this.path.join(interfaceDir, 'index.ts'),
          data,
        }
        await this.file.createFile(fileData)
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }

  public getSeedData(payload?: IPostgreSQlSeed): Promise<Record<string, Record<string, any>[]>> {
    return new Promise(async (resolve, reject) => {
      try {
        let { schema, exclude_tables, copies = 1 } = payload ?? {}
        if (!schema) {
          const {
            source: { tables, enums },
          } = await this.psqlScout.getDatabaseInfo({ exclude_tables })
          const circularDependency = await this.migrationOrderClass.checkCircularDependency(tables)
          if (circularDependency.length) {
            throw new Error(
              ` you have circular dependent tables : ${circularDependency
                .map((cd) => cd.map((c) => c.name).join(','))
                .join('|')}`,
            )
          }
          const order = await this.migrationOrderClass.getMigrationOrder(tables)
          schema = await GenSchema({ tables: order, enums })
        }
        const datas = await this.random.generateRandomObjectWithRelation(schema!, copies)
        resolve(datas)
      } catch (error) {
        reject(error)
      }
    })
  }

  public seedData(payload?: IPostgreSQlSeed): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        let { schema, exclude_tables, copies = 1 } = payload ?? {}
        if (!schema) {
          const {
            source: { tables, enums },
          } = await this.psqlScout.getDatabaseInfo({ exclude_tables })
          const circularDependency = await this.migrationOrderClass.checkCircularDependency(tables)
          if (circularDependency.length) {
            throw new Error(
              ` you have circular dependent tables : ${circularDependency
                .map((cd) => cd.map((c) => c.name).join(','))
                .join('|')}`,
            )
          }
          const order = await this.migrationOrderClass.getMigrationOrder(tables)
          schema = await GenSchema({ tables: order, enums })
        }
        const datas = await this.random.generateRandomObjectWithRelation(schema!, copies)
        const query = await GenSeedQuery(datas)
        await new PostgresqlClient(this.props.sourceDbUrl).runQueryWithTransaction(query)
        resolve('success')
      } catch (error) {
        reject(error)
      }
    })
  }
}
