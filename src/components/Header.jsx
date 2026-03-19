import React, { useState, useEffect } from 'react'
import { fetchSalespeople } from '../api'

export default function Header({ view, onViewChange, selectedDate, onDateChange, onNewAppointment, appointmentCount, filterSalesperson, onFilterSalesperson }) {
  const [salespeople, setSalespeople] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchSalespeople().then(setSalespeople).catch(() => {})
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const goToday = () => onDateChange(today)
  const goPrev = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    onDateChange(d.toISOString().split('T')[0])
  }
  const goNext = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    onDateChange(d.toISOString().split('T')[0])
  }

  return (
    <header className="bg-up-navy border-b border-up-slate sticky top-0 z-40">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-up-red flex items-center justify-center font-extrabold text-white text-lg">
              UP
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Union Park</h1>
              <p className="text-xs text-slate-400 leading-tight">Delivery Board</p>
            </div>
          </div>

          {/* Clock */}
          <div className="hidden sm:block text-center">
            <div className="text-2xl font-bold text-white tabular-nums">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-slate-400">{formatDate(today)}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewChange('tv')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-up-slate/50 hover:bg-up-slate text-sm text-slate-300 hover:text-white transition"
              title="Full screen board view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              TV Mode
            </button>

            <button
              onClick={onNewAppointment}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-up-red hover:bg-red-700 text-white font-semibold text-sm transition shadow-lg shadow-red-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Date navigation & filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
        {/* Date nav */}
        <div className="flex items-center gap-1 bg-up-dark/50 rounded-lg p-1">
          <button onClick={goPrev} className="p-2 rounded hover:bg-up-slate/50 text-slate-400 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {!isToday && (
            <button onClick={goToday} className="px-3 py-1.5 rounded text-xs font-medium bg-up-red/20 text-red-400 hover:bg-up-red/30 transition">
              Today
            </button>
          )}

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-white text-sm font-medium px-2 py-1.5 rounded border-0 outline-none cursor-pointer"
          />

          <button onClick={goNext} className="p-2 rounded hover:bg-up-slate/50 text-slate-400 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Date display */}
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold">{formatDate(selectedDate)}</h2>
          {isToday && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot"></span>
              TODAY
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Salesperson filter */}
        <select
          value={filterSalesperson}
          onChange={(e) => onFilterSalesperson(e.target.value)}
          className="bg-up-dark/50 text-slate-300 text-sm rounded-lg px-3 py-2 border border-up-slate/50 outline-none cursor-pointer"
        >
          <option value="">All Salespeople</option>
          {salespeople.map(sp => (
            <option key={sp} value={sp}>{sp}</option>
          ))}
        </select>

        {/* Count */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-up-dark/50 border border-up-slate/50">
          <span className="text-slate-400 text-sm">Deliveries:</span>
          <span className="text-white font-bold text-lg">{appointmentCount}</span>
        </div>
      </div>
    </header>
  )
}
