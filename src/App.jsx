import { useEffect, useState } from 'react'
import { useWallet } from './hooks/useWallet'
import { useCampaigns } from './hooks/useCampaigns'
import { isSupportedChain } from './constants'
import { Alert } from './components/Alert'
import AccountDetails from './components/AccountDetails'
import ChainList from './components/ChainList'
import UnsupportedChainBanner from './components/UnsupportedChainBanner'
import CampaignList from './components/CampaignList'
import CreateCampaignForm from './components/CreateCampaignForm'
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
    error: walletError,
    chainError,
    isUnsupportedChain,
    connect,
    disconnect,
    switchChain,
    refreshBalance,
    dismissError: dismissWalletError,
  } = useWallet()

  const campaigns = useCampaigns({ account, chainId })
  const [showDisconnectNote, setShowDisconnectNote] = useState(false)
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

  const isSupported = chainId !== null && isSupportedChain(chainId)
  const showChainError = Boolean(account) && isUnsupportedChain
  const isBusy = campaigns.tx.state === 'signing' || campaigns.tx.state === 'pending'

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <span className="brand">
            <span className="brand__mark">FR</span>
            FundRally
          </span>
          <h1 className="app__title">Fund ideas on-chain</h1>
          <p className="app__subtitle">
            Launch a campaign, back it with testnet ETH, and track every contribution on-chain.
          </p>
        </div>

        <div className="app__actions">
          {account ? (
            <button type="button" className="btn btn--danger" onClick={disconnect}>
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect wallet'}
            </button>
          )}
        </div>
      </header>

      {!hasWallet ? (
        <Alert tone="warning" title="No wallet detected">
          Install MetaMask or another injected EVM wallet to use FundRally.
        </Alert>
      ) : null}

      {walletError ? (
        <Alert title="Error" onDismiss={dismissWalletError}>
          {walletError}
        </Alert>
      ) : null}

      {showDisconnectNote ? (
        <Alert tone="info" title="Disconnected" onDismiss={() => setShowDisconnectNote(false)}>
          Your account, network and balance were cleared from this page. MetaMask does not allow a
          website to revoke site access, so use the MetaMask site controls to revoke it there.
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

      <section className="card">
        <div className="card__header">
          <h2>Campaign contract</h2>
          <span className="pill pill--muted">Solidity</span>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="campaign-contract">
            Contract address
          </label>
          <input
            id="campaign-contract"
            className="field__input"
            type="text"
            spellCheck="false"
            placeholder="0x..."
            value={campaigns.contractAddress}
            onChange={(event) => campaigns.setContractAddress(event.target.value)}
          />
          <span className={`field__hint ${campaigns.isValidAddress ? 'field__hint--ok' : ''}`}>
            {campaigns.contractAddress.trim().length === 0
              ? 'Paste the deployed crowdfunding contract address. It is saved in this browser.'
              : campaigns.isValidAddress
                ? 'Valid address.'
                : 'That is not a valid EVM address.'}
          </span>
        </div>

        {campaigns.error ? (
          <Alert title="Contract error" onDismiss={campaigns.dismissError}>
            {campaigns.error}
          </Alert>
        ) : null}

        {campaigns.tx.state === 'confirmed' ? (
          <Alert tone="info">
            {campaigns.tx.label} confirmed. Transaction hash {campaigns.tx.hash}.
          </Alert>
        ) : null}

        <div className="app__grid">
          <div>
            <h3 className="section-title">Campaigns</h3>
            <CampaignList
              campaigns={campaigns.campaigns}
              loadState={campaigns.loadState}
              account={account}
              canWrite={campaigns.canWrite}
              isBusy={isBusy}
              onContribute={campaigns.contribute}
              onWithdraw={campaigns.withdraw}
              onReload={campaigns.reload}
            />
          </div>

          <div>
            <h3 className="section-title">Launch a campaign</h3>
            {!account ? (
              <p className="card__footnote">Connect a wallet to create a campaign.</p>
            ) : !campaigns.isSupported && chainId !== null ? (
              <p className="card__footnote">Switch to a supported chain to create a campaign.</p>
            ) : !campaigns.isValidAddress ? (
              <p className="card__footnote">Add the contract address above to create a campaign.</p>
            ) : (
              <CreateCampaignForm
                canWrite={campaigns.canWrite}
                isBusy={isBusy}
                onCreate={campaigns.createCampaign}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
