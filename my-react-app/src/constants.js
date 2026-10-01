export const SUPPORTED_CHAINS = [
  {
    chainId: 11155111,
    name: 'Sepolia',
    shortName: 'SEP',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
    testnet: true,
    color: '#7c8db5',
  },
  {
    chainId: 84532,
    name: 'Base Sepolia',
    shortName: 'BASE',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    testnet: true,
    color: '#2f6bff',
  },
]

export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS[0].chainId

export const STUDENT_REGISTRY_ABI = [
  'function getStudent(address _student) view returns (string name, uint256 age, string course)',
  'function register(string _name, uint256 _age, string _course)',
  'function registered(address) view returns (bool)',
]

export function toChainHex(chainId) {
  return `0x${Number(chainId).toString(16)}`
}

export function getChain(chainId) {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId) ?? null
}

export function isSupportedChain(chainId) {
  return getChain(chainId) !== null
}

export function getChainName(chainId) {
  return getChain(chainId)?.name ?? `Unknown network (chain ID ${chainId})`
}
