import { SUPPORTED_CHAINS } from '../constants'

export default function UnsupportedChainBanner({
  chainId,
  message,
  pendingChainId,
  onSwitch,
}) {
  return (
    <section className="card card--danger">
      <div className="card__header">
        <h2>Unsupported network</h2>
      </div>

      <p className="card__message">
        {message ?? `Unsupported network detected (chain ID ${chainId}).`}
      </p>
      <p className="card__footnote">
        Your wallet is connected to chain ID {chainId}. This app only works on the supported
        networks below, so switch back to one of them to restore your balance and account data.
      </p>

      <div className="switch-prompt">
        <span className="switch-prompt__label">Switch back to a supported chain:</span>
        <div className="switch-prompt__actions">
          {SUPPORTED_CHAINS.map((chain) => (
            <button
              key={chain.chainId}
              type="button"
              className="btn btn--sm"
              onClick={() => onSwitch(chain.chainId)}
              disabled={chain.chainId === pendingChainId}
            >
              {chain.chainId === pendingChainId ? 'Switching...' : chain.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
