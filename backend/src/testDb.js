import dotenv from 'dotenv';
dotenv.config();

import {
    insertTokenConfig,
    getTokenConfigsByChain,
    closePool
} from './services/database.js'

async function test() {
    try {
        console.log('Testing database service...\n');

        // Insert USDC on Ethereum
        console.log('Inserting Ethereum USDC...');
        await insertTokenConfig({
            chain: 'ethereum',
            contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            decimals: 6
        });
        console.log('✅ Inserted\n');

        // Insert USDT on Ethereum
        console.log('Inserting Ethereum USDT...');
        await insertTokenConfig({
            chain: 'ethereum',
            contract_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            symbol: 'USDT',
            decimals: 6
        });
        console.log('✅ Inserted\n');

        // Get all Ethereum tokens
        console.log('Fetching all Ethereum tokens...');
        const ethTokens = await getTokenConfigsByChain('ethereum');
        console.log('Ethereum tokens:');
        console.table(ethTokens);

        console.log('\n✅ Database service test passed!');
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    } finally {
        await closePool();
    }
}

test();