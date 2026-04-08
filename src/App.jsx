import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Header from './components/Header'
import AppointmentBoard from './components/AppointmentBoard'
import AppointmentForm from './components/AppointmentForm'
import BoardView from './components/BoardView'
import WeekView from './components/WeekView'
import MonthView from './components/MonthView'
import ReportsView from './components/ReportsView'
import { fetchAppointments, createAppointment, updateAppointment, deleteAppointment } from './api'

function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start_date: monday.toISOString().split('T')[0],
    end_date: sunday.toISOString().split('T')[0],
  }
}

function getMonthRange(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  }
}

function App() {
  const [appointments, setAppointments] = useState([])
  const [view, setView] = useState('board') // 'board' | 'schedule' | 'tv' | 'week' | 'month' | 'reports'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterSalesperson, setFilterSalesperson] = useState('')

  // Compute fetch params based on view
  const fetchParams = useMemo(() => {
    if (view === 'week') return getWeekRange(selectedDate)
    if (view === 'month') return getMonthRange(selectedDate)
    return { date: selectedDate }
  }, [view, selectedDate])

  const loadAppointments = useCallback(async () => {
    try {
      const data = await fetchAppointments(fetchParams)
      setAppointments(data)
    } catch (err) {
      console.error('Failed to load appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchParams])

  useEffect(() => {
    if (view !== 'reports') {
      setLoading(true)
      loadAppointments()
    }
  }, [loadAppointments, view])

  // Auto-refresh every 30 seconds (skip reports view)
  useEffect(() => {
    if (view === 'reports') return
    const interval = setInterval(loadAppointments, 30000)
    return () => clearInterval(interval)
  }, [loadAppointments, view])

  const handleCreateAppointment = async (data) => {
    await createAppointment(data)
    setShowForm(false)
    loadAppointments()
  }

  const handleUpdateAppointment = async (id, data) => {
    await updateAppointment(id, data)
    setEditingAppointment(null)
    loadAppointments()
  }

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return
    await deleteAppointment(id)
    loadAppointments()
  }

  const handleStatusChange = async (id, newStatus) => {
    await updateAppointment(id, { status: newStatus })
    loadAppointments()
  }

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAppointment(null)
  }

  // When clicking a day in week/month view, switch to day board
  const handleSelectDate = (date) => {
    setSelectedDate(date)
    setView('board')
  }

  const filteredAppointments = filterSalesperson
    ? appointments.filter(a => a.salesperson === filterSalesperson)
    : appointments

  // TV / Board view (full screen, no header controls)
  if (view === 'tv') {
    return (
      <BoardView
        appointments={filteredAppointments}
        selectedDate={selectedDate}
        onExit={() => setView('board')}
      />
    )
  }

  const renderMainContent = () => {
    switch (view) {
      case 'week':
        return (
          <WeekView
            appointments={filteredAppointments}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )
      case 'month':
        return (
          <MonthView
            appointments={filteredAppointments}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )
      case 'reports':
        return (
          <ReportsView selectedDate={selectedDate} />
        )
      default:
        return (
          <AppointmentBoard
            appointments={filteredAppointments}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteAppointment}
            onStatusChange={handleStatusChange}
            view={view}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-up-dark">
      <Header
        view={view}
        onViewChange={setView}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNewAppointment={() => { setEditingAppointment(null); setShowForm(true) }}
        appointmentCount={filteredAppointments.length}
        filterSalesperson={filterSalesperson}
        onFilterSalesperson={setFilterSalesperson}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderMainContent()}
      </main>

      {showForm && (
        <AppointmentForm
          onSubmit={editingAppointment
            ? (data) => handleUpdateAppointment(editingAppointment.id, data)
            : handleCreateAppointment
          }
          onClose={handleCloseForm}
          initialData={editingAppointment}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}

export default App
