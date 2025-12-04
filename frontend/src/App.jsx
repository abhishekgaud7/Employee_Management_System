import React, { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8080/api/employees'

export default function App() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ name: '', email: '', role: '', salary: '' })
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(API_BASE)
    const data = await res.json()
    setEmployees(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    const payload = { ...form, salary: Number(form.salary) }
    const res = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setForm({ name: '', email: '', role: '', salary: '' })
      load()
    }
  }

  const remove = async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'system-ui, Arial' }}>
      <h1>Employee Management System</h1>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required />
        <input placeholder="Salary" type="number" step="0.01" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} required />
        <button type="submit">Add Employee</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Role</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Salary</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>{e.role}</td>
                <td>{e.salary}</td>
                <td>
                  <button onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
