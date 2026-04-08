const API_BASE = '/api';

export async function fetchAppointments(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val) query.set(key, val);
  });
  const url = `${API_BASE}/appointments${query.toString() ? '?' + query : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function createAppointment(data) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create appointment');
  }
  return res.json();
}

export async function updateAppointment(id, data) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update appointment');
  }
  return res.json();
}

export async function deleteAppointment(id) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete appointment');
  return res.json();
}

export async function fetchStats(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val) query.set(key, val);
  });
  const url = `${API_BASE}/reports/stats${query.toString() ? '?' + query : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchSalespeople() {
  const res = await fetch(`${API_BASE}/salespeople`);
  if (!res.ok) throw new Error('Failed to fetch salespeople');
  return res.json();
}
