export const DBSCOUT_DB_CREATE_TABLE_QUERY = `
CREATE TYPE "MigrationStatus" AS ENUM ('IDLE','SUCCESS', 'ROLLBACKED'); 

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
