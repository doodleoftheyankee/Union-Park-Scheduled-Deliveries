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

  const formatMonthYear = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatWeekRange = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((day + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const opts = { month: 'short', day: 'numeric' }
    return `${monday.toLocaleDateString('en-US', opts)} - ${sunday.toLocaleDateString('en-US', opts)}, ${sunday.getFullYear()}`
  }

  const goToday = () => onDateChange(today)

  const goPrev = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    if (view === 'month') {
      d.setMonth(d.getMonth() - 1)
    } else if (view === 'week') {
      d.setDate(d.getDate() - 7)
    } else {
      d.setDate(d.getDate() - 1)
    }
    onDateChange(d.toISOString().split('T')[0])
  }

  const goNext = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    if (view === 'month') {
      d.setMonth(d.getMonth() + 1)
    } else if (view === 'week') {
      d.setDate(d.getDate() + 7)
    } else {
      d.setDate(d.getDate() + 1)
    }
    onDateChange(d.toISOString().split('T')[0])
  }

  const dateLabel = view === 'month' ? formatMonthYear(selectedDate)
    : view === 'week' ? formatWeekRange(selectedDate)
    : formatDate(selectedDate)

  const views = [
    { id: 'board', label: 'Day', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    )},
    { id: 'week', label: 'Week', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { id: 'month', label: 'Month', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'reports', label: 'Reports', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
  ]

  const showDateNav = view !== 'reports'
  const showFilters = view !== 'reports'

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

            {view !== 'reports' && (
              <button
                onClick={onNewAppointment}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-up-red hover:bg-red-700 text-white font-semibold text-sm transition shadow-lg shadow-red-900/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Delivery
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View tabs + date navigation + filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
        {/* View tabs */}
        <div className="flex items-center bg-up-dark/50 rounded-lg p-1">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                view === v.id
                  ? 'bg-up-red text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-up-slate/30'
              }`}
            >
              {v.icon}
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Date navigation */}
        {showDateNav && (
          <>
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

              {view === 'board' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="bg-transparent text-white text-sm font-medium px-2 py-1.5 rounded border-0 outline-none cursor-pointer"
                />
              )}

              <button onClick={goNext} className="p-2 rounded hover:bg-up-slate/50 text-slate-400 hover:text-white transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Date display */}
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold">{dateLabel}</h2>
              {isToday && view === 'board' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot"></span>
                  TODAY
                </span>
              )}
            </div>
          </>
        )}

        <div className="flex-1" />

        {/* Salesperson filter (day/schedule views only) */}
        {showFilters && (
          <>
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
          </>
        )}
      </div>
    </header>
  )
}
