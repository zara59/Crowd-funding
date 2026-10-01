# Web3 Wallet Assignments

Two independent Vite + React frontends built on `ethers` v6 and MetaMask.

| Folder | Assignment | What it covers |
| --- | --- | --- |
| `assignment-1/` | Assignment 1 | Connect a wallet and display account, chain ID and balance on the UI, updating live when the account or chain changes |
| `my-react-app/` | Assignment 2 | Disconnect button, supported chain list with unsupported-chain recovery, refresh balance button, and a Student Registry contract panel |

Each app is self-contained and installs its own dependencies.

## Run either app

```bash
cd assignment-1      # or: cd my-react-app
npm install
npm run dev
```

Other scripts: `npm run build` for a production bundle and `npm run lint` for ESLint.

## Shared behaviour

- Connection uses `eth_requestAccounts`, with a silent `eth_accounts` restore on page load
- `accountsChanged`, `chainChanged` and `disconnect` listeners keep the UI in sync with the wallet
- Balances come from `BrowserProvider.getBalance()` and are formatted with `formatUnits(wei, 18)`
- Supported networks: Sepolia (11155111) and Base Sepolia (84532), defined in `src/constants.js`

## Assignment 2 extras

- **Disconnect** clears the dapp session. MetaMask does not expose a programmatic disconnect, so
  the UI explains that site access must be revoked from the MetaMask site controls.
- **Unsupported network flow**: an unsupported chain ID raises an error card, followed by a prompt
  offering every supported chain. Switching uses `wallet_switchEthereumChain` and falls back to
  `wallet_addEthereumChain` when MetaMask answers with error `4902`.
- **Refresh balance** re-reads the balance on demand and shows the time of the last update.
- **Student Registry** panel reads `registered(address)` and `getStudent(address)` and writes
  `register(name, age, course)`. The contract address is pasted into the UI and stored in
  `localStorage`, so the app works with any deployment.

## Requirements

MetaMask on a testnet account. Testnet ETH can be requested from a Sepolia faucet.
