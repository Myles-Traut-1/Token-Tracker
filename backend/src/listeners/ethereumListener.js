// 1. Set up the RPC connection
// 2. Get the last block we processed
// 3. Start a polling loop that runs every 12 seconds:
//    a. Get current block number from blockchain
//    b. If we've already processed this block, stop
//    c. Otherwise, fetch all logs for new blocks
//    d. For each log, decode the transfer event
//    e. Insert into database
//    f. Update lastProcessedBlock
// 4. Handle errors gracefully and continue 

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { insertTransfer, getLastProcessedBlock } from '../services/database.js';
import { getTokenAddressesForChain, getTokenByAddress } from '../config/tokens.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const TRANSFER_EVENT_ABI = 'event Transfer(address indexed from, address indexed to, uint256 value)';

// Topic for Transfer event: keccak256("Transfer(address,address,uint256)") = exact Transfer signature
const TRANSFER_EVENT_TOPIC = ethers.id('Transfer(address,address,uint256)');

const pollTime = 12000;

export async function startEthereumListener() {
    // Create provider
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'chainId:', network.chainId.toString());

    const tokenAddresses = getTokenAddressesForChain('ethereum').map(addr => ethers.getAddress(addr)); // Normalize addresses
    console.log('🔷 Ethereum listener tracking:', tokenAddresses);

    // Get the latest block number to start from
    let lastProcessedBlock = Number(await getLastProcessedBlock('ethereum'));
    console.log('Last processed block from DB:', lastProcessedBlock);

    const currentBlock = await provider.getBlockNumber();
    console.log(currentBlock);

    if (lastProcessedBlock === 0) {
        lastProcessedBlock = currentBlock - 1; // -1 to include current block
    }

    console.log('lastProcessedBlock from DB:', lastProcessedBlock)

    console.log(`🔷 Starting Ethereum listener from block ${parseInt(lastProcessedBlock) + 1}...`);

    // Create an Interface with the Transfer event
    const iface = new ethers.Interface([
        TRANSFER_EVENT_ABI
    ]);

    console.log('Transfer topic:', TRANSFER_EVENT_TOPIC);

    // Start polling loop
    setInterval(async () => {
        try {
            let latestBlock = await provider.getBlockNumber();

            console.log(`Latest block: ${latestBlock}, Last processed block: ${lastProcessedBlock}`);

            if (latestBlock <= lastProcessedBlock) {
                return; // No new blocks, skip
            }

            console.log(`🔷 Processing blocks ${parseInt(lastProcessedBlock) + 1} to ${latestBlock}`);

            const logs = await provider.getLogs({
                fromBlock: currentBlock - 1,
                toBlock: currentBlock,
                address: tokenAddresses, // Filter for our tracked token addresses
                topics: [TRANSFER_EVENT_TOPIC] // Filter for Transfer events
            });

            console.log(`🔷 Found ${logs.length} transfer events`);

            for (const log of logs) {

                try {
                    const decodedLogs = iface.parseLog(log);
                    console.log(log.blockNumber, log.address)
                    console.log(decodedLogs);

                    await insertTransfer({
                        chain: 'ethereum',
                        contract_address: log.address,
                        from_address: decodedLogs.args[0],
                        to_address: decodedLogs.args[1],
                        amount: decodedLogs.args[2].toString(),
                        tx_hash: log.transactionHash,
                        block_number: log.blockNumber,
                        timestamp: Math.floor(Date.now() / 1000)
                    });
                } catch (err) {
                    console.error('Error processing log', err.message);
                }

            }

            lastProcessedBlock = latestBlock;

        } catch (err) {
            console.error('Error in Ethereum listener:', err.message);
        }
    }, pollTime);

    console.log('✅ Ethereum listener started');
}

startEthereumListener();

