export const SUPPORTED_CHAINS = [
  {
    chainId: 11155111,
    name: 'Sepolia',
    nativeCurrency: { symbol: 'ETH' },
    color: '#7c8db5',
  },
  {
    chainId: 84532,
    name: 'Base Sepolia',
    nativeCurrency: { symbol: 'ETH' },
    color: '#2f6bff',
  },
]

export function getChain(chainId) {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId) ?? null
}

export function getChainName(chainId) {
  return getChain(chainId)?.name ?? `Unknown network (chain ID ${chainId})`
}
