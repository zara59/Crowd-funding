import { useState } from 'react'
import { formatBalance, formatDate, isSameAddress, toPercent } from '../utils/format'

const pageLoadedAt = Date.now() / 1000

function CampaignCard({ campaign, index, account, canWrite, isBusy, onContribute, onWithdraw }) {
  const [amount, setAmount] = useState('')
  const percent = toPercent(campaign.raised, campaign.target)
  const isFunded = Number(campaign.raised) >= Number(campaign.target)
  const isExpired = pageLoadedAt > campaign.deadline
  const isCreator = isSameAddress(campaign.creator, account)
  const canWithdraw = isCreator && isFunded && isExpired && !campaign.withdrawn
  const isOpen = isCampaignOpen(campaign, pageLoadedAt)
  const canContribute = canWrite && isOpen

  const handleContribute = (event) => {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return
    onContribute(index, amount)
    setAmount('')
  }

  return (
    <li className="campaign">
      <div className="campaign__header">
        <div>
          <h3 className="campaign__title">{campaign.title}</h3>
          <span className="campaign__creator">by {campaign.creator}</span>
        </div>
        {isFunded ? <span className="pill pill--ok">Funded</span> : null}
        {campaign.withdrawn ? <span className="pill pill--muted">Withdrawn</span> : null}
      </div>

      <p className="campaign__description">{campaign.description || 'No description provided.'}</p>

      <div className="campaign__progress">
        <div className="progress">
          <div className="progress__bar" style={{ width: `${percent}%` }} />
        </div>
        <div className="campaign__figures">
          <span>
            <strong>{formatBalance(campaign.raised)} ETH</strong> raised of {formatBalance(campaign.target)} ETH
          </span>
          <span>{percent.toFixed(0)}%</span>
        </div>
      </div>

      <div className="campaign__meta">
        <span>{campaign.contributors} contributors</span>
        <span>
          {isExpired ? 'Ended' : 'Ends'} {formatDate(campaign.deadline)}
        </span>
      </div>

      <form className="campaign__contribute" onSubmit={handleContribute}>
        <input
          className="field__input"
          type="number"
          step="0.001"
          min="0"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          disabled={!canContribute || isBusy}
        />
        <button type="submit" className="btn btn--sm" disabled={!canContribute || isBusy}>
          {isBusy ? 'Sending...' : 'Contribute'}
        </button>
        {canWithdraw ? (
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => onWithdraw(index)}
            disabled={isBusy}
          >
            Withdraw
          </button>
        ) : null}
      </form>

      {!canWrite && account ? (
        <p className="field__hint">Contributions are closed for this campaign.</p>
      ) : null}
    </li>
  )
}

function isCampaignOpen(campaign, now) {
  if (campaign.withdrawn) return false
  if (Number(campaign.raised) >= Number(campaign.target)) return false
  return now <= campaign.deadline
}

export default function CampaignList({
  campaigns,
  loadState,
  account,
  canWrite,
  isBusy,
  onContribute,
  onWithdraw,
  onReload,
}) {
  if (loadState === 'loading' || loadState === 'idle') {
    return <p className="card__footnote">Loading campaigns...</p>
  }

  if (campaigns.length === 0) {
    return (
      <p className="card__footnote">
        No campaigns yet. Create the first one with the form on the right.
      </p>
    )
  }

  return (
    <>
      <div className="campaigns__toolbar">
        <span className="pill pill--muted">{campaigns.length} campaigns</span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onReload} disabled={isBusy}>
          Reload
        </button>
      </div>

      <ul className="campaigns">
        {campaigns.map((campaign, index) => (
          <CampaignCard
            key={campaign.creator + index}
            campaign={campaign}
            index={index}
            account={account}
            canWrite={canWrite}
            isBusy={isBusy}
            onContribute={onContribute}
            onWithdraw={onWithdraw}
          />
        ))}
      </ul>
    </>
  )
}
