// npm run migrate
//         │
//         ▼
// migrate.ts start
//         │
//         ▼
// Create migrations table
//         │
//         ▼
// Read migrations folder
//         │
//         ▼
// Check which migrations already ran
//         │
//         ▼
// Find pending migrations
//         │
//         ▼
// Run each SQL file
//         │
//         ▼
// Store filename in migrations table
//         │
//         ▼
//     Done ✅


import path from "node:path"
import { pool } from "../lib/db"
import fs from "node:fs"
import { logger } from "../lib/logger"

const MIGRATIONS_DIR = path.join(process.cwd(), "src", "migrations")

const CREATE_MIGRATION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS migrations(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`

type MigrationRow = {
    name: string
}

async function getExecutedMigrations(): Promise<string[]> {
    const result = await pool.query<MigrationRow>(
        'SELECT name FROM migrations ORDER BY name'
    )

    return result.rows.map((row: MigrationRow) => row.name)

}

function getMigrationFiles(): string[] {
    return fs.readdirSync(MIGRATIONS_DIR)
        .filter((filename) => filename.endsWith('.sql'))
        .sort()
}

async function runMigration(fileName: string): Promise<void> {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, fileName), 'utf-8')
    const client = await pool.connect()

    try {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query(
            'INSERT INTO migrations(name) VALUES($1)',
            [fileName]
        )
        await client.query('COMMIT')
        logger.info(`migration run: ${fileName}`)
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

async function migrate(): Promise<void> {
    await pool.query(CREATE_MIGRATION_TABLE_SQL)

    const executed = new Set(await getExecutedMigrations())
    const pending = getMigrationFiles().filter((file) => !executed.has(file))
    if (pending.length === 0) {
        logger.info('no pending migration')
        return
    }

    for (const fileName of pending) {
        await runMigration(fileName)
    }

    logger.info(`migration completed. `)
}

migrate().catch((error) => {
    logger.error({ err: error }, 'Migration failed.')
    process.exit(1)
}).finally(async () => {
    await pool.end()
})