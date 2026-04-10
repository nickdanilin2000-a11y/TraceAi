'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuditPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetch('http://localhost:8000/audit/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false) })
    .catch(() => setLoading(false))
  }, [router])

  const nav = [
    { label: 'Дашборд', path: '/dashboard', icon: '◈' },
    { label: 'Редактор', path: '/editor', icon: '✦' },
    { label: 'AI-чат', path: '/chat', icon: '◎' },
    { label: 'Аналитика', path: '/analytics', icon: '▦' },
    { label: 'Audit Trail', path: '/audit', icon: '⊕' },
  ]

  const typeColors: any = {
    ai_generation: '#21aaff',
    document_created: '#22c55e',
    document_edited: '#f97316',
    status_changed: '#818cf8',
    default: '#8A94A6',
  }

  const typeLabels: any = {
    ai_generation: '🤖 AI генерация',
    document_created: '📄 Создан документ',
    document_edited: '✏️ Правка',
    status_changed: '🔄 Статус изменён',
  }

  const filtered = filter === 'all' ? logs : logs.filter(l => l.event_type === filter)

  return (
    <div style={{ background: '#07090F', minHeight: '100vh', fontFamily: 'sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0C1018', borderRight: '1px solid #1C2640', display: 'flex', flexDirection: 'column', padding: '16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '13px' }}>T</div>
          <span style={{ color: '#F0F4FC', fontWeight: '800', fontSize: '15px' }}>TraceAI</span>
        </div>
        {nav.map(item => (
          <div key={item.path} onClick={() => router.push(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 9px', borderRadius: '7px', cursor: 'pointer', color: item.path === '/audit' ? '#21aaff' : '#8A94A6', background: item.path === '/audit' ? 'rgba(33,170,255,0.12)' : 'transparent', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '10px 9px', borderTop: '1px solid #1C2640' }}>
          <div onClick={() => { localStorage.removeItem('token'); router.push('/login') }} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Выйти</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        <div style={{ color: '#F0F4FC', fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Audit Trail</div>
        <div style={{ color: '#8A94A6', fontSize: '13px', marginBottom: '20px' }}>Полная история всех AI-операций</div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { val: 'all', label: 'Все' },
            { val: 'ai_generation', label: '🤖 AI генерация' },
            { val: 'document_edited', label: '✏️ Правки' },
            { val: 'status_changed', label: '🔄 Статусы' },
          ].map(f => (
            <div key={f.val} onClick={() => setFilter(f.val)} style={{ padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: filter === f.val ? 'rgba(33,170,255,0.12)' : '#111827', border: `1px solid ${filter === f.val ? 'rgba(33,170,255,0.3)' : '#1C2640'}`, color: filter === f.val ? '#21aaff' : '#8A94A6' }}>
              {f.label}
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 160px 1fr 120px 80px', padding: '10px 16px', borderBottom: '1px solid #1C2640', background: '#0C1018' }}>
            {['Время', 'Тип события', 'Детали', 'Модель', 'Токены'].map(h => (
              <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#3D4A60', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8A94A6' }}>Загрузка...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#3D4A60' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⊕</div>
              <div>Событий пока нет</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Начните работу с AI-чатом или создайте документ</div>
            </div>
          )}

          {filtered.map((log, i) => {
            const color = typeColors[log.event_type] || typeColors.default
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 160px 1fr 120px 80px', padding: '10px 16px', borderBottom: '1px solid rgba(28,38,64,0.5)', alignItems: 'center', transition: 'background 0.1s' }}>
                <div style={{ fontSize: '11px', color: '#8A94A6', fontFamily: 'monospace' }}>
                  {new Date(log.created_at).toLocaleString('ru')}
                </div>
                <div>
                  <span style={{ background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: '20px', padding: '2px 10px', fontSize: '10px', fontWeight: '700' }}>
                    {typeLabels[log.event_type] || log.event_type}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#8A94A6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.details || '—'}
                </div>
                <div style={{ fontSize: '11px', color: '#3D4A60', fontFamily: 'monospace' }}>
                  {log.model_used || '—'}
                </div>
                <div style={{ fontSize: '11px', color: '#3D4A60', fontFamily: 'monospace' }}>
                  {log.tokens_used || 0}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}