import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const { Client } = pkg;

// Get current directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/token_tracker',
    });

    try {
        console.log('Connecting to the database...');
        await client.connect();
        console.log('Connected!!');

        // read schema sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        console.log("Creating Tables and Indexes...");
        await client.query(schema);
        console.log('Database initialized successfully!');
    } catch (err) {
        console.log('Error initializing database:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}
console.log('About to call initializeDatabase()');
initializeDatabase();