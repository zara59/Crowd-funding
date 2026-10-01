import { useCallback, useEffect, useState } from 'react'
import { BrowserProvider, Contract, isAddress } from 'ethers'
import { STUDENT_REGISTRY_ABI, isSupportedChain } from '../constants'
import { Alert } from './Alert'
import { shortenAddress } from '../utils/format'

const STORAGE_KEY = 'student-registry-address'

function loadStoredAddress() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function StudentRegistry({ account, chainId }) {
  const [contractAddress, setContractAddress] = useState(loadStoredAddress)
  const [student, setStudent] = useState(null)
  const [isRegistered, setIsRegistered] = useState(null)
  const [loadState, setLoadState] = useState('idle')
  const [loadError, setLoadError] = useState(null)
  const [txState, setTxState] = useState('idle')
  const [txHash, setTxHash] = useState(null)
  const [form, setForm] = useState({ name: '', age: '', course: '' })

  const trimmedAddress = contractAddress.trim()
  const isValidAddress = isAddress(trimmedAddress)
  const canRead = Boolean(account) && isValidAddress
  const isReady = canRead && isSupportedChain(chainId)

  useEffect(() => {
    try {
      if (isValidAddress) window.localStorage.setItem(STORAGE_KEY, trimmedAddress)
    } catch {
      return
    }
  }, [isValidAddress, trimmedAddress])

  const getReadContract = useCallback(async () => {
    const provider = new BrowserProvider(window.ethereum)
    return new Contract(trimmedAddress, STUDENT_REGISTRY_ABI, provider)
  }, [trimmedAddress])

  const loadStudent = useCallback(async () => {
    if (!canRead) return

    setLoadState('loading')
    setLoadError(null)
    try {
      const contract = await getReadContract()
      const registeredFlag = await contract.registered(account)
      setIsRegistered(registeredFlag)

      if (!registeredFlag) {
        setStudent(null)
        setLoadState('done')
        return
      }

      try {
        const [name, age, course] = await contract.getStudent(account)
        setStudent({ name, age: age.toString(), course })
      } catch {
        setStudent(null)
        setLoadError('This address is registered but getStudent() returned no record.')
      }
      setLoadState('done')
    } catch (err) {
      setLoadState('error')
      setLoadError(
        err.code === 'CALL_EXCEPTION'
          ? 'The contract could not be read. Check the address and that you are on the network the contract is deployed to.'
          : (err.shortMessage ?? err.message),
      )
    }
  }, [account, canRead, getReadContract])

  useEffect(() => {
    if (!canRead) return undefined

    let isActive = true

    const run = async () => {
      await Promise.resolve()
      if (!isActive) return
      await loadStudent()
    }

    void run()

    return () => {
      isActive = false
    }
  }, [canRead, loadStudent])

  const handleRegister = async (event) => {
    event.preventDefault()
    if (!isReady) return

    const age = Number(form.age)
    if (!form.name.trim() || !form.course.trim() || !Number.isFinite(age) || age < 0) {
      setLoadError('Fill in a name, a valid age and a course before registering.')
      return
    }

    setTxState('signing')
    setLoadError(null)
    setTxHash(null)
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new Contract(trimmedAddress, STUDENT_REGISTRY_ABI, signer)
      const tx = await contract.register(form.name.trim(), BigInt(age), form.course.trim())
      setTxState('pending')
      setTxHash(tx.hash)
      await tx.wait()
      setTxState('confirmed')
      setForm({ name: '', age: '', course: '' })
      await loadStudent()
    } catch (err) {
      setTxState('error')
      setLoadError(
        err.code === 4001 ? 'Registration rejected in your wallet.' : (err.shortMessage ?? err.message),
      )
    }
  }

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  return (
    <section className="card">
      <div className="card__header">
        <h2>Student Registry contract</h2>
        <span className="pill pill--muted">Solidity</span>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="contract-address">
          Contract address
        </label>
        <input
          id="contract-address"
          className="field__input"
          type="text"
          spellCheck="false"
          placeholder="0x..."
          value={contractAddress}
          onChange={(event) => setContractAddress(event.target.value)}
        />
        <span className={`field__hint ${isValidAddress ? 'field__hint--ok' : ''}`}>
          {trimmedAddress.length === 0
            ? 'Paste the deployed StudentRegistry address. It is saved in this browser.'
            : isValidAddress
              ? 'Valid address.'
              : 'That is not a valid EVM address.'}
        </span>
      </div>

      {!account ? (
        <Alert tone="info">Connect a wallet to read and write to the contract.</Alert>
      ) : chainId !== null && !isSupportedChain(chainId) ? (
        <Alert tone="warning">
          Switch to a supported chain before calling the contract.
        </Alert>
      ) : null}

      {loadError ? <Alert title="Contract error">{loadError}</Alert> : null}

      {account ? (
        <div className="student">
          <div className="student__header">
            <span className="student__label">
              Record for {shortenAddress(account, 8, 6)}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => void loadStudent()}
              disabled={loadState === 'loading'}
            >
              {loadState === 'loading' ? 'Loading...' : 'Reload'}
            </button>
          </div>

          {!canRead ? (
            <p className="card__footnote">
              Add a valid contract address to load the record for this account.
            </p>
          ) : loadState === 'loading' || loadState === 'idle' ? (
            <p className="card__footnote">Loading record...</p>
          ) : isRegistered === null ? (
            <p className="card__footnote">No record loaded yet.</p>
          ) : isRegistered ? (
            <dl className="student__grid">
              <div>
                <dt>Name</dt>
                <dd>{student?.name ?? '--'}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{student?.age ?? '--'}</dd>
              </div>
              <div>
                <dt>Course</dt>
                <dd>{student?.course ?? '--'}</dd>
              </div>
            </dl>
          ) : (
            <p className="card__footnote">
              This address is not registered yet. Use the form below to register it.
            </p>
          )}
        </div>
      ) : null}

      <form className="registry-form" onSubmit={handleRegister}>
        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="student-name">
              Name
            </label>
            <input
              id="student-name"
              className="field__input"
              type="text"
              value={form.name}
              onChange={updateField('name')}
              placeholder="Ada Lovelace"
            />
          </div>

          <div className="field field--narrow">
            <label className="field__label" htmlFor="student-age">
              Age
            </label>
            <input
              id="student-age"
              className="field__input"
              type="number"
              min="0"
              value={form.age}
              onChange={updateField('age')}
              placeholder="21"
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="student-course">
            Course
          </label>
          <input
            id="student-course"
            className="field__input"
            type="text"
            value={form.course}
            onChange={updateField('course')}
            placeholder="Blockchain Development"
          />
        </div>

        <div className="registry-form__footer">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!isReady || isRegistered === true || txState === 'signing' || txState === 'pending'}
          >
            {txState === 'signing'
              ? 'Confirm in wallet...'
              : txState === 'pending'
                ? 'Mining...'
                : 'Register student'}
          </button>

          {txState === 'confirmed' ? (
            <span className="pill pill--ok">Transaction confirmed</span>
          ) : null}

          {txHash ? (
            <span className="field__hint">
              tx {shortenAddress(txHash, 10, 6)}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  )
}
