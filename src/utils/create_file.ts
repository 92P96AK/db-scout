import fs from 'fs'
import { IFile } from '../interface'

export function createFile(file: IFile) {
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

export async function createFiles(files: Array<IFile>) {
  try {
    const promises = files.map((f) => createFile(f))
    await Promise.all(promises)
    return true
  } catch (error) {
    throw error
  }
}
