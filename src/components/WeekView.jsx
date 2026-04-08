import React from 'react'

const DEAL_DOT = {
  Cash: 'bg-green-500',
  Finance: 'bg-blue-500',
  Lease: 'bg-purple-500',
}

const STATUS_OPACITY = {
  Delivered: 'opacity-50',
  Cancelled: 'opacity-40 line-through',
  'No Show': 'opacity-40',
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${m} ${ampm}`
}

function getWeekDays(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))

  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    days.push(date.toISOString().split('T')[0])
  }
  return days
}

export default function WeekView({ appointments, selectedDate, onSelectDate }) {
  const weekDays = getWeekDays(selectedDate)
  const today = new Date().toISOString().split('T')[0]

  const byDate = {}
  weekDays.forEach(d => { byDate[d] = [] })
  appointments.forEach(a => {
    if (byDate[a.appointment_date]) {
      byDate[a.appointment_date].push(a)
    }
  })

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="week-view">
      {/* Week header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((date, i) => {
          const d = new Date(date + 'T00:00:00')
          const isToday = date === today
          const isSelected = date === selectedDate
          return (
            <div
              key={date}
              className={`text-center py-2 rounded-lg cursor-pointer transition ${
                isToday ? 'bg-up-red/20 border border-up-red/50' :
                isSelected ? 'bg-up-slate/50 border border-up-slate' :
                'hover:bg-up-slate/30'
              }`}
              onClick={() => onSelectDate(date)}
            >
              <div className="text-xs text-slate-500 uppercase font-medium">{dayNames[i]}</div>
              <div className={`text-lg font-bold ${isToday ? 'text-up-red' : 'text-white'}`}>
                {d.getDate()}
              </div>
              <div className="text-xs text-slate-500">
                {d.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Week body */}
      <div className="grid grid-cols-7 gap-2" style={{ minHeight: '500px' }}>
        {weekDays.map((date) => {
          const dayAppts = byDate[date] || []
          const isToday = date === today
          return (
            <div
              key={date}
              className={`rounded-lg border p-2 flex flex-col ${
                isToday ? 'border-up-red/40 bg-up-red/5' : 'border-up-slate/30 bg-up-navy/50'
              }`}
            >
              {/* Appointment mini-cards */}
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[500px]">
                {dayAppts.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-xs">No deliveries</div>
                ) : (
                  dayAppts.map(a => (
                    <div
                      key={a.id}
                      className={`p-2 rounded border-l-3 bg-up-dark/60 cursor-pointer hover:bg-up-dark/80 transition ${
                        STATUS_OPACITY[a.status] || ''
                      }`}
                      style={{ borderLeftWidth: '3px', borderLeftColor: DEAL_DOT[a.deal_type] === 'bg-green-500' ? '#22c55e' : DEAL_DOT[a.deal_type] === 'bg-blue-500' ? '#3b82f6' : '#a855f7' }}
                      onClick={() => onSelectDate(date)}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-slate-300">{formatTime(a.appointment_time)}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${DEAL_DOT[a.deal_type]}`} />
                      </div>
                      <div className={`text-xs font-medium truncate ${a.status === 'Delivered' ? 'text-slate-500' : 'text-white'}`}>
                        {a.customer_name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{a.salesperson}</div>
                      {a.status !== 'Scheduled' && (
                        <div className={`text-xs mt-0.5 font-medium ${
                          a.status === 'Delivered' ? 'text-green-500' :
                          a.status === 'Cancelled' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {a.status}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Day total */}
              {dayAppts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-up-slate/20 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{dayAppts.length} delivery{dayAppts.length !== 1 ? 'ies' : ''}</span>
                  <div className="flex gap-1">
                    {dayAppts.filter(a => a.deal_type === 'Cash').length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-green-500" title="Cash" />
                    )}
                    {dayAppts.filter(a => a.deal_type === 'Finance').length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" title="Finance" />
                    )}
                    {dayAppts.filter(a => a.deal_type === 'Lease').length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-purple-500" title="Lease" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
