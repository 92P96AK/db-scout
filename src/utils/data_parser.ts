const getDefaultData = (str: string): boolean | string | number | null => {
  if (str === 'false' || str === 'true') {
    return str !== 'false'
  }

  if (['null', undefined, null].includes(str)) {
    return null
  }
  if (['number', 'boolean', 'object'].includes(typeof str)) {
    return str
  }
  const integer = parseInt(str)
  const floatinginteger = parseFloat(str)
  if (integer || floatinginteger) {
    if (str.includes('.')) {
      return floatinginteger
    }
    return integer
  }
  str = str?.split('::')?.[0]
  if (str) {
    str.split("'").length > 1 ? str.split("'")[1] : str
  }
  str = str?.split('::')?.[0]?.split("'")[1]
  return str
}

const QueryConstructorDataParser = (value: any) => {
  if (value === 'false' || value === 'true' || typeof value === 'boolean') {
    return !(value === 'false')
  }
  return value ? `'${value}'` : value === (null || undefined) ? value : 'null'
}
const DataParser = {
  getDefaultData,
  QueryConstructorDataParser,
}

export default DataParser
