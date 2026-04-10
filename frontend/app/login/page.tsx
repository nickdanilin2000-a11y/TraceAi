'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const url = isLogin
        ? 'http://localhost:8000/auth/login'
        : 'http://localhost:8000/auth/register'
      const body = isLogin
        ? { email, password }
        : { email, password, name, company_name: company }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Ошибка'); return }
      localStorage.setItem('token', data.access_token)
      router.push('/dashboard')
    } catch {
      setError('Ошибка соединения с сервером')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    background: '#1A2234',
    border: '1px solid #1C2640',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#F0F4FC',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif',
  }

  return (
    <div style={{ background: '#07090F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '12px' }}>T</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FC' }}>TraceAI</div>
          <div style={{ fontSize: '13px', color: '#8A94A6', marginTop: '4px' }}>{isLogin ? 'Войдите в аккаунт' : 'Создайте аккаунт'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isLogin && (
            <>
              <input placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} style={inp} />
              <input placeholder="Название компании" value={company} onChange={e => setCompany(e.target.value)} style={inp} />
            </>
          )}
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
          <input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inp} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
          {error && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', fontFamily: 'sans-serif' }}>
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
          <div onClick={() => setIsLogin(!isLogin)} style={{ textAlign: 'center', color: '#21aaff', fontSize: '13px', cursor: 'pointer' }}>
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </div>
        </div>
      </div>
    </div>
  )
}'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'basedtech2026'

export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const login = () => {
    if (pass === ADMIN_PASSWORD) {
      setAuthed(true)
      loadData()
    } else {
      setError('Неверный пароль')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [statsRes, logsRes] = await Promise.all([
        fetch('http://85.193.85.81:8000/audit/stats', { headers }),
        fetch('http://85.193.85.81:8000/audit/?limit=100', { headers }),
      ])

      const statsData = await statsRes.json()
      const logsData = await logsRes.json()

      setStats(statsData)
      setLogs(Array.isArray(logsData) ? logsData : [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (!authed) return (
    <div style={{ background: '#07090F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '16px', padding: '40px', width: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#F0F4FC' }}>Admin Panel</div>
          <div style={{ fontSize: '12px', color: '#8A94A6', marginTop: '4px' }}>Based Tech · TraceAI</div>
        </div>
        <input
          type="password"
          placeholder="Пароль администратора"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') login() }}
          style={{ width: '100%', background: '#1A2234', border: '1px solid #1C2640', borderRadius: '8px', padding: '12px 14px', color: '#F0F4FC', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
        />
        {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}
        <button onClick={login} style={{ width: '100%', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
          Войти
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#07090F', minHeight: '100vh', fontFamily: 'sans-serif', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FC' }}>🔐 Admin Panel</div>
          <div style={{ fontSize: '13px', color: '#8A94A6' }}>Based Tech · TraceAI · Только для владельца</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadData} style={{ background: '#111827', color: '#21aaff', border: '1px solid #1C2640', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
            🔄 Обновить
          </button>
          <button onClick={() => router.push('/dashboard')} style={{ background: '#111827', color: '#8A94A6', border: '1px solid #1C2640', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}>
            ← Дашборд
          </button>
        </div>
      </div>

      {loading && <div style={{ color: '#8A94A6', textAlign: 'center', padding: '40px' }}>Загрузка...</div>}

      {!loading && stats && (
        <>
          {/* KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { val: stats.total_requests, label: 'Всего AI-запросов', color: '#21aaff' },
              { val: stats.total_tokens, label: 'Всего токенов', color: '#22c55e' },
              { val: logs.length, label: 'Событий в логах', color: '#f97316' },
            ].map((k, i) => (
              <div key={i} style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '10px', padding: '20px', borderTop: `2px solid ${k.color}` }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: k.color }}>{k.val}</div>
                <div style={{ fontSize: '12px', color: '#8A94A6', marginTop: '4px' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* По типам */}
          <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ color: '#F0F4FC', fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>📊 По типам операций</div>
            {stats.by_event_type.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1C2640' }}>
                <div style={{ fontSize: '13px', color: '#F0F4FC' }}>{item.event_type}</div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#21aaff', fontWeight: '700' }}>{item.count} операций</span>
                  <span style={{ fontSize: '12px', color: '#3D4A60' }}>{item.tokens} токенов</span>
                </div>
              </div>
            ))}
          </div>

          {/* Последние события */}
          <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1C2640' }}>
              <div style={{ color: '#F0F4FC', fontSize: '14px', fontWeight: '700' }}>📋 Последние 100 событий</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0C1018' }}>
                    {['Время', 'Тип', 'User ID', 'Модель', 'Токены', 'Детали'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: '10px', fontWeight: '700', color: '#3D4A60', textAlign: 'left', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(28,38,64,0.5)' }}>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: '#8A94A6', fontFamily: 'monospace' }}>
                        {new Date(log.created_at).toLocaleString('ru')}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: '#21aaff', fontWeight: '700' }}>{log.event_type}</td>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: '#8A94A6' }}>{log.user_id}</td>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: '#3D4A60', fontFamily: 'monospace' }}>{log.model_used || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: '#3D4A60' }}>{log.tokens_used}</td>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: '#8A94A6', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}