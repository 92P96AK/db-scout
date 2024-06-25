import { RelationalSchema } from 'uncertainjs'
import DataParser from './data_parser'

export const GenSeedQuery = async (datas: { [key: string]: Array<Object> }) => {
  return Object.keys(datas)
    .map((table_name) => {
      if (datas.hasOwnProperty(table_name)) {
        const tableObject = datas[table_name]
        return `INSERT INTO ${table_name} (${Object.keys(tableObject[0])
          .map((key) => `"${key}"`)
          .join(',')}) VALUES ${tableObject
          .map(
            (col) =>
              `(${Object.values(col)
                .map((value) => DataParser.QueryConstructorDataParser(value))
                .join(',')})`,
          )
          .join(',')}
      `
      }
      return null
    })
    .filter((d) => d !== null)
    .join(';')
}
