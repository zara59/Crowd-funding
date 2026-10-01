import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserProvider, formatUnits } from 'ethers'
import { getChain } from '../constants'

function getInjectedProvider() {
  if (typeof window === 'undefined') return null
  return window.ethereum ?? null
}

function describeError(error) {
  if (!error) return 'Something went wrong.'
  if (error.code === 4001) return 'Request rejected in your wallet.'
  if (error.code === -32002) return 'A wallet request is already pending.'
  return error.shortMessage ?? error.message ?? 'Something went wrong.'
}

export function useWallet() {
  const hasWallet = useMemo(() => getInjectedProvider() !== null, [])

  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [balance, setBalance] = useState(null)
  const [balanceUpdatedAt, setBalanceUpdatedAt] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isFetchingBalance, setIsFetchingBalance] = useState(false)
  const [error, setError] = useState(null)

  const accountRef = useRef(null)

  const syncChain = useCallback(async () => {
    const injected = getInjectedProvider()
    if (!injected) return null
    try {
      const hexChainId = await injected.request({ method: 'eth_chainId' })
      const id = Number(hexChainId)
      setChainId(id)
      return id
    } catch (err) {
      setError(`Could not read the network: ${describeError(err)}`)
      return null
    }
  }, [])

  const refreshBalance = useCallback(async (address) => {
    const target = address ?? accountRef.current
    const injected = getInjectedProvider()

    if (!injected || !target) {
      setBalance(null)
      setBalanceUpdatedAt(null)
      return null
    }

    setIsFetchingBalance(true)
    try {
      const provider = new BrowserProvider(injected)
      const wei = await provider.getBalance(target)
      const formatted = formatUnits(wei, 18)
      setBalance(formatted)
      setBalanceUpdatedAt(new Date())
      return formatted
    } catch (err) {
      setError(`Could not fetch balance: ${describeError(err)}`)
      return null
    } finally {
      setIsFetchingBalance(false)
    }
  }, [])

  const syncAccount = useCallback(
    async (accounts) => {
      if (!accounts || accounts.length === 0) {
        accountRef.current = null
        setAccount(null)
        setBalance(null)
        setBalanceUpdatedAt(null)
        setChainId(null)
        return
      }

      accountRef.current = accounts[0]
      setAccount(accounts[0])
      await syncChain()
      await refreshBalance(accounts[0])
    },
    [syncChain, refreshBalance],
  )

  const connect = useCallback(async () => {
    const injected = getInjectedProvider()

    if (!injected) {
      setError('No Ethereum wallet found. Install MetaMask to continue.')
      return
    }

    setIsConnecting(true)
    setError(null)
    try {
      const accounts = await injected.request({ method: 'eth_requestAccounts' })
      await syncAccount(accounts)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsConnecting(false)
    }
  }, [syncAccount])

  useEffect(() => {
    const injected = getInjectedProvider()
    if (!injected) return undefined

    let isActive = true

    const handleAccountsChanged = (accounts) => {
      if (!isActive) return
      void syncAccount(accounts)
    }

    const handleChainChanged = () => {
      if (!isActive) return
      void (async () => {
        await syncChain()
        await refreshBalance()
      })()
    }

    const restoreSession = async () => {
      try {
        const accounts = await injected.request({ method: 'eth_accounts' })
        if (!isActive || !accounts || accounts.length === 0) return
        await syncAccount(accounts)
      } catch {
        return
      }
    }

    void restoreSession()

    injected.on?.('accountsChanged', handleAccountsChanged)
    injected.on?.('chainChanged', handleChainChanged)

    return () => {
      isActive = false
      injected.removeListener?.('accountsChanged', handleAccountsChanged)
      injected.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [syncAccount, syncChain, refreshBalance])

  const chain = chainId !== null ? getChain(chainId) : null

  return {
    hasWallet,
    account,
    chainId,
    chain,
    balance,
    balanceUpdatedAt,
    isConnecting,
    isFetchingBalance,
    error,
    connect,
    refreshBalance,
    dismissError: () => setError(null),
  }
}
