import * as fs from 'fs'
import path from 'path'
import { ScoutPostgresqlDb } from './lib'
import { IFile, Props } from './interface'
import { ParseQueryTemplate, ValidateDatabaseUrl, createFiles } from './utils'
export class DbScout {
  private props: Props
  private folderDir: string
  constructor(props: Props) {
    this.props = props
    this.folderDir = path.join(process.cwd(), props.destinationUrl || 'dbscout')
  }
  public getMigration(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbUrl = await new ValidateDatabaseUrl(this.props.sourceDbUrl).validate()
        const dbInfo = await new ScoutPostgresqlDb(dbUrl).getDatabaseInfo()
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
