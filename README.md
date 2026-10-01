# FundRally

A crowdfunding dApp where campaigns, contributions and withdrawals are recorded on-chain. React and
Vite frontend built on `ethers` v6 and MetaMask.

## Contract interface

The frontend expects a contract with this interface. Adjust `src/constants.js` if your contract
differs.

```solidity
function campaignCount() view returns (uint256);

function getCampaign(uint256 _id) view returns (
    address creator,
    string title,
    string description,
    uint256 target,
    uint256 raised,
    uint256 deadline,
    bool withdrawn,
    address[] contributors
);

function createCampaign(
    string _title,
    string _description,
    uint256 _target,
    uint256 _durationDays
) returns (uint256);

function contribute(uint256 _id) payable;
function withdraw(uint256 _id);
```

Paste the deployed contract address into the app. It is saved in `localStorage`, so the same
frontend works against any deployment.

## Run

```bash
npm install
npm run dev
```

Also available: `npm run build` for a production bundle and `npm run lint` for ESLint.

## Features

- Connect an injected EVM wallet (MetaMask) with `eth_requestAccounts`, plus a silent
  `eth_accounts` session restore on page load
- Live account, network, chain ID and balance, kept in sync by the `accountsChanged` and
  `chainChanged` listeners
- Disconnect button that clears the dapp session
- Supported chain list (Sepolia 11155111, Base Sepolia 84532) with one-click network switching
- Unsupported network error followed by a prompt to switch back to a supported chain
- Refresh balance button showing the time of the last update
- Campaign list with raised versus target progress, contributor count and deadline
- Launch a campaign with a title, description, ETH target and duration in days
- Contribute ETH to an open campaign, and withdraw to the creator once a funded campaign ends

## Structure

| Path | Purpose |
| --- | --- |
| `src/App.jsx` | Page layout and header actions |
| `src/hooks/useWallet.js` | Connection state, wallet listeners, balance fetching, chain switching |
| `src/hooks/useCampaigns.js` | Campaign reads and create, contribute and withdraw transactions |
| `src/components/CampaignList.jsx` | Campaign cards with progress and contribution form |
| `src/components/CreateCampaignForm.jsx` | Launch a campaign form |
| `src/components/AccountDetails.jsx` | Account, network and balance panel |
| `src/components/ChainList.jsx` | Supported chain list |
| `src/components/UnsupportedChainBanner.jsx` | Unsupported network error and switch-back prompt |
| `src/constants.js` | Supported networks and contract ABI |
| `src/utils/format.js` | Address, balance, date and percentage formatting |

## Deployment

`.github/workflows/pages.yml` builds the app and publishes it to GitHub Pages. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Requirements

MetaMask on a testnet account. Testnet ETH can be requested from a Sepolia faucet.
