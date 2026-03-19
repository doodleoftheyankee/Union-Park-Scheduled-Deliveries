import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import AppointmentBoard from './components/AppointmentBoard'
import AppointmentForm from './components/AppointmentForm'
import BoardView from './components/BoardView'
import { fetchAppointments, createAppointment, updateAppointment, deleteAppointment } from './api'

function App() {
  const [appointments, setAppointments] = useState([])
  const [view, setView] = useState('board') // 'board' | 'schedule' | 'tv'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterSalesperson, setFilterSalesperson] = useState('')

  const loadAppointments = useCallback(async () => {
    try {
      const data = await fetchAppointments({ date: selectedDate })
      setAppointments(data)
    } catch (err) {
      console.error('Failed to load appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadAppointments, 30000)
    return () => clearInterval(interval)
  }, [loadAppointments])

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
        <AppointmentBoard
          appointments={filteredAppointments}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteAppointment}
          onStatusChange={handleStatusChange}
          view={view}
        />
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
