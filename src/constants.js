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

export const CROWDFUNDING_ABI = [
  'function campaignCount() view returns (uint256)',
  'function getCampaign(uint256 _id) view returns (tuple(address creator, string title, string description, uint256 target, uint256 raised, uint256 deadline, bool withdrawn, address[] contributors))',
  'function createCampaign(string _title, string _description, uint256 _target, uint256 _durationDays) returns (uint256)',
  'function contribute(uint256 _id) payable',
  'function withdraw(uint256 _id)',
  'event CampaignCreated(uint256 indexed id, address indexed creator, uint256 target, uint256 deadline)',
  'event ContributionReceived(uint256 indexed id, address indexed contributor, uint256 amount)',
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
