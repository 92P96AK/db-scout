# DB-SCOUT

DB-SCOUT is a Node.js package designed to simplify PostgreSQL database schema migration by generating migration files based on an existing schema.

## Features

- **Automatic Migration Generation**: DB-SCOUT automatically generates migration files based on your existing PostgreSQL database schema.
- **Database Agnostic**: Works specifically with PostgreSQL databases.
- **Customizable Configuration**: Easily configure DB-SCOUT to suit your project's needs.

## Installation

You can install DB-SCOUT via npm:

```bash
npm install db-scout
```

### Configuration

# Configuration

DB-SCOUT can be configured using a `dbscout.json` file in your project's root directory. Here's an example configuration:

```json
{
  "sourceDbUrl": "YOUR_POSTGRESQL_SOURCE_DATABASE_URL",
  "destinationDbUrl": "YOUR_POSTGRESQL_DESTINATION_DATABASE_URL",
  "outputDirectory": "./migrations"
}

 sourceDbUrl: The URL of your PostgreSQL database.
 outputDirectory: The directory where migration files will be generated.
```

```javascript
import { DbScout } from 'db-scout'
const dbScout= new DbScout({
 sourceDbUrl: "",
 outputDirectory: "",
 destinationDbUrl: ""
})

to get migration files use 

await dbScout.getMigration();

Your migration files will be created in a specified directory.

also to migrate generated migration files to destination url simply use

await dbScout.runMigration() 
it will run migration in transaction so if any error occurred it will roll back.

```

## License

This project is licensed under the MIT License.

## Acknowledgements

DB-SCOUT is built using Node.js and PostgreSQL.

## Next Version Targets

In the next version of DB-SCOUT, I plan to include support for additional databases, including MySQL and others. Stay tuned for updates!
