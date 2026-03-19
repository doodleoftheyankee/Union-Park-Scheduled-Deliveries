import React from 'react'
import AppointmentCard from './AppointmentCard'

function groupByTimePeriod(appointments) {
  const morning = []
  const afternoon = []
  const evening = []

  appointments.forEach(a => {
    const hour = parseInt(a.appointment_time.split(':')[0])
    if (hour < 12) morning.push(a)
    else if (hour < 17) afternoon.push(a)
    else evening.push(a)
  })

  return { morning, afternoon, evening }
}

function DealTypeSummary({ appointments }) {
  const cash = appointments.filter(a => a.deal_type === 'Cash').length
  const finance = appointments.filter(a => a.deal_type === 'Finance').length
  const lease = appointments.filter(a => a.deal_type === 'Lease').length
  const delivered = appointments.filter(a => a.status === 'Delivered').length

  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-up-navy border border-up-slate/50">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-slate-400 text-sm">Cash</span>
        <span className="text-white font-bold text-lg ml-1">{cash}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-up-navy border border-up-slate/50">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <span className="text-slate-400 text-sm">Finance</span>
        <span className="text-white font-bold text-lg ml-1">{finance}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-up-navy border border-up-slate/50">
        <div className="w-3 h-3 rounded-full bg-purple-500" />
        <span className="text-slate-400 text-sm">Lease</span>
        <span className="text-white font-bold text-lg ml-1">{lease}</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-900/20 border border-green-800/50">
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-green-400 text-sm">Delivered</span>
        <span className="text-green-300 font-bold text-lg ml-1">{delivered}</span>
      </div>
    </div>
  )
}

function TimeSection({ title, icon, appointments, onEdit, onDelete, onStatusChange }) {
  if (appointments.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-500">{icon}</span>
        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <span className="text-slate-600 text-xs">({appointments.length})</span>
        <div className="flex-1 h-px bg-up-slate/30 ml-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {appointments.map(a => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  )
}

export default function AppointmentBoard({ appointments, loading, onEdit, onDelete, onStatusChange }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-6 h-6 spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Loading deliveries...
        </div>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-up-navy flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-400 mb-2">No Deliveries Scheduled</h3>
        <p className="text-slate-600 text-sm">Click "New Delivery" to add an appointment</p>
      </div>
    )
  }

  const { morning, afternoon, evening } = groupByTimePeriod(appointments)

  return (
    <>
      <DealTypeSummary appointments={appointments} />

      <TimeSection
        title="Morning"
        icon="🌅"
        appointments={morning}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
      <TimeSection
        title="Afternoon"
        icon="☀️"
        appointments={afternoon}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
      <TimeSection
        title="Evening"
        icon="🌙"
        appointments={evening}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </>
  )
}
