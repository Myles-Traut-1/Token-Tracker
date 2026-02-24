--Create transfers table

CREATE TABLE IF NOT EXISTS transfers (
    id BIGSERIAL PRIMARY KEY,
    chain VARCHAR(255) NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount VARCHAR(78) NOT NULL,
    tx_hash VARCHAR(255) NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--create indexed for fast queries

CREATE INDEX IF NOT EXISTS idx_transfers_from_chain_time
    ON transfers(from_address, chain, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_transfers_to_chain_time
    ON transfers(to_address, chain, timestamp DESC);  

CREATE INDEX IF NOT EXISTS idx_transfers_tx_hash 
    ON transfers(tx_hash);

CREATE INDEX IF NOT EXISTS idx_transfers_block ON transfers(chain, block_number);

--create token_configs table for metadata about tokens
CREATE TABLE IF NOT EXISTS token_configs (
    idx SERIAL PRIMARY KEY,
    chain VARCHAR(255) NOT NULL,
    contract_address VARCHAR(255) NOT NULL,
    symbol VARCHAR(255) NOT NULL,
    decimals INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chain, contract_address)
);
