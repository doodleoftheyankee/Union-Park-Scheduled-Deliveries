import React, { useState, useEffect } from 'react'
import { fetchSalespeople } from '../api'

const BANKS = [
  'GM Financial',
  'Ally Financial',
  'Capital One',
  'Chase',
  'Bank of America',
  'Wells Fargo',
  'TD Auto',
  'PNC Bank',
  'US Bank',
  'Westlake Financial',
  'Credit Acceptance',
  'USAA',
  'Navy Federal',
  'Citizens Bank',
  'M&T Bank',
  'DCCFCU',
  'PSECU',
  'MECU',
  'Citadel',
  'Other',
]

const TIME_SLOTS = []
for (let h = 8; h <= 19; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hour = h.toString().padStart(2, '0')
    const min = m.toString().padStart(2, '0')
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    const ampm = h >= 12 ? 'PM' : 'AM'
    TIME_SLOTS.push({
      value: `${hour}:${min}`,
      label: `${displayHour}:${min} ${ampm}`
    })
  }
}

export default function AppointmentForm({ onSubmit, onClose, initialData, selectedDate }) {
  const [salespeople, setSalespeople] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_name: '',
    salesperson: '',
    appointment_date: selectedDate || new Date().toISOString().split('T')[0],
    appointment_time: '10:00',
    deal_type: 'Finance',
    bank: '',
    stock_number: '',
    vehicle: '',
    trade_info: '',
    notes: '',
  })

  useEffect(() => {
    fetchSalespeople().then(setSalespeople).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialData) {
      setForm({
        customer_name: initialData.customer_name || '',
        salesperson: initialData.salesperson || '',
        appointment_date: initialData.appointment_date || selectedDate,
        appointment_time: initialData.appointment_time || '10:00',
        deal_type: initialData.deal_type || 'Finance',
        bank: initialData.bank || '',
        stock_number: initialData.stock_number || '',
        vehicle: initialData.vehicle || '',
        trade_info: initialData.trade_info || '',
        notes: initialData.notes || '',
      })
    }
  }, [initialData, selectedDate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'deal_type' && value === 'Cash') {
      setForm(prev => ({ ...prev, bank: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.customer_name.trim()) return setError('Customer name is required')
    if (!form.salesperson) return setError('Salesperson is required')

    setSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = !!initialData

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-up-navy rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-up-slate"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-up-slate">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Delivery' : 'Schedule New Delivery'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-up-slate/50 text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Customer Name *</label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-up-red transition"
              placeholder="John Smith"
              autoFocus
            />
          </div>

          {/* Salesperson */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Salesperson *</label>
            <select
              name="salesperson"
              value={form.salesperson}
              onChange={handleChange}
              className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white outline-none focus:border-up-red transition cursor-pointer"
            >
              <option value="">Select salesperson...</option>
              {salespeople.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                name="appointment_date"
                value={form.appointment_date}
                onChange={handleChange}
                className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white outline-none focus:border-up-red transition cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Time *</label>
              <select
                name="appointment_time"
                value={form.appointment_time}
                onChange={handleChange}
                className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white outline-none focus:border-up-red transition cursor-pointer"
              >
                {TIME_SLOTS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deal Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Deal Type *</label>
            <div className="flex gap-2">
              {['Cash', 'Finance', 'Lease'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'deal_type', value: type } })}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition ${
                    form.deal_type === type
                      ? type === 'Cash' ? 'badge-cash shadow-lg shadow-green-900/30'
                        : type === 'Finance' ? 'badge-finance shadow-lg shadow-blue-900/30'
                        : 'badge-lease shadow-lg shadow-purple-900/30'
                      : 'bg-up-dark border border-up-slate text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Bank (only for Finance/Lease) */}
          {form.deal_type !== 'Cash' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Bank / Lender</label>
              <select
                name="bank"
                value={form.bank}
                onChange={handleChange}
                className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white outline-none focus:border-up-red transition cursor-pointer"
              >
                <option value="">Select bank...</option>
                {BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {/* Vehicle & Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle</label>
              <input
                type="text"
                name="vehicle"
                value={form.vehicle}
                onChange={handleChange}
                className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-up-red transition"
                placeholder="2025 Buick Enclave"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Stock #</label>
              <input
                type="text"
                name="stock_number"
                value={form.stock_number}
                onChange={handleChange}
                className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-up-red transition"
                placeholder="B1234"
              />
            </div>
          </div>

          {/* Trade Info */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Trade-In Info</label>
            <input
              type="text"
              name="trade_info"
              value={form.trade_info}
              onChange={handleChange}
              className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-up-red transition"
              placeholder="2020 Honda Civic, 45k miles"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full bg-up-dark border border-up-slate rounded-lg px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-up-red transition resize-none"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg bg-up-slate/50 text-slate-300 font-medium hover:bg-up-slate transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-lg bg-up-red text-white font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/30 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Delivery' : 'Schedule Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
