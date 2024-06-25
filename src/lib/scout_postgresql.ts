import { DbUrlProps, IDbInfoRes, IPostgresResDBS, IQueryProps, ImigrationRes } from '../interface'
import queries from '../queries'
import { GLOBAL, PUBLIC, PostgresDataTypesAndOrm, SCHEMA_TYPE_TEMPLATE } from '../constants'
import { PostgresqlClient } from '../clients'
import { MigrationOrder, ParseQueryTemplate } from '../utils'

export class ScoutPostgresqlDb {
  private sourceClient: PostgresqlClient
  private destinationClient?: PostgresqlClient
  private migrationOrderClass: MigrationOrder
  constructor(props: DbUrlProps) {
    this.sourceClient = new PostgresqlClient(props.sourceDbUrl)
    if (props?.destinationDbUrl) {
      this.destinationClient = new PostgresqlClient(props.destinationDbUrl)
    }
    this.migrationOrderClass = new MigrationOrder()
  }

  public getDatabaseInfo(props?: IQueryProps): Promise<IPostgresResDBS> {
    return new Promise(async (resolve, reject) => {
      try {
        const sourceDBInfo: Array<IDbInfoRes> = await this.sourceClient.query(
          queries.DB_INFO_QUERY.postgresql
            .replace(new RegExp(`${SCHEMA_TYPE_TEMPLATE}`, GLOBAL), this.sourceClient.parsedUrl.schema || PUBLIC)
            .replace('{{EXCLUDED_TABLES}}', `${props?.exclude_tables?.map((table) => `'${table}'`) ?? null}`),
        )
        if (this.destinationClient) {
          const destinationDBInfo: Array<IDbInfoRes> = await this.destinationClient.query(
            queries.DB_INFO_QUERY.postgresql
              .replace(new RegExp(`${SCHEMA_TYPE_TEMPLATE}`, GLOBAL), this.sourceClient.parsedUrl.schema || PUBLIC)
              .replace('{{EXCLUDED_TABLES}}', `${props?.exclude_tables?.map((table) => `'${table}'`) ?? null}`),
          )
          resolve({
            source: sourceDBInfo[0],
            destination: destinationDBInfo[0],
          })
          return
        }
        resolve({
          source: sourceDBInfo[0],
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  getMigration(): Promise<ImigrationRes> {
    return new Promise(async (resolve, reject) => {
      try {
        const { source } = await this.getDatabaseInfo()
        const circularDependency = await this.migrationOrderClass.checkCircularDependency(source.tables)

        if (circularDependency.length) {
          throw new Error(
            ` you have circular dependent tables : ${circularDependency
              .map((cd) => cd.map((c) => c.name).join(','))
              .join('|')}`,
          )
        }
        const order = await this.migrationOrderClass.getMigrationOrder(source.tables)
        const queries = await new ParseQueryTemplate({
          tables: order,
          enums: source.enums,
        }).getMigrattion()
        resolve({
          ...queries,
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  getMigrationDiff(): Promise<ImigrationRes> {
    return new Promise(async (resolve, reject) => {
      try {
        const { source, destination } = await this.getDatabaseInfo()
        const circularDependency = await this.migrationOrderClass.checkCircularDependency(source.tables)
        if (circularDependency.length) {
          throw new Error(
            ` you have circular dependent tables : ${circularDependency
              .map((cd) => cd.map((c) => c.name).join(','))
              .join('|')}`,
          )
        }
        // if (!destination) {
        const order = await this.migrationOrderClass.getMigrationOrder(source.tables)
        const queries = await new ParseQueryTemplate({
          tables: order,
          enums: source.enums,
        }).getMigrattion()
        resolve({
          ...queries,
        })
        // } else {
        //   const enums: Array<any> = []
        //   const tables: Array<any> = []
        //   source.enums.forEach((se) => {
        //     const de = destination.enums.find((de) => de.name === se.name)
        //     if (!de) {
        //       enums.push({ ...se, isnew: true, haschanged: false, newen: [], dropen: [] })
        //     } else {
        //       const newen = se.values.filter((ss) => !de.values.includes(ss))
        //       const dropen = de.values.filter((dd) => !se.values.includes(dd))
        //       enums.push({ ...se, isnew: false, haschanged: !!newen?.length || !!dropen?.length, newen, dropen })
        //     }
        //   })

        //   // WARN :: if table name is changed or col name is changed it will treat changed as new and old as dropped so data gets lost

        //   source.tables.forEach((st) => {
        //     const dest = destination.tables.find((dt) => dt.name === st.name)
        //     if (!dest) {
        //       tables.push({
        //         ...st,
        //         isnew: true,
        //         haschanged: false,
        //         newcol: [],
        //         dropcol: [],
        //         // changedcol: [],
        //       })
        //     } else {
        //       const newcol = st.cols.filter((ss) => !st.cols.map((f) => f.column_name).includes(ss.column_name))
        //       const dropcol = dest.cols.filter((ss) => !dest.cols.map((f) => f.column_name).includes(ss.column_name))
        //       // const changedcol = dest.cols.filter((ss) => !dest.cols.map((f) => f.column_name).includes(ss.column_name))
        //       if (newcol?.length || dropcol?.length) {
        //         tables.push({
        //           ...st,
        //           isnew: false,
        //           haschanged: !!newcol?.length || !!dropcol?.length,
        //           dropcol,
        //           // changedcol,
        //         })
        //       }
        //     }
        //   })
        // }
      } catch (error) {
        reject(error)
      }
    })
  }

  public getDatabaseDocumentation(props?: IQueryProps): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const sourceDBInfo: Array<IDbInfoRes> = await this.sourceClient.query(
          queries.DB_INFO_QUERY.postgresql
            .replace(new RegExp(`${SCHEMA_TYPE_TEMPLATE}`, GLOBAL), this.sourceClient.parsedUrl.schema || PUBLIC)
            .replace('{{EXCLUDED_TABLES}}', `${props?.exclude_tables?.map((table) => `'${table}'`) ?? null}`),
        )
        let doc = `
       //     https://github.com/92P96AK 
       `

        sourceDBInfo[0]?.enums.forEach((en) => {
          doc += `
        Data type : Enum
        Name : ${en.name}
        Values : (${en.values.join(',')})
        `
        })
        sourceDBInfo[0]?.tables.forEach((table) => {
          doc += `
        Table Name : ${table.name}

        Columns : (
          ${table.cols
            ?.map((col) => {
              return `name : ${col.column_name}    type :${col.udt_name}    null? :${!!col.is_nullable}   default? :${
                col.column_default
              }    `
            })
            .join(' \n')}
        )

        Primary Keys : (
             ${table.p_keys?.map((pk) => `${pk.column_name}`)}
        )

        Foreign Keys : (
          ${table.f_keys?.map((fk) => `${fk.constraint_values?.split('REFERENCES ')[1]?.split(' ')[0]}`)}
        )
        `
        })

        resolve(doc)
      } catch (error) {
        reject(error)
      }
    })
  }

  public getInterfaces(props?: IQueryProps): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const sourceDBInfo: Array<IDbInfoRes> = await this.sourceClient.query(
          queries.DB_INFO_QUERY.postgresql
            .replace(new RegExp(`${SCHEMA_TYPE_TEMPLATE}`, GLOBAL), this.sourceClient.parsedUrl.schema || PUBLIC)
            .replace('{{EXCLUDED_TABLES}}', `${props?.exclude_tables?.map((table) => `'${table}'`) ?? null}`),
        )
        let doc = `
       //     https://github.com/92P96AK 

       ${
         sourceDBInfo[0]?.enums?.length > 0
           ? `

       ${sourceDBInfo[0].enums
         .map(
           (en) => `enum ${en.name} {
            ${en.values.map((env) => `${env} = '${env}',`).join('\n')}
       }`,
         )
         .join('\n')}
       `
           : ''
       }

       ${
         sourceDBInfo[0]?.tables?.length > 0
           ? `
       ${sourceDBInfo[0]?.tables
         .map(
           (t) => `
       interface ${t.name.toLowerCase().replace(/(?:^|_)(.)/g, (_, chr) => chr.toUpperCase())} {
           ${t.cols
             .map((col) => {
               return `${col.column_name} : ${PostgresDataTypesAndOrm[col.udt_name]?.ormType || col.udt_name};`
             })
             .join('\n')}
       }
       `,
         )
         .join('\n')}
       `
           : ''
       }
       `

        resolve(doc)
      } catch (error) {
        reject(error)
      }
    })
  }
}
