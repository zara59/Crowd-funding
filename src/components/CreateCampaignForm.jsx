import { useState } from 'react'

const EMPTY = { title: '', description: '', target: '', durationDays: '14' }

export default function CreateCampaignForm({ canWrite, isBusy, onCreate }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const target = Number(form.target)
    const durationDays = Number(form.durationDays)

    if (!form.title.trim()) {
      setError('Give the campaign a title.')
      return
    }
    if (!Number.isFinite(target) || target <= 0) {
      setError('Target must be an amount in ETH greater than zero.')
      return
    }
    if (!Number.isFinite(durationDays) || durationDays < 1) {
      setError('Duration must be at least one day.')
      return
    }

    setError(null)
    const created = await onCreate({
      title: form.title.trim(),
      description: form.description.trim(),
      target,
      durationDays,
    })

    if (created) setForm(EMPTY)
  }

  return (
    <form className="registry-form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field__label" htmlFor="campaign-title">
          Campaign title
        </label>
        <input
          id="campaign-title"
          className="field__input"
          type="text"
          value={form.title}
          onChange={update('title')}
          placeholder="Solar panels for a village school"
          disabled={!canWrite || isBusy}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="campaign-description">
          Description
        </label>
        <textarea
          id="campaign-description"
          className="field__input field__input--area"
          rows="3"
          value={form.description}
          onChange={update('description')}
          placeholder="Tell backers what the funds will pay for."
          disabled={!canWrite || isBusy}
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label className="field__label" htmlFor="campaign-target">
            Target (ETH)
          </label>
          <input
            id="campaign-target"
            className="field__input"
            type="number"
            step="0.01"
            min="0"
            value={form.target}
            onChange={update('target')}
            placeholder="1.5"
            disabled={!canWrite || isBusy}
          />
        </div>

        <div className="field field--narrow">
          <label className="field__label" htmlFor="campaign-duration">
            Days
          </label>
          <input
            id="campaign-duration"
            className="field__input"
            type="number"
            min="1"
            value={form.durationDays}
            onChange={update('durationDays')}
            disabled={!canWrite || isBusy}
          />
        </div>
      </div>

      {error ? <span className="field__hint field__hint--error">{error}</span> : null}

      <div className="registry-form__footer">
        <button type="submit" className="btn btn--primary" disabled={!canWrite || isBusy}>
          {isBusy ? 'Confirm in wallet...' : 'Launch campaign'}
        </button>
      </div>
    </form>
  )
}
