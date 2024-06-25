const DBSCOUT_SYSTEM_INFO_QUERY = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'MigrationStatus'
    ) THEN
        CREATE TYPE "MigrationStatus" AS ENUM ('IDLE','SUCCESS', 'ROLLBACKED');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public."_dbscout_migrations" (
    "id" VARCHAR(36) NOT NULL ,
   "checksum" VARCHAR(64) NOT NULL ,
   "finished_at" TIMESTAMP WITH TIME ZONE ,
   "migration_name" VARCHAR(255) NOT NULL ,
   "logs" "text" ,
   "status" "MigrationStatus" NOT NULL DEFAULT 'IDLE' ,
   "rolled_back_at" TIMESTAMP WITH TIME ZONE ,
   "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() ,
   "completed_at" TIMESTAMP WITH TIME ZONE ,
   
     CONSTRAINT "_dbscout_migrations_pkey" PRIMARY KEY ("id")
   );
`

export const dbscout = {
  system_info: DBSCOUT_SYSTEM_INFO_QUERY,
}
