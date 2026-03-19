import React, { useState } from 'react'

const DEAL_COLORS = {
  Cash: { bg: 'bg-green-900/30', border: 'deal-cash', badge: 'badge-cash', icon: '$' },
  Finance: { bg: 'bg-blue-900/30', border: 'deal-finance', badge: 'badge-finance', icon: 'F' },
  Lease: { bg: 'bg-purple-900/30', border: 'deal-lease', badge: 'badge-lease', icon: 'L' },
}

const STATUS_STYLES = {
  Scheduled: 'status-scheduled',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
  'No Show': 'status-noshow',
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${m} ${ampm}`
}

export default function AppointmentCard({ appointment, onEdit, onDelete, onStatusChange }) {
  const [showMenu, setShowMenu] = useState(false)
  const colors = DEAL_COLORS[appointment.deal_type] || DEAL_COLORS.Cash

  return (
    <div className={`appointment-card ${colors.border} ${colors.bg} rounded-lg p-4 relative group`}>
      {/* Top row: Time & Deal Type */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">{formatTime(appointment.appointment_time)}</span>
          {appointment.status === 'Scheduled' && (
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors.badge}`}>
            {appointment.deal_type}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[appointment.status]}`}>
            {appointment.status}
          </span>
        </div>
      </div>

      {/* Customer name */}
      <h3 className="text-lg font-bold text-white mb-1">{appointment.customer_name}</h3>

      {/* Vehicle */}
      {appointment.vehicle && (
        <p className="text-slate-300 text-sm mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {appointment.vehicle}
        </p>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Sales:</span>
          <span className="text-slate-200 font-medium">{appointment.salesperson}</span>
        </div>

        {appointment.bank && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Bank:</span>
            <span className="text-slate-200 font-medium">{appointment.bank}</span>
          </div>
        )}

        {appointment.stock_number && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Stock#:</span>
            <span className="text-slate-200 font-medium">{appointment.stock_number}</span>
          </div>
        )}

        {appointment.trade_info && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Trade:</span>
            <span className="text-slate-200 font-medium">{appointment.trade_info}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="mt-3 p-2 rounded bg-black/20 text-slate-400 text-xs">
          {appointment.notes}
        </div>
      )}

      {/* Action buttons (visible on hover) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Change status"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-up-navy border border-up-slate rounded-lg shadow-xl py-1 z-50 min-w-[140px]">
              {['Scheduled', 'Delivered', 'Cancelled', 'No Show'].map(status => (
                <button
                  key={status}
                  onClick={() => { onStatusChange(appointment.id, status); setShowMenu(false) }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-up-slate/50 transition ${
                    appointment.status === status ? 'text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onEdit(appointment)}
          className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          onClick={() => onDelete(appointment.id)}
          className="p-1.5 rounded hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
