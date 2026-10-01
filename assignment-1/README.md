# Assignment 1 — Wallet Connect

Show the connected account, chain ID and balance on the UI instead of logging them, and keep them
in sync when the user switches accounts or chains.

## Run

```bash
npm install
npm run dev
```

## What it does

- Connects to an injected EVM wallet (MetaMask) with `eth_requestAccounts`
- Restores an already-approved session silently on load with `eth_accounts`
- Renders account address, network name, chain ID and ETH balance
- Re-reads everything on the `accountsChanged` and `chainChanged` events
- Includes a manual **Refresh balance** button and copy-to-clipboard for the address

## Structure

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Page layout and header actions |
| `src/hooks/useWallet.js` | Connection state, wallet listeners, balance fetching |
| `src/components/AccountDetails.jsx` | Account / network / balance panel |
| `src/components/Alert.jsx` | Error and warning banners |
| `src/constants.js` | Chain metadata used to resolve network names |
| `src/utils/format.js` | Address, balance and time formatting |
