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

DB-SCOUT can be configured using a `db-scout.config.json` file in your project's root directory. Here's an example configuration:

```json
{
  "databaseUrl": "YOUR_POSTGRESQL_DATABASE_URL",
  "outputDirectory": "./migrations"
}

 databaseUrl: The URL of your PostgreSQL database.
 outputDirectory: The directory where migration files will be generated.
 ```
 
 ```javascript
import { DbScout } from 'db-scout'

new DbScout({
  sourceDbUrl: "",
  destinationUrl: ""
}).getMigration();

Your migration files will be created in a specified directory, ready for use with your PostgreSQL database migration tool. 
```

## License

This project is licensed under the MIT License.

## Acknowledgements

DB-SCOUT is built using Node.js and PostgreSQL.

## Next Version Targets

In the next version of DB-SCOUT, I plan to include support for additional databases, including MySQL, MariaDB, MongoDB, and others. Stay tuned for updates!

