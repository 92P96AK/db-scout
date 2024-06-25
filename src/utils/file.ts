import fs from 'fs'
import { IFile } from '../interface'

export class File {
  constructor() {}
  public readFileSync<T>(filePath: string) {
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch (error) {
      throw error
    }
  }

  public existsSync(filePath: string) {
    try {
      return fs.existsSync(filePath)
    } catch (error) {
      throw error
    }
  }
  
  public mkdirSync(dir: string) {
    try {
      return fs.mkdirSync(dir, { recursive: true })
    } catch (error) {
      throw error
    }
  }
  public readAndParseJsonFileSync<T>(filePath: string): T {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(fileContent)
    } catch (error) {
      throw error
    }
  }

  public createFile(file: IFile) {
    return new Promise((resolve, reject) => {
      fs.writeFile(file.filePath, file.data, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(`File ${file.filePath} created successfully.`)
        }
      })
    })
  }

  public async createFiles(files: Array<IFile>) {
    try {
      const promises = files.map((f) => this.createFile(f))
      await Promise.all(promises)
      return true
    } catch (error) {
      throw error
    }
  }

  public async createReadStream(filePath: string) {
    try {
      return fs.createReadStream(filePath)
    } catch (error) {
      throw error
    }
  }
}
