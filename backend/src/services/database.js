import pkg from 'pg';

const { Pool } = pkg;

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/token_tracker',
});

console.log("Database Pool Initialized");

// CREATE TABLE IF NOT EXISTS transfers (
//     id BIGSERIAL PRIMARY KEY,
//     chain VARCHAR(255) NOT NULL,
//     from_address VARCHAR(255) NOT NULL,
//     to_address VARCHAR(255) NOT NULL,
//     amount VARCHAR(78) NOT NULL,
//     tx_hash VARCHAR(255) NOT NULL,
//     block_number BIGINT NOT NULL,
//     timestamp BIGINT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

/** TRANSFER TABLE FUNCTIONS */

// Helper function: Insert a single transfer
export async function insertTransfer(transferData) {
    const { chain, from_address, to_address, amount, tx_hash, block_number, timestamp } = transferData;

    const query = `
        INSERT INTO transfers (chain, from_address, to_address, amount, tx_hash, block_number, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (tx_hash) DO NOTHING
        RETURNING idx
    `;

    try {
        const result = await pool.query(query, [
            chain,
            from_address,
            to_address,
            amount,
            tx_hash,
            block_number,
            timestamp
        ]);
        return result.rows[0];
    } catch (err) {
        console.error("Error inserting transfer", err.message)
        throw err;
    }
}

// Helper function: Insert multiple transfers (batch)
export async function insertTransfers(transfersArray) {
    const query = `
        INSERT INTO transfers (chain, from_address, to_address, amount, tx_hash, block_number, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (tx_hash) DO NOTHING
        RETURNING id
    `;

    const results = [];

    for (const transfer of transfersArray) {
        try {
            const result = await pool.query(query, [
                transfer.chain,
                transfer.from_address,
                transfer.to_address,
                transfer.amount,
                transfer.tx_hash,
                transfer.block_number,
                transfer.timestamp
            ]);
            if (result.rows[0]) {
                results.push(result.rows[0]);
            }
        } catch (err) {
            console.error("Error inserting transfer", err.message);
            // Continue with next transfer instead of stopping
        }
    }

    return results;
}

// Helper function: Get transfers for an address
export async function getTransfersByAddress(address, chain = null, limit = 100, offset = 0) {
    // normalize address to lowercase for consistent querying
    const normalizedAddress = address.toLowerCase();

    let query = `
    SELECT 
        id, 
        chain, 
        from_address, 
        to_address, 
        amount, 
        tx_hash, 
        block_number, 
        timestamp,
        created_at 
    FROM transfers
    WHERE (from_address = $1 OR to_address = $1)
    `;

    const params = [normalizedAddress];

    if (chain) {
        query += ` AND chain = $${params.length + 1}`;
        params.push(chain);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {
        const result = await pool.query(query, params);
        return result.rows
    } catch (err) {
        console.error("Error fetching transfers by address", err.message);
        throw err;
    }
}

// Helper function: Get transfers FROM an address
export async function getTransferFromAddress(address, chain = null, limit = 100, offset = 0) {
    const normalizedAddress = address.toLowerCase();

    let query = `
    SELECT
        id,
        chain,
        from_address,
        to_address,
        amount,
        tx_hash,
        block_number,
        timestamp,
        created_at
    FROM transfers
    WHERE (from_address = $1)
`;
    const params = [normalizedAddress];

    if (chain) {
        query += ` AND chain = $${params.length + 1}`
        params.push(chain);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.lenth + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (err) {
        console.error("Error fetching transfers from address", err.message);
        throw err;
    }
}

// Helper function: Get transfers TO an address
export async function gerTransfersToAddress(address, chain = null, limit = 100, offset = 0) {
    const normalizedAddress = address.toLowerCase();

    let query = `
    SELECT
        id,
        chain,
        from_address,
        to_address,
        amount,
        tx_hash,
        block_number,
        timestamp,
        created_at
    FROM transfers
    WHERE (to_address = $1)
    `;

    const params = [normalizedAddress];

    if (chain) {
        query += ` AND chain = $${params.length + 1}`;
        params.push(chain);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offest);

    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (err) {
        console.error("Error fetching transfers to address", err.message);
        throw err;
    }
}

// Helper function: Get the last processed block
export async function getLastProcessedBlock(chain) {
    let query = `
        SELECT MAX (block_number) AS last_block
        FROM transfers
        WHERE (chain = $1) 
    `;

    try {
        const result = await pool.query(query, [chain]);
        return result.rows[0]?.last_block || 0;
    } catch (err) {
        console.error("Error fetching last processed block", err.message);
        throw err;
    }
}

// Helper function: Check if transfer exists (by tx_hash)
export async function transferExists(tx_hash) {
    let query = `
    SELECT id FROM transfers WHERE tx_hash = $1 LIMIT 1
    `;

    try {
        const result = await pool.query(query, [tx_hash]);
        return result.rows.length > 0;
    } catch (err) {
        console.error("Error checking if transfer exists", err.message);
        throw err;
    }
}

/** TOKEN CONFIG TABLE FUNCTIONS */

// CREATE TABLE IF NOT EXISTS token_configs (
//     idx SERIAL PRIMARY KEY,
//     chain VARCHAR(255) NOT NULL,
//     contract_address VARCHAR(255) NOT NULL,
//     symbol VARCHAR(255) NOT NULL,
//     decimals INT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     UNIQUE(chain, contract_address)
// );

// Helper function: Insert token config
export async function insertTokenConfig(tokenData) {
    const { chain, contract_address, symbol, decimals } = tokenData;

    let query = `
        INSERT INTO token_configs (chain, contract_address, symbol, decimals)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (chain, contract_address) DO UPDATE
        SET symbol = $3, decimals = $4
        RETURNING idx 
    `;

    const params = [chain, contract_address, symbol, decimals];

    try {
        const result = await pool.query(query, params);
        return result.rows[0];
    } catch (err) {
        console.error("Error inserting token config", err.message);
        throw err;
    }
}

// Helper function: Get token config
export async function getTokenConfig(chain, contract_address) {
    const normalizedContractAddress = contract_address.toLowerCase();

    let query = `
        SELECT * FROM token_configs
        WHERE chain = $1 AND contract_address = $2
    `;

    const params = [chain, normalizedContractAddress];

    try {
        const result = await pool.query(query, params);
        return result.rows[0] || null;
    } catch (err) {
        console.error("Error fetching token config", err.message);
        throw err;
    }
}

// Helper function: Get all token configs for a chain
export async function getTokenConfigsByChain(chain) {
    let query = `
        SELECT * FROM token_configs
        WHERE chain = $1
    `;

    try {
        const result = await pool.query(query, [chain]);
        return result.rows;
    } catch (err) {
        console.error("Error fetching token configs by chain", err.message);
        throw err;
    }
}

// Graceful shutdown
export async function closePool() {
    await pool.end();
    console.log("Database pool closed");
}