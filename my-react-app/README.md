# Assignment 2 — Wallet Controls

Extend the wallet dashboard with a disconnect button, a supported chain list with recovery from
unsupported networks, a refreshable balance, and a Student Registry contract panel.

## Run

```bash
npm install
npm run dev
```

## Features

| Feature | Where |
| --- | --- |
| Live account, network, chain ID and balance | `src/hooks/useWallet.js`, `src/components/AccountDetails.jsx` |
| Disconnect button that clears the dapp session | `disconnect` in `src/hooks/useWallet.js` |
| Supported chain list with one-click switch | `src/components/ChainList.jsx` |
| Unsupported network error plus switch-back prompt | `src/components/UnsupportedChainBanner.jsx` |
| Refresh balance button | `AccountDetails.jsx` calling `refreshBalance()` |
| Student Registry reads and writes | `src/components/StudentRegistry.jsx` |

## How the unsupported chain flow works

`applyChainId` compares the current chain ID against `SUPPORTED_CHAINS`. When it finds no match it
stores a message in `chainError`, which renders the "Unsupported network" card with the error text
followed by a prompt offering every supported chain. Choosing one calls `wallet_switchEthereumChain`;
if the wallet does not know that network it falls back to `wallet_addEthereumChain` (MetaMask error
`4902`) and retries the switch.

## Notes

- MetaMask has no programmatic disconnect, so the disconnect button clears the dapp session and
  explains that site access must be revoked from the MetaMask site controls.
- The contract address for the Student Registry panel is entered in the UI and stored in
  `localStorage` under `student-registry-address`.
- Add or remove networks in `src/constants.js`.
