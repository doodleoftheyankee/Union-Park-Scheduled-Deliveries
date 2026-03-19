import React, { useState, useEffect } from 'react'

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${m} ${ampm}`
}

const DEAL_STYLES = {
  Cash: { bg: 'bg-green-900/40', border: 'border-green-500', text: 'text-green-400', badge: 'badge-cash' },
  Finance: { bg: 'bg-blue-900/40', border: 'border-blue-500', text: 'text-blue-400', badge: 'badge-finance' },
  Lease: { bg: 'bg-purple-900/40', border: 'border-purple-500', text: 'text-purple-400', badge: 'badge-lease' },
}

const STATUS_DOT = {
  Scheduled: 'bg-blue-400',
  Delivered: 'bg-green-400',
  Cancelled: 'bg-red-400',
  'No Show': 'bg-yellow-400',
}

export default function BoardView({ appointments, selectedDate, onExit }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ESC to exit
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onExit() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onExit])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  const scheduled = appointments.filter(a => a.status === 'Scheduled')
  const delivered = appointments.filter(a => a.status === 'Delivered')
  const cash = appointments.filter(a => a.deal_type === 'Cash').length
  const finance = appointments.filter(a => a.deal_type === 'Finance').length
  const lease = appointments.filter(a => a.deal_type === 'Lease').length

  return (
    <div className="fixed inset-0 bg-up-dark z-50 overflow-hidden flex flex-col">
      {/* Top header bar */}
      <div className="bg-up-navy border-b border-up-slate px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-up-red flex items-center justify-center font-extrabold text-white text-xl">
            UP
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Union Park Buick GMC</h1>
            <p className="text-slate-400 text-sm">Scheduled Deliveries</p>
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-white tabular-nums">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-slate-400 text-sm">{formatDate(selectedDate)}</div>
        </div>

        <div className="flex items-center gap-6">
          {/* Summary stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{appointments.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Total</div>
            </div>
            <div className="w-px h-10 bg-up-slate" />
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{delivered.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Delivered</div>
            </div>
            <div className="w-px h-10 bg-up-slate" />
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{scheduled.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Remaining</div>
            </div>
          </div>

          <button
            onClick={onExit}
            className="p-2 rounded-lg hover:bg-up-slate/50 text-slate-400 hover:text-white transition"
            title="Exit TV Mode (ESC)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Deal type legend */}
      <div className="px-8 py-3 bg-up-navy/50 border-b border-up-slate/50 flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-slate-300 text-sm font-medium">Cash ({cash})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-slate-300 text-sm font-medium">Finance ({finance})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500" />
          <span className="text-slate-300 text-sm font-medium">Lease ({lease})</span>
        </div>
        <div className="flex-1" />
        {isToday && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
            <span className="text-green-400 text-sm font-medium">LIVE - Auto-refreshing every 30s</span>
          </div>
        )}
        <span className="text-slate-600 text-xs">Press ESC to exit</span>
      </div>

      {/* Main board content */}
      <div className="flex-1 overflow-y-auto p-8">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4 opacity-30">📋</div>
            <h2 className="text-3xl font-bold text-slate-500">No Deliveries Scheduled</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {appointments.map(a => {
              const style = DEAL_STYLES[a.deal_type] || DEAL_STYLES.Cash
              const isDelivered = a.status === 'Delivered'

              return (
                <div
                  key={a.id}
                  className={`rounded-xl p-5 border-l-4 ${style.border} ${style.bg} ${
                    isDelivered ? 'opacity-50' : ''
                  } transition-all`}
                >
                  {/* Time & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-white">{formatTime(a.appointment_time)}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${style.badge}`}>
                        {a.deal_type}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${STATUS_DOT[a.status]} ${
                        a.status === 'Scheduled' ? 'pulse-dot' : ''
                      }`} title={a.status} />
                    </div>
                  </div>

                  {/* Customer */}
                  <h3 className={`text-xl font-bold mb-1 ${isDelivered ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {a.customer_name}
                  </h3>

                  {/* Vehicle */}
                  {a.vehicle && (
                    <p className="text-slate-300 text-sm mb-2">{a.vehicle}</p>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                    <div>
                      <span className="text-slate-500">Sales: </span>
                      <span className="text-slate-200 font-medium">{a.salesperson}</span>
                    </div>
                    {a.bank && (
                      <div>
                        <span className="text-slate-500">Bank: </span>
                        <span className="text-slate-200 font-medium">{a.bank}</span>
                      </div>
                    )}
                    {a.stock_number && (
                      <div>
                        <span className="text-slate-500">Stk#: </span>
                        <span className="text-slate-200 font-medium">{a.stock_number}</span>
                      </div>
                    )}
                    {a.trade_info && (
                      <div>
                        <span className="text-slate-500">Trade: </span>
                        <span className="text-slate-200 font-medium">{a.trade_info}</span>
                      </div>
                    )}
                  </div>

                  {/* Status label for delivered/cancelled */}
                  {a.status !== 'Scheduled' && (
                    <div className={`mt-3 text-center py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      a.status === 'Delivered' ? 'bg-green-900/50 text-green-400' :
                      a.status === 'Cancelled' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {a.status}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
