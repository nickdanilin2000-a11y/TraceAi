'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetch('http://85.193.85.81:8000/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setUser(data))
    .catch(() => router.push('/login'))
  }, [router])

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!user) return (
    <div style={{ background: '#07090F', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#21aaff', fontFamily: 'sans-serif', fontSize: '18px' }}>
      Загрузка...
    </div>
  )

  return (
    <div style={{ background: '#07090F', minHeight: '100vh', fontFamily: 'sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0C1018', borderRight: '1px solid #1C2640', display: 'flex', flexDirection: 'column', padding: '16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '13px' }}>T</div>
          <span style={{ color: '#F0F4FC', fontWeight: '800', fontSize: '15px' }}>TraceAI</span>
        </div>
        {[
          { label: 'Дашборд', path: '/dashboard', icon: '◈' },
          { label: 'Редактор', path: '/editor', icon: '✦' },
          { label: 'AI-чат', path: '/chat', icon: '◎' },
          { label: 'Аналитика', path: '/analytics', icon: '▦' },
          { label: 'Audit Trail', path: '/audit', icon: '⊕' },
        ].map(item => (
          <div key={item.path} onClick={() => router.push(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 9px', borderRadius: '7px', cursor: 'pointer', color: item.path === '/dashboard' ? '#21aaff' : '#8A94A6', background: item.path === '/dashboard' ? 'rgba(33,170,255,0.12)' : 'transparent', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '10px 9px', borderTop: '1px solid #1C2640' }}>
          <div style={{ color: '#F0F4FC', fontSize: '12px', fontWeight: '600' }}>{user.name}</div>
          <div style={{ color: '#8A94A6', fontSize: '10px', marginBottom: '8px' }}>{user.email}</div>
          <div onClick={logout} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Выйти</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '24px' }}>
        <div style={{ color: '#F0F4FC', fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>
          Добро пожаловать, {user.name}! 👋
        </div>
        <div style={{ color: '#8A94A6', fontSize: '13px', marginBottom: '24px' }}>
          TraceAI запущен и готов к работе
        </div>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { val: '0', label: 'AI-запросов', color: '#21aaff' },
            { val: '0', label: 'Документов', color: '#22c55e' },
            { val: '100%', label: 'Залогировано', color: '#21aaff' },
            { val: '0 ₽', label: 'Токенов', color: '#f97316' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '10px', padding: '16px', borderTop: `2px solid ${k.color}` }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: k.color }}>{k.val}</div>
              <div style={{ fontSize: '11px', color: '#8A94A6', marginTop: '4px' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Welcome card */}
        <div style={{ background: '#111827', border: '1px solid rgba(33,170,255,0.2)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ color: '#21aaff', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>🚀 Система запущена</div>
          <div style={{ color: '#8A94A6', fontSize: '13px', lineHeight: '1.6' }}>
            Бэкенд работает на 85.193.85.81:8000<br/>
            База данных PostgreSQL подключена<br/>
            Redis запущен<br/>
            Все модули активны
          </div>
        </div>
      </div>
    </div>
  )
}