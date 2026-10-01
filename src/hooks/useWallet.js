import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserProvider, formatUnits } from 'ethers'
import {
  DEFAULT_CHAIN_ID,
  getChain,
  isSupportedChain,
  toChainHex,
} from '../constants'

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
  const [pendingChainId, setPendingChainId] = useState(null)
  const [error, setError] = useState(null)
  const [chainError, setChainError] = useState(null)

  const accountRef = useRef(null)

  const applyChainId = useCallback((id) => {
    setChainId(id)
    setChainError(
      isSupportedChain(id)
        ? null
        : `Unsupported network detected (chain ID ${id}). Switch back to a supported chain to continue.`,
    )
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
      setBalance(formatUnits(wei, 18))
      setBalanceUpdatedAt(new Date())
      return formatUnits(wei, 18)
    } catch (err) {
      setError(`Could not fetch balance: ${describeError(err)}`)
      return null
    } finally {
      setIsFetchingBalance(false)
    }
  }, [])

  const syncChain = useCallback(async () => {
    const injected = getInjectedProvider()
    if (!injected) return null
    try {
      const hexChainId = await injected.request({ method: 'eth_chainId' })
      const id = Number(hexChainId)
      applyChainId(id)
      return id
    } catch (err) {
      setError(`Could not read the network: ${describeError(err)}`)
      return null
    }
  }, [applyChainId])

  const syncAccount = useCallback(
    async (accounts) => {
      if (!accounts || accounts.length === 0) {
        accountRef.current = null
        setAccount(null)
        setBalance(null)
        setBalanceUpdatedAt(null)
        setChainId(null)
        setChainError(null)
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

  const disconnect = useCallback(() => {
    accountRef.current = null
    setAccount(null)
    setChainId(null)
    setChainError(null)
    setBalance(null)
    setBalanceUpdatedAt(null)
    setPendingChainId(null)
    setError(null)
  }, [])

  const switchChain = useCallback(
    async (targetChainId) => {
      const injected = getInjectedProvider()
      const target = getChain(targetChainId)

      if (!injected || !target) return

      setPendingChainId(targetChainId)
      setError(null)
      try {
        await injected.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: toChainHex(targetChainId) }],
        })
        applyChainId(targetChainId)
        await refreshBalance()
      } catch (err) {
        if (err.code === 4902) {
          try {
            await injected.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: toChainHex(targetChainId),
                  chainName: target.name,
                  nativeCurrency: target.nativeCurrency,
                  rpcUrls: [target.rpcUrl],
                  blockExplorerUrls: [target.explorerUrl],
                  testnet: target.testnet,
                },
              ],
            })
            applyChainId(targetChainId)
            await refreshBalance()
          } catch (addError) {
            setError(describeError(addError))
          }
        } else {
          setError(describeError(err))
        }
      } finally {
        setPendingChainId(null)
      }
    },
    [applyChainId, refreshBalance],
  )

  const switchToDefaultChain = useCallback(
    () => switchChain(DEFAULT_CHAIN_ID),
    [switchChain],
  )

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

    const handleDisconnect = () => {
      if (!isActive) return
      disconnect()
      setError('Wallet disconnected.')
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
    injected.on?.('disconnect', handleDisconnect)

    return () => {
      isActive = false
      injected.removeListener?.('accountsChanged', handleAccountsChanged)
      injected.removeListener?.('chainChanged', handleChainChanged)
      injected.removeListener?.('disconnect', handleDisconnect)
    }
  }, [syncAccount, syncChain, refreshBalance, disconnect])

  return {
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
    isUnsupportedChain: chainId !== null && !isSupportedChain(chainId),
    connect,
    disconnect,
    switchChain,
    switchToDefaultChain,
    refreshBalance,
    dismissError: () => setError(null),
  }
}
