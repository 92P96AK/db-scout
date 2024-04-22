import * as crypto from 'crypto'
import fs from 'fs'

export class Checksum {
  private filePath: string
  constructor(filePath: string) {
    this.filePath = filePath
  }
  public createChecksum(): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256')
      const stream = fs.createReadStream(this.filePath)
      stream.on('data', (data) => {
        hash.update(data)
      })

      stream.on('end', () => {
        const checksum = hash.digest('hex')
        resolve(checksum)
      })

      stream.on('error', (error) => {
        reject(error)
      })
    })
  }
  public checkChecksum(checksum: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const prevChecksum = await this.createChecksum()
      if (checksum !== prevChecksum) {
        throw new Error('Last migration file has been changed')
      }
      resolve(true)
    })
  }
}
