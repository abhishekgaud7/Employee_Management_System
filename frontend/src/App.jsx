import React, { useEffect, useMemo, useState } from 'react'
import { supabase, hasSupabase, storageKey } from './supabase'

const TABLE = 'employees'

export default function App() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ name: '', email: '', role: '', salary: '' })
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [toast, setToast] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', salary: '' })

  const load = async () => {
    setLoading(true)
    try {
      if (hasSupabase) {
        const { data, error } = await supabase
          .from(TABLE)
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        setEmployees(data || [])
      } else {
        const raw = localStorage.getItem(storageKey)
        const data = raw ? JSON.parse(raw) : []
        setEmployees(data)
      }
    } catch (err) {
      setToast('Configure Supabase env to load data')
      setTimeout(() => setToast(''), 2500)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    const payload = { ...form, salary: Number(form.salary) }
    try {
      if (hasSupabase) {
        const { error } = await supabase
          .from(TABLE)
          .insert([{ ...payload }])
        if (error) throw error
      } else {
        const raw = localStorage.getItem(storageKey)
        const list = raw ? JSON.parse(raw) : []
        const row = { id: Date.now(), ...payload, created_at: new Date().toISOString() }
        localStorage.setItem(storageKey, JSON.stringify([row, ...list]))
      }
      setForm({ name: '', email: '', role: '', salary: '' })
      setToast('Employee added')
      setTimeout(() => setToast(''), 1800)
      load()
    } catch (err) {
      setToast('Supabase unavailable. Set URL and anon key.')
      setTimeout(() => setToast(''), 2500)
    }
  }

  const confirmDelete = (id) => setConfirmId(id)
  const cancelDelete = () => setConfirmId(null)
  const doDelete = async () => {
    const id = confirmId
    setConfirmId(null)
    if (hasSupabase) {
      const { error } = await supabase.from(TABLE).delete().eq('id', id)
      if (!error) {
        setToast('Employee deleted')
        setTimeout(() => setToast(''), 1500)
        load()
      }
    } else {
      const raw = localStorage.getItem(storageKey)
      const list = raw ? JSON.parse(raw) : []
      const next = list.filter(e => e.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(next))
      setToast('Employee deleted')
      setTimeout(() => setToast(''), 1500)
      load()
    }
  }

  const startEdit = (emp) => {
    setEditing(emp)
    setEditForm({ name: emp.name, email: emp.email, role: emp.role, salary: String(emp.salary || '') })
  }
  const cancelEdit = () => setEditing(null)
  const saveEdit = async () => {
    const payload = { ...editForm, salary: Number(editForm.salary) }
    if (hasSupabase) {
      const { error } = await supabase.from(TABLE).update(payload).eq('id', editing.id)
      if (!error) {
        setEditing(null)
        setToast('Employee updated')
        setTimeout(() => setToast(''), 1500)
        load()
      }
    } else {
      const raw = localStorage.getItem(storageKey)
      const list = raw ? JSON.parse(raw) : []
      const next = list.map(e => e.id === editing.id ? { ...e, ...payload } : e)
      localStorage.setItem(storageKey, JSON.stringify(next))
      setEditing(null)
      setToast('Employee updated')
      setTimeout(() => setToast(''), 1500)
      load()
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q ? employees.filter(e => `${e.name} ${e.email} ${e.role}`.toLowerCase().includes(q)) : employees
    const sorted = [...base].sort((a,b) => {
      const key = sortKey === 'createdAt' ? 'created_at' : sortKey
      const va = a[key]
      const vb = b[key]
      if (va === vb) return 0
      const cmp = va > vb ? 1 : -1
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [employees, query, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className="wrap">
      <h1 className="title">Employee Management System</h1>
      <div className="card">
        <form onSubmit={submit} className="grid">
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required />
          <div style={{display:'flex',gap:10}}>
            <input style={{flex:1}} placeholder="Salary" type="number" step="0.01" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} required />
            <button className="btn" type="submit">Add</button>
          </div>
        </form>
      </div>

      <div className="toolbar">
        <input className="search" placeholder="Search by name, email, role" value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th className="th" onClick={() => toggleSort('name')}>Name</th>
            <th className="th" onClick={() => toggleSort('email')}>Email</th>
            <th className="th" onClick={() => toggleSort('role')}>Role</th>
            <th className="th" onClick={() => toggleSort('salary')}>Salary</th>
            <th className="th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({length:4}).map((_,i) => (
            <tr key={i} className="row">
              <td className="td"><div className="skeleton" /></td>
              <td className="td"><div className="skeleton" /></td>
              <td className="td"><div className="skeleton" /></td>
              <td className="td"><div className="skeleton" /></td>
              <td className="td"><div className="skeleton" /></td>
            </tr>
          ))}
          {!loading && filtered.length === 0 && (
            <tr className="row"><td className="td" colSpan={5}><div className="empty">No employees found</div></td></tr>
          )}
          {!loading && filtered.map(e => (
            <tr key={e.id} className="row">
              <td className="td">{e.name}</td>
              <td className="td">{e.email}</td>
              <td className="td"><span className="pill">{e.role}</span></td>
              <td className="td">{Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(Number(e.salary||0))}</td>
              <td className="td">
                <div style={{display:'flex',gap:8}}>
                  <button className="btn warn" onClick={() => startEdit(e)}>Edit</button>
                  {confirmId===e.id ? (
                    <>
                      <button className="btn danger" onClick={doDelete}>Confirm</button>
                      <button className="btn" onClick={cancelDelete}>Cancel</button>
                    </>
                  ) : (
                    <button className="btn danger" onClick={() => confirmDelete(e.id)}>Delete</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {toast && <div className="toast">{toast}</div>}
      {editing && (
        <div className="dialog" onClick={cancelEdit}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="title" style={{fontSize:20}}>Edit Employee</div>
            <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
              <input placeholder="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              <input placeholder="Email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
              <input placeholder="Role" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} required />
              <input placeholder="Salary" type="number" step="0.01" value={editForm.salary} onChange={e => setEditForm({ ...editForm, salary: e.target.value })} required />
            </div>
            <div style={{display:'flex',gap:10,marginTop:12}}>
              <button className="btn" onClick={saveEdit}>Save</button>
              <button className="btn danger" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
