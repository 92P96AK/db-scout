import * as crypto from 'crypto'
import { File } from './file'
export class Checksum {
  private filePath?: string
  private file: File

  constructor(filePath?: string) {
    this.file = new File()
    if (filePath) this.filePath = filePath
  }
  public createChecksumWithFileUrl(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!this.filePath) {
        throw new Error('file path not found')
      }
      const hash = crypto.createHash('sha256')
      const stream = await this.file.createReadStream(this.filePath)
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
      try {
        const prevChecksum = await this.createChecksumWithFileUrl()
        if (checksum !== prevChecksum) {
          throw new Error('Last migration file has been changed')
        }
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
  public createChecksumWithData(data: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const hash = crypto.createHash('sha256')
        hash.update(data)
        resolve(hash.digest('hex'))
      } catch (error) {
        reject(error)
      }
    })
  }
  public checkChecksumWithData(sourceData: string, destinationData: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const sourceChecksum = await this.createChecksumWithData(sourceData)
        const destinationChecksum = await this.createChecksumWithData(destinationData)
        resolve(sourceChecksum === destinationChecksum)
      } catch (error) {
        reject(error)
      }
    })
  }
}
