import fs from 'fs'

export function readFileSync<T>(filePath: string): T {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    throw error
  }
}
