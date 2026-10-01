import { useEffect, useState } from 'react'
import { useWallet } from './hooks/useWallet'
import { isSupportedChain } from './constants'
import { Alert } from './components/Alert'
import AccountDetails from './components/AccountDetails'
import ChainList from './components/ChainList'
import UnsupportedChainBanner from './components/UnsupportedChainBanner'
import StudentRegistry from './components/StudentRegistry'
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
    pendingChainId,
    error,
    chainError,
    isUnsupportedChain,
    connect,
    disconnect,
    switchChain,
    refreshBalance,
    dismissError,
  } = useWallet()

  const [showDisconnectNote, setShowDisconnectNote] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const handleConnect = async () => {
    setShowDisconnectNote(false)
    await connect()
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDisconnectNote(true)
  }

  const handleCopyAddress = async () => {
    if (!account) return
    try {
      await navigator.clipboard.writeText(account)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const isSupported = chainId !== null && isSupportedChain(chainId)
  const showChainError = Boolean(account) && isUnsupportedChain

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Assignment 2 — Wallet Controls</h1>
          <p className="app__subtitle">
            Disconnect, a supported chain list with recovery from unsupported networks, and a
            refreshable balance.
          </p>
        </div>

        <div className="app__actions">
          {account ? (
            <button type="button" className="btn btn--danger" onClick={handleDisconnect}>
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect wallet'}
            </button>
          )}
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

      {showDisconnectNote ? (
        <Alert tone="info" title="Disconnected" onDismiss={() => setShowDisconnectNote(false)}>
          The dapp session was cleared and your account, network and balance were removed from
          this page. MetaMask does not allow a website to revoke site access, so use the MetaMask
          site controls if you want to revoke it there too.
        </Alert>
      ) : null}

      {showChainError ? (
        <UnsupportedChainBanner
          chainId={chainId}
          message={chainError}
          pendingChainId={pendingChainId}
          onSwitch={switchChain}
        />
      ) : null}

      <div className="app__grid">
        <AccountDetails
          account={account}
          chainId={chainId}
          balance={balance}
          balanceUpdatedAt={balanceUpdatedAt}
          isFetchingBalance={isFetchingBalance}
          isSupported={isSupported}
          onRefreshBalance={() => refreshBalance()}
          onCopyAddress={handleCopyAddress}
          copied={copied}
        />

        <ChainList
          chainId={chainId}
          pendingChainId={pendingChainId}
          onSwitch={switchChain}
          disabled={!account}
        />
      </div>

      <StudentRegistry account={account} chainId={chainId} />
    </div>
  )
}
