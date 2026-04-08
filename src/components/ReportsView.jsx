import React, { useState, useEffect } from 'react'
import { fetchStats } from '../api'

function getMonthRange(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  }
}

function formatMonthYear(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function ReportsView({ selectedDate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(() => getMonthRange(selectedDate))

  useEffect(() => {
    setRange(getMonthRange(selectedDate))
  }, [selectedDate])

  useEffect(() => {
    setLoading(true)
    fetchStats(range)
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false))
  }, [range.start_date, range.end_date])

  const goPrevMonth = () => {
    const d = new Date(range.start_date + 'T00:00:00')
    d.setMonth(d.getMonth() - 1)
    setRange(getMonthRange(d.toISOString().split('T')[0]))
  }

  const goNextMonth = () => {
    const d = new Date(range.start_date + 'T00:00:00')
    d.setMonth(d.getMonth() + 1)
    setRange(getMonthRange(d.toISOString().split('T')[0]))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-6 h-6 spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Loading reports...
        </div>
      </div>
    )
  }

  if (!stats) return null

  const { totals, dealTypes, salespersonStats, dailyCounts } = stats
  const completionRate = totals.total > 0 ? Math.round((totals.Delivered / totals.total) * 100) : 0
  const daysWithData = dailyCounts.length
  const avgPerDay = daysWithData > 0 ? (totals.total / daysWithData).toFixed(1) : 0
  const maxDailyTotal = Math.max(...dailyCounts.map(d => d.total), 1)

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Delivery Reports</h2>
        <div className="flex items-center gap-2 bg-up-dark/50 rounded-lg p-1">
          <button onClick={goPrevMonth} className="p-2 rounded hover:bg-up-slate/50 text-slate-400 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white font-semibold px-3">{formatMonthYear(range.start_date)}</span>
          <button onClick={goNextMonth} className="p-2 rounded hover:bg-up-slate/50 text-slate-400 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-up-navy rounded-xl p-5 border border-up-slate/40">
          <div className="text-sm text-slate-400 mb-1">Total Deliveries</div>
          <div className="text-3xl font-bold text-white">{totals.total}</div>
        </div>
        <div className="bg-up-navy rounded-xl p-5 border border-green-800/40">
          <div className="text-sm text-slate-400 mb-1">Delivered</div>
          <div className="text-3xl font-bold text-green-400">{totals.Delivered}</div>
        </div>
        <div className="bg-up-navy rounded-xl p-5 border border-up-slate/40">
          <div className="text-sm text-slate-400 mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-white">{completionRate}<span className="text-lg text-slate-500">%</span></div>
          <div className="mt-2 w-full h-2 rounded-full bg-up-slate/50 overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        <div className="bg-up-navy rounded-xl p-5 border border-up-slate/40">
          <div className="text-sm text-slate-400 mb-1">Avg / Day</div>
          <div className="text-3xl font-bold text-white">{avgPerDay}</div>
          <div className="text-xs text-slate-500 mt-1">{daysWithData} active day{daysWithData !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Deal Type Breakdown */}
        <div className="bg-up-navy rounded-xl p-5 border border-up-slate/40">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Deal Type Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Cash', count: dealTypes.Cash, color: 'bg-green-500', textColor: 'text-green-400' },
              { label: 'Finance', count: dealTypes.Finance, color: 'bg-blue-500', textColor: 'text-blue-400' },
              { label: 'Lease', count: dealTypes.Lease, color: 'bg-purple-500', textColor: 'text-purple-400' },
            ].map(dt => (
              <div key={dt.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-medium ${dt.textColor}`}>{dt.label}</span>
                  <span className="text-white font-bold">{dt.count}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-up-slate/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dt.color} transition-all duration-700 bar-animate`}
                    style={{ width: totals.total > 0 ? `${(dt.count / totals.total) * 100}%` : '0%' }}
                  />
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {totals.total > 0 ? Math.round((dt.count / totals.total) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-up-navy rounded-xl p-5 border border-up-slate/40">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Status Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Delivered', count: totals.Delivered, color: 'text-green-400', dot: 'bg-green-400' },
              { label: 'Scheduled', count: totals.Scheduled, color: 'text-blue-400', dot: 'bg-blue-400' },
              { label: 'Cancelled', count: totals.Cancelled, color: 'text-red-400', dot: 'bg-red-400' },
              { label: 'No Show', count: totals['No Show'], color: 'text-yellow-400', dot: 'bg-yellow-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-up-slate/20 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                  <span className={`text-sm ${s.color}`}>{s.label}</span>
                </div>
                <span className="text-white font-bold text-lg">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick numbers */}
        <div className="bg-up-navy rounded-xl p-5 border border-up-slate/40">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="#334155" strokeWidth="8" />
                  <circle cx="56" cy="56" r="48" fill="none" stroke="#22c55e" strokeWidth="8"
                    strokeDasharray={`${completionRate * 3.01} ${301 - completionRate * 3.01}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute">
                  <div className="text-2xl font-bold text-white">{completionRate}%</div>
                  <div className="text-xs text-slate-500">Complete</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-up-dark/50 rounded-lg p-3">
                <div className="text-xl font-bold text-white">{totals.Cancelled + totals['No Show']}</div>
                <div className="text-xs text-slate-500">Lost</div>
              </div>
              <div className="bg-up-dark/50 rounded-lg p-3">
                <div className="text-xl font-bold text-white">{totals.Scheduled}</div>
                <div className="text-xs text-slate-500">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salesperson Leaderboard */}
      <div className="bg-up-navy rounded-xl p-5 border border-up-slate/40 mb-8">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Salesperson Leaderboard</h3>
        {salespersonStats.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No data for this period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-up-slate/30">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Salesperson</th>
                  <th className="pb-3 pr-4 text-center">Total</th>
                  <th className="pb-3 pr-4 text-center">Delivered</th>
                  <th className="pb-3 pr-4 text-center">Cancelled</th>
                  <th className="pb-3 pr-4 text-center">No Show</th>
                  <th className="pb-3 text-center">Rate</th>
                </tr>
              </thead>
              <tbody>
                {salespersonStats.map((sp, i) => {
                  const rate = sp.total > 0 ? Math.round((sp.delivered / sp.total) * 100) : 0
                  return (
                    <tr key={sp.salesperson} className="border-b border-up-slate/10 hover:bg-up-slate/10 transition">
                      <td className="py-3 pr-4">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          i === 1 ? 'bg-slate-400/20 text-slate-300' :
                          i === 2 ? 'bg-amber-700/20 text-amber-500' :
                          'bg-up-slate/30 text-slate-500'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-white font-medium">{sp.salesperson}</td>
                      <td className="py-3 pr-4 text-center text-white font-bold">{sp.total}</td>
                      <td className="py-3 pr-4 text-center text-green-400 font-medium">{sp.delivered}</td>
                      <td className="py-3 pr-4 text-center text-red-400 font-medium">{sp.cancelled}</td>
                      <td className="py-3 pr-4 text-center text-yellow-400 font-medium">{sp.no_show}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-up-slate/50 overflow-hidden">
                            <div className="h-full rounded-full bg-green-500" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-sm text-slate-300 font-medium">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-up-navy rounded-xl p-5 border border-up-slate/40">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Daily Delivery Trend</h3>
        {dailyCounts.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No data for this period</div>
        ) : (
          <div className="flex items-end gap-1 h-48 px-2">
            {dailyCounts.map((day) => {
              const pct = (day.total / maxDailyTotal) * 100
              const deliveredPct = day.total > 0 ? (day.delivered / day.total) * 100 : 0
              const d = new Date(day.date + 'T00:00:00')
              const dayNum = d.getDate()
              const isWeekend = d.getDay() === 0 || d.getDay() === 6

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group" title={`${day.date}: ${day.total} total, ${day.delivered} delivered`}>
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white bg-up-dark border border-up-slate rounded px-2 py-1 whitespace-nowrap mb-1">
                    {day.total} ({day.delivered} delivered)
                  </div>
                  <div className="w-full relative rounded-t overflow-hidden" style={{ height: `${Math.max(pct, 4)}%` }}>
                    {/* Total bar */}
                    <div className="absolute inset-0 bg-blue-500/40 bar-animate" />
                    {/* Delivered portion */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-green-500/70 bar-animate"
                      style={{ height: `${deliveredPct}%` }}
                    />
                  </div>
                  <span className={`text-xs ${isWeekend ? 'text-slate-600' : 'text-slate-500'}`}>{dayNum}</span>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-up-slate/20">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500/40" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-500/70" />
            <span className="text-xs text-slate-500">Delivered</span>
          </div>
        </div>
      </div>
    </div>
  )
}
