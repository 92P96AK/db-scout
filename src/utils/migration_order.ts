import { IPostgresTableRes } from '../interface'

export class MigrationOrder {
  constructor() {}
  checkCircularDependency(tables: Array<IPostgresTableRes>): Array<Array<IPostgresTableRes>> {
    try {
      let dependentTables: Array<Array<IPostgresTableRes>> = []
      let testedTablelength = 0
      const tableLength = tables.length
      while (tables.length) {
        if (testedTablelength === tableLength) {
          break
        }
        const initialElement = tables[0]
        if (!initialElement.f_keys.length) {
          tables = tables.slice(1)
        } else {
          const commontables: Array<IPostgresTableRes> = []
          const fkeysOf1 = initialElement.f_keys.map((f) => f.table_name)
          for (let t of tables) {
            const fkeysOf2 = t.f_keys.map((fk) => fk.table_name)
            if (fkeysOf1.includes(t.name) && fkeysOf2.includes(initialElement.name) && initialElement.name !== t.name) {
              commontables.push(...[t, initialElement])
            }
          }
          if (commontables.length) {
            dependentTables.push(commontables)
          }
          tables = tables.slice(1)
        }
        testedTablelength++
      }
      return dependentTables
    } catch (error) {
      throw new Error(error)
    }
  }
  getMigrationOrder(tables: Array<IPostgresTableRes>): Array<IPostgresTableRes> {
    try {
      let tableOrder: Array<IPostgresTableRes> = []
      let checkedTables: Array<string> = []
      while (tables.length) {
        const initialElement = tables[0]
        tables = tables.slice(1)
        if (!(initialElement.f_keys.length > 0)) {
          checkedTables.unshift(initialElement.name)
          tableOrder.unshift(initialElement)
        } else {
          const fkey_tables = initialElement.f_keys
            .map((fk) => fk.constraint_values.split('REFERENCES ')[1]?.split('(')[0])
            .filter((f_k) => !checkedTables.includes(f_k))
          if (!(fkey_tables.length > 0)) {
            checkedTables.push(initialElement.name)
            tableOrder.push(initialElement)
          } else {
            tables.push(initialElement)
          }
        }
      }
      return tableOrder
    } catch (error) {
      throw new Error(error)
    }
  }
}
