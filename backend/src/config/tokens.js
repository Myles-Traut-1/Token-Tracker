// Token configurations for Ethereum and Tron
// These are the contracts we want to track

export const TOKEN_CONFIGS = {
    ethereum: [
        {
            symbol: 'USDC',
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
            decimals: 6
        },
        {
            symbol: 'USDT',
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            decimals: 6
        }
    ],
    tron: [
        {
            symbol: 'USDT',
            address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
            decimals: 6,
        },
        {
            symbol: 'USDC',
            address: 'TEkxiTehnzSmSe2XqrBj4w32RCN3rW3KxJ',
            decimals: 6,
        },
    ]
}

export function getTokenAddressesForChain(chain) {
    const token_configs = TOKEN_CONFIGS[chain] || [];
    return token_configs.map(t => t.address.toLowerCase());
}

export function getTokenByAddress(address, chain) {
    const token_configs = TOKEN_CONFIGS[chain] || [];
    return token_configs.find(t => t.address.toLowercase() === address.toLowerCase());
}