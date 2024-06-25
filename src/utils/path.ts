import path from 'path'

export class Path {
  constructor() {}

  public join(start: string, end: string) {
    return path.join(start, end)
  }
  public joinWithCwd(dir: string) {
    return path.join(process.cwd(), dir)
  }
}
