/*
sourceDbUrl is a source database url
destinationUrl is a folder location where generated migration are created
*/

export interface Props {
  sourceDbUrl: string
  outputDirectory?: string
}
