import fs, { readFileSync } from 'fs';
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

// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import pkg from 'pg';

// const { Client } = pkg;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// console.log('🔍 Script starting...');
// console.log('__dirname:', __dirname);

// async function initializeDatabase() {
//     try {
//         console.log('📍 Inside initializeDatabase function');

//         const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/token_tracker';
//         console.log('📍 Connection string:', connectionString);

//         const client = new Client({
//             connectionString: connectionString,
//         });

//         console.log('📍 Client created, attempting to connect...');
//         await client.connect();
//         console.log('✅ Connected to PostgreSQL!');

//         const schemaPath = path.join(__dirname, 'schema.sql');
//         console.log('📍 Schema path:', schemaPath);
//         console.log('📍 Schema file exists?', fs.existsSync(schemaPath));

//         const schema = fs.readFileSync(schemaPath, 'utf-8');
//         console.log('📍 Schema loaded, executing SQL...');

//         await client.query(schema);
//         console.log('✅ Database initialized successfully!');

//         await client.end();
//         console.log('✅ Connection closed');

//     } catch (err) {
//         console.error('❌ Error:', err);
//         console.error('Error message:', err.message);
//         console.error('Error stack:', err.stack);
//         process.exit(1);
//     }
// }

// console.log('📍 About to call initializeDatabase()');
// initializeDatabase();
// console.log('📍 initializeDatabase() called (async)');