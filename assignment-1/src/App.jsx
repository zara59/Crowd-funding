import { useEffect, useState } from 'react'
import { useWallet } from './hooks/useWallet'
import { Alert } from './components/Alert'
import AccountDetails from './components/AccountDetails'
import './App.css'

export default function App() {
  const {
    hasWallet,
    account,
    chainId,
    balance,
    balanceUpdatedAt,
    isConnecting,
    isFetchingBalance,
    error,
    connect,
    refreshBalance,
    dismissError,
  } = useWallet()

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopyAddress = async () => {
    if (!account) return
    try {
      await navigator.clipboard.writeText(account)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Assignment 1 — Wallet Connect</h1>
          <p className="app__subtitle">
            Connect MetaMask and watch your account, chain ID and balance update live.
          </p>
        </div>

        <div className="app__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect wallet'}
          </button>
        </div>
      </header>

      {!hasWallet ? (
        <Alert tone="warning" title="No wallet detected">
          Install MetaMask (or another injected EVM wallet) to use this app.
        </Alert>
      ) : null}

      {error ? (
        <Alert title="Error" onDismiss={dismissError}>
          {error}
        </Alert>
      ) : null}

      <div className="app__grid app__grid--single">
        <AccountDetails
          account={account}
          chainId={chainId}
          balance={balance}
          balanceUpdatedAt={balanceUpdatedAt}
          isFetchingBalance={isFetchingBalance}
          onRefreshBalance={() => refreshBalance()}
          onCopyAddress={handleCopyAddress}
          copied={copied}
        />
      </div>
    </div>
  )
}
