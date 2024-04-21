/*
@sourceDbUrl is a source database url
@outputDirectory is a folder location where generated migration are created
*/

export interface Props {
  sourceDbUrl: string
  destinationDbUrl?: string
  outputDirectory?: string
}
