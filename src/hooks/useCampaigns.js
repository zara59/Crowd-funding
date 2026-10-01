import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserProvider, Contract, formatEther, isAddress, parseEther } from 'ethers'
import { CROWDFUNDING_ABI, isSupportedChain } from '../constants'

const STORAGE_KEY = 'crowdfunding-contract-address'

function loadStoredAddress() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function readCampaign(result) {
  const [creator, title, description, target, raised, deadline, withdrawn, contributors] = result
  return {
    creator,
    title,
    description,
    target: formatEther(target),
    raised: formatEther(raised),
    deadline: Number(deadline),
    withdrawn,
    contributors: contributors?.length ?? 0,
  }
}

export function useCampaigns({ account, chainId }) {
  const [contractAddress, setContractAddress] = useState(loadStoredAddress)
  const [campaigns, setCampaigns] = useState([])
  const [loadState, setLoadState] = useState('idle')
  const [error, setError] = useState(null)
  const [tx, setTx] = useState({ state: 'idle', hash: null, label: '' })

  const trimmedAddress = contractAddress.trim()
  const isValidAddress = isAddress(trimmedAddress)
  const isSupported = isSupportedChain(chainId)
  const canWrite = Boolean(account) && isValidAddress && isSupported

  useEffect(() => {
    try {
      if (isValidAddress) window.localStorage.setItem(STORAGE_KEY, trimmedAddress)
    } catch {
      return
    }
  }, [isValidAddress, trimmedAddress])

  const getReadContract = useCallback(() => {
    const provider = new BrowserProvider(window.ethereum)
    return new Contract(trimmedAddress, CROWDFUNDING_ABI, provider)
  }, [trimmedAddress])

  const loadCampaigns = useCallback(async () => {
    if (!isValidAddress) {
      setLoadState('idle')
      return
    }

    setLoadState('loading')
    setError(null)
    try {
      const contract = getReadContract()
      const total = Number(await contract.campaignCount())
      const entries = await Promise.all(
        Array.from({ length: total }, async (_, index) => readCampaign(await contract.getCampaign(index))),
      )
      setCampaigns(entries)
      setLoadState('done')
    } catch (err) {
      setCampaigns([])
      setLoadState('error')
      setError(
        err.code === 'CALL_EXCEPTION'
          ? 'The contract could not be read. Check the address and that you are on the network it was deployed to.'
          : (err.shortMessage ?? err.message),
      )
    }
  }, [isValidAddress, getReadContract])

  useEffect(() => {
    if (!isValidAddress) return undefined

    let isActive = true

    const run = async () => {
      await Promise.resolve()
      if (!isActive) return
      await loadCampaigns()
    }

    void run()

    return () => {
      isActive = false
    }
  }, [isValidAddress, loadCampaigns])

  const runTransaction = useCallback(async (label, action) => {
    setTx({ state: 'signing', hash: null, label })
    setError(null)
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(trimmedAddress, CROWDFUNDING_ABI, signer)
      const sent = await action(contract)
      setTx({ state: 'pending', hash: sent.hash, label })
      await sent.wait()
      setTx({ state: 'confirmed', hash: sent.hash, label })
      await loadCampaigns()
      return true
    } catch (err) {
      setTx({ state: 'error', hash: null, label })
      setError(
        err.code === 4001
          ? `${label} rejected in your wallet.`
          : (err.shortMessage ?? err.message ?? `${label} failed.`),
      )
      return false
    }
  }, [trimmedAddress, loadCampaigns])

  const createCampaign = useCallback(
    ({ title, description, target, durationDays }) =>
      runTransaction('Create campaign', (contract) =>
        contract.createCampaign(
          title,
          description,
          parseEther(String(target)),
          BigInt(Math.trunc(Number(durationDays))),
        ),
      ),
    [runTransaction],
  )

  const contribute = useCallback(
    (id, amount) =>
      runTransaction('Contribution', (contract) =>
        contract.contribute(id, { value: parseEther(String(amount)) }),
      ),
    [runTransaction],
  )

  const withdraw = useCallback(
    (id) => runTransaction('Withdrawal', (contract) => contract.withdraw(id)),
    [runTransaction],
  )

  return useMemo(
    () => ({
      contractAddress,
      setContractAddress,
      isValidAddress,
      isSupported,
      canWrite,
      campaigns,
      loadState,
      error,
      tx,
      dismissError: () => setError(null),
      reload: loadCampaigns,
      createCampaign,
      contribute,
      withdraw,
    }),
    [
      contractAddress,
      isValidAddress,
      isSupported,
      canWrite,
      campaigns,
      loadState,
      error,
      tx,
      loadCampaigns,
      createCampaign,
      contribute,
      withdraw,
    ],
  )
}
