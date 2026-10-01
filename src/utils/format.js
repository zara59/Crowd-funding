export function shortenAddress(address, lead = 6, tail = 4) {
  if (!address) return ''
  if (address.length <= lead + tail + 2) return address
  return `${address.slice(0, lead)}...${address.slice(-tail)}`
}

export function formatBalance(value, maxDecimals = 6) {
  if (value === null || value === undefined || value === '') return '--'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'
  if (amount === 0) return '0'
  return amount.toLocaleString(undefined, { maximumFractionDigits: maxDecimals })
}

export function formatTime(date) {
  if (!date) return null
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatDate(seconds) {
  if (!seconds) return '--'
  return new Date(Number(seconds) * 1000).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function toPercent(raised, target) {
  const raisedValue = Number(raised)
  const targetValue = Number(target)
  if (!Number.isFinite(raisedValue) || !Number.isFinite(targetValue) || targetValue === 0) {
    return 0
  }
  return Math.min(100, (raisedValue / targetValue) * 100)
}

export function isSameAddress(a, b) {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}
