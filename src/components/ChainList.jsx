import { SUPPORTED_CHAINS } from '../constants'

export default function ChainList({ chainId, pendingChainId, onSwitch, disabled }) {
  return (
    <section className="card">
      <div className="card__header">
        <h2>Supported chains</h2>
        <span className="pill pill--muted">{SUPPORTED_CHAINS.length} networks</span>
      </div>

      <ul className="chain-list">
        {SUPPORTED_CHAINS.map((chain) => {
          const isActive = chain.chainId === chainId
          const isPending = chain.chainId === pendingChainId

          return (
            <li key={chain.chainId} className={`chain ${isActive ? 'chain--active' : ''}`}>
              <span className="chain__badge" style={{ backgroundColor: chain.color }}>
                {chain.shortName}
              </span>

              <div className="chain__info">
                <span className="chain__name">
                  {chain.name}
                  {isActive ? <span className="pill pill--ok">Connected</span> : null}
                </span>
                <span className="chain__meta">
                  Chain ID {chain.chainId} &middot; {chain.nativeCurrency.symbol}
                </span>
              </div>

              <button
                type="button"
                className={`btn btn--sm ${isActive ? 'btn--ghost' : ''}`}
                onClick={() => onSwitch(chain.chainId)}
                disabled={disabled || isActive || isPending}
              >
                {isPending ? 'Switching...' : isActive ? 'Active' : 'Switch'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
