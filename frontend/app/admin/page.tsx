'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const API = 'http://85.193.85.81:8000'

const PLAN_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  starter:    { color: '#8A94A6', bg: 'rgba(138,148,166,0.12)', label: 'Starter' },
  business:   { color: '#21aaff', bg: 'rgba(33,170,255,0.12)',  label: 'Business' },
  enterprise: { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  label: 'Enterprise' },
}

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  superadmin: { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  admin:      { color: '#21aaff', bg: 'rgba(33,170,255,0.12)' },
  manager:    { color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  employee:   { color: '#8A94A6', bg: 'rgba(138,148,166,0.12)' },
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'companies' | 'users'>('companies')
  const [stats, setStats] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')

  const loadAll = useCallback(async (t: string) => {
    setLoading(true)
    const h = { 'Authorization': `Bearer ${t}` }
    try {
      const [sRes, cRes, uRes] = await Promise.all([
        fetch(`${API}/admin/stats`,     { headers: h }),
        fetch(`${API}/admin/companies`, { headers: h }),
        fetch(`${API}/admin/users`,     { headers: h }),
      ])
      if (sRes.status === 403) { router.push('/dashboard'); return }
      setStats(await sRes.json())
      setCompanies(await cRes.json())
      setUsers(await uRes.json())
    } catch { /* network error */ }
    setLoading(false)
  }, [router])

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { router.push('/login'); return }
    setToken(t)
    loadAll(t)
  }, [router, loadAll])

  const updateUser = async (userId: number, data: object) => {
    await fetch(`${API}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    loadAll(token)
  }

  const updateCompany = async (companyId: number, data: object) => {
    await fetch(`${API}/admin/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    loadAll(token)
  }

  if (loading) return (
    <div style={{ background: '#07090F', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#21aaff', fontFamily: 'sans-serif', fontSize: '16px' }}>
      Загрузка...
    </div>
  )

  return (
    <div style={{ background: '#07090F', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Top bar */}
      <div style={{ background: '#0C1018', borderBottom: '1px solid #1C2640', padding: '13px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '13px' }}>T</div>
        <span style={{ color: '#F0F4FC', fontWeight: '800', fontSize: '15px' }}>TraceAI</span>
        <span style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.35)', color: '#f97316', fontSize: '11px', fontWeight: '800', padding: '2px 10px', borderRadius: '20px', letterSpacing: '0.04em' }}>SUPERADMIN</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span onClick={() => router.push('/dashboard')} style={{ color: '#8A94A6', fontSize: '13px', cursor: 'pointer' }}>← Дашборд</span>
          <span onClick={() => { localStorage.removeItem('token'); router.push('/login') }} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Выйти</span>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ color: '#F0F4FC', fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>Панель администратора</div>
        <div style={{ color: '#8A94A6', fontSize: '13px', marginBottom: '24px' }}>Управление платформой TraceAI</div>

        {/* KPI */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
            {[
              { val: stats.companies,    label: 'Компаний',        color: '#21aaff' },
              { val: stats.users,        label: 'Пользователей',   color: '#22c55e' },
              { val: stats.documents,    label: 'Документов',      color: '#818cf8' },
              { val: stats.ai_requests,  label: 'AI-запросов',     color: '#f97316' },
              { val: stats.total_tokens, label: 'Токенов всего',   color: '#8A94A6' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '10px', padding: '18px', borderTop: `2px solid ${s.color}` }}>
                <div style={{ fontSize: '30px', fontWeight: '900', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: '#8A94A6', marginTop: '6px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#0C1018', border: '1px solid #1C2640', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {(['companies', 'users'] as const).map(t => (
            <div key={t} onClick={() => setTab(t)} style={{ padding: '7px 20px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: tab === t ? '#1A2234' : 'transparent', color: tab === t ? '#F0F4FC' : '#8A94A6', transition: 'all 0.15s' }}>
              {t === 'companies' ? `Компании (${companies.length})` : `Пользователи (${users.length})`}
            </div>
          ))}
        </div>

        {/* ── COMPANIES ── */}
        {tab === 'companies' && (
          <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 70px 70px 110px 130px', padding: '10px 16px', background: '#0C1018', borderBottom: '1px solid #1C2640' }}>
              {['Компания', 'Тариф', 'Польз.', 'Доки', 'Токены', 'Создана'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#3D4A60', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
              ))}
            </div>
            {companies.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#3D4A60' }}>Компаний пока нет</div>
            )}
            {companies.map(c => {
              const plan = PLAN_COLORS[c.plan] ?? PLAN_COLORS.starter
              return (
                <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 70px 70px 110px 130px', padding: '12px 16px', borderBottom: '1px solid rgba(28,38,64,0.5)', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#F0F4FC', fontSize: '13px', fontWeight: '600' }}>{c.name}</div>
                    <div style={{ color: '#3D4A60', fontSize: '11px', marginTop: '2px' }}>ID: {c.id}</div>
                  </div>
                  <select
                    value={c.plan}
                    onChange={e => updateCompany(c.id, { plan: e.target.value })}
                    style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.color}55`, borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="starter">Starter</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <div style={{ color: '#F0F4FC', fontSize: '13px' }}>{c.users_count}</div>
                  <div style={{ color: '#F0F4FC', fontSize: '13px' }}>{c.docs_count}</div>
                  <div style={{ color: '#8A94A6', fontSize: '12px', fontFamily: 'monospace' }}>{c.tokens_used}</div>
                  <div style={{ color: '#3D4A60', fontSize: '11px', fontFamily: 'monospace' }}>{new Date(c.created_at).toLocaleDateString('ru')}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 130px 140px 90px 120px', padding: '10px 16px', background: '#0C1018', borderBottom: '1px solid #1C2640' }}>
              {['Пользователь', 'Компания', 'Email', 'Роль', 'Статус', 'Действие'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#3D4A60', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
              ))}
            </div>
            {users.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#3D4A60' }}>Пользователей пока нет</div>
            )}
            {users.map(u => {
              const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.employee
              return (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 130px 140px 90px 120px', padding: '12px 16px', borderBottom: '1px solid rgba(28,38,64,0.5)', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#F0F4FC', fontSize: '13px', fontWeight: '600' }}>{u.name}</div>
                    <div style={{ color: '#3D4A60', fontSize: '11px', marginTop: '2px' }}>ID: {u.id}</div>
                  </div>
                  <div style={{ color: '#8A94A6', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.company_name}</div>
                  <div style={{ color: '#3D4A60', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  <select
                    value={u.role}
                    onChange={e => updateUser(u.id, { role: e.target.value })}
                    style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.color}55`, borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', outline: 'none', width: '120px' }}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                  <span style={{ background: u.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: u.is_active ? '#22c55e' : '#ef4444', border: `1px solid ${u.is_active ? '#22c55e55' : '#ef444455'}`, borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {u.is_active ? 'Активен' : 'Заблокир.'}
                  </span>
                  <button
                    onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                    style={{ background: u.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: u.is_active ? '#ef4444' : '#22c55e', border: `1px solid ${u.is_active ? '#ef444455' : '#22c55e55'}`, borderRadius: '7px', padding: '5px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {u.is_active ? 'Блок.' : 'Разблок.'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
