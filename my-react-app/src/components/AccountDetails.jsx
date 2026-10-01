import { formatBalance, formatTime, shortenAddress } from '../utils/format'
import { getChainName } from '../constants'

function Row({ label, value, hint, children }) {
  return (
    <div className="detail">
      <span className="detail__label">{label}</span>
      <span className="detail__value">
        <span className="detail__text" title={hint ?? undefined}>
          {value}
        </span>
        {children}
      </span>
    </div>
  )
}

export default function AccountDetails({
  account,
  chainId,
  balance,
  balanceUpdatedAt,
  isFetchingBalance,
  isSupported,
  onRefreshBalance,
  onCopyAddress,
  copied,
}) {
  const activeChain = chainId !== null ? getChainName(chainId) : 'Not connected'

  return (
    <section className="card">
      <div className="card__header">
        <h2>Wallet details</h2>
        <span className={`pill ${isSupported ? 'pill--ok' : 'pill--warn'}`}>
          {chainId === null ? 'Disconnected' : isSupported ? 'Supported network' : 'Unsupported network'}
        </span>
      </div>

      <Row label="Account" value={account ? shortenAddress(account, 10, 8) : '--'} hint={account ?? undefined}>
        {account ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCopyAddress}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        ) : null}
      </Row>

      <Row label="Network" value={activeChain} hint={chainId !== null ? `Chain ID ${chainId}` : undefined}>
        <span className="tag">{chainId ?? '--'}</span>
      </Row>

      <Row
        label="Balance"
        value={`${formatBalance(balance)} ETH`}
        hint={balanceUpdatedAt ? `Updated at ${formatTime(balanceUpdatedAt)}` : 'Balance has not been fetched yet'}
      >
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onRefreshBalance}
          disabled={!account || isFetchingBalance}
        >
          {isFetchingBalance ? 'Refreshing...' : 'Refresh balance'}
        </button>
      </Row>

      <p className="card__footnote">
        These values update automatically when you switch accounts or networks inside your wallet.
      </p>
    </section>
  )
}
