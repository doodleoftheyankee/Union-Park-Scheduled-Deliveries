import React from 'react'

const DEAL_DOT = {
  Cash: 'bg-green-500',
  Finance: 'bg-blue-500',
  Lease: 'bg-purple-500',
}

function getMonthGrid(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const year = d.getFullYear()
  const month = d.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Start from Monday before (or on) the 1st
  const startOffset = (firstDay.getDay() + 6) % 7
  const start = new Date(firstDay)
  start.setDate(start.getDate() - startOffset)

  const cells = []
  const current = new Date(start)
  // Always show 6 weeks (42 cells) for consistent grid height
  for (let i = 0; i < 42; i++) {
    cells.push({
      date: current.toISOString().split('T')[0],
      day: current.getDate(),
      inMonth: current.getMonth() === month,
    })
    current.setDate(current.getDate() + 1)
  }
  return cells
}

export default function MonthView({ appointments, selectedDate, onSelectDate }) {
  const cells = getMonthGrid(selectedDate)
  const today = new Date().toISOString().split('T')[0]

  // Group appointments by date
  const byDate = {}
  appointments.forEach(a => {
    if (!byDate[a.appointment_date]) byDate[a.appointment_date] = []
    byDate[a.appointment_date].push(a)
  })

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="month-view">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-500 uppercase py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const dayAppts = byDate[cell.date] || []
          const isToday = cell.date === today
          const hasAppts = dayAppts.length > 0

          const cashCount = dayAppts.filter(a => a.deal_type === 'Cash').length
          const financeCount = dayAppts.filter(a => a.deal_type === 'Finance').length
          const leaseCount = dayAppts.filter(a => a.deal_type === 'Lease').length
          const deliveredCount = dayAppts.filter(a => a.status === 'Delivered').length

          return (
            <div
              key={cell.date}
              onClick={() => onSelectDate(cell.date)}
              className={`month-cell rounded-lg p-2 cursor-pointer transition min-h-[90px] flex flex-col ${
                !cell.inMonth ? 'opacity-30' :
                isToday ? 'bg-up-red/10 border border-up-red/40 hover:bg-up-red/20' :
                hasAppts ? 'bg-up-navy border border-up-slate/40 hover:border-up-slate' :
                'bg-up-navy/30 border border-transparent hover:bg-up-navy/60'
              }`}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${
                  isToday ? 'text-up-red' :
                  cell.inMonth ? 'text-white' : 'text-slate-600'
                }`}>
                  {cell.day}
                </span>
                {isToday && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-up-red/20 text-up-red font-medium">Today</span>
                )}
              </div>

              {/* Appointment summary */}
              {hasAppts && cell.inMonth && (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-lg font-bold text-white leading-tight">{dayAppts.length}</div>
                    <div className="text-xs text-slate-500">
                      deliver{dayAppts.length !== 1 ? 'ies' : 'y'}
                    </div>
                  </div>

                  {/* Deal type dots */}
                  <div className="flex items-center gap-2 mt-1">
                    {cashCount > 0 && (
                      <div className="flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-slate-500">{cashCount}</span>
                      </div>
                    )}
                    {financeCount > 0 && (
                      <div className="flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-slate-500">{financeCount}</span>
                      </div>
                    )}
                    {leaseCount > 0 && (
                      <div className="flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-xs text-slate-500">{leaseCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Delivered progress */}
                  {deliveredCount > 0 && (
                    <div className="mt-1">
                      <div className="w-full h-1 rounded-full bg-up-slate/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${(deliveredCount / dayAppts.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400">Cash</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-400">Finance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-xs text-slate-400">Lease</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400">Delivered progress</span>
        </div>
      </div>
    </div>
  )
}
