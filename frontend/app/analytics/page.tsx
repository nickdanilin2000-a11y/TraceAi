'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetch('http://85.193.85.81:8000/audit/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => { setStats(data); setLoading(false) })
    .catch(() => setLoading(false))
  }, [router])

  const nav = [
    { label: 'Дашборд', path: '/dashboard', icon: '◈' },
    { label: 'Редактор', path: '/editor', icon: '✦' },
    { label: 'AI-чат', path: '/chat', icon: '◎' },
    { label: 'Аналитика', path: '/analytics', icon: '▦' },
    { label: 'Audit Trail', path: '/audit', icon: '⊕' },
  ]

  const typeLabels: any = {
    ai_generation: '🤖 AI генерация',
    document_created: '📄 Создан документ',
    document_edited: '✏️ Правка',
    status_changed: '🔄 Статус изменён',
  }

  const typeColors: any = {
    ai_generation: '#21aaff',
    document_created: '#22c55e',
    document_edited: '#f97316',
    status_changed: '#818cf8',
  }

  return (
    <div style={{ background: '#07090F', minHeight: '100vh', fontFamily: 'sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0C1018', borderRight: '1px solid #1C2640', display: 'flex', flexDirection: 'column', padding: '16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '13px' }}>T</div>
          <span style={{ color: '#F0F4FC', fontWeight: '800', fontSize: '15px' }}>TraceAI</span>
        </div>
        {nav.map(item => (
          <div key={item.path} onClick={() => router.push(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 9px', borderRadius: '7px', cursor: 'pointer', color: item.path === '/analytics' ? '#21aaff' : '#8A94A6', background: item.path === '/analytics' ? 'rgba(33,170,255,0.12)' : 'transparent', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '10px 9px', borderTop: '1px solid #1C2640' }}>
          <div onClick={() => { localStorage.removeItem('token'); router.push('/login') }} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Выйти</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        <div style={{ color: '#F0F4FC', fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Аналитика</div>
        <div style={{ color: '#8A94A6', fontSize: '13px', marginBottom: '24px' }}>Статистика использования AI</div>

        {loading && (
          <div style={{ color: '#8A94A6', textAlign: 'center', marginTop: '60px' }}>Загрузка...</div>
        )}

        {!loading && stats && (
          <>
            {/* KPI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '10px', padding: '20px', borderTop: '2px solid #21aaff' }}>
                <div style={{ fontSize: '36px', fontWeight: '900', color: '#21aaff' }}>{stats.total_requests}</div>
                <div style={{ fontSize: '12px', color: '#8A94A6', marginTop: '6px' }}>Всего AI-операций</div>
              </div>
              <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '10px', padding: '20px', borderTop: '2px solid #22c55e' }}>
                <div style={{ fontSize: '36px', fontWeight: '900', color: '#22c55e' }}>{stats.total_tokens}</div>
                <div style={{ fontSize: '12px', color: '#8A94A6', marginTop: '6px' }}>Всего токенов</div>
              </div>
              <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '10px', padding: '20px', borderTop: '2px solid #f97316' }}>
                <div style={{ fontSize: '36px', fontWeight: '900', color: '#f97316' }}>100%</div>
                <div style={{ fontSize: '12px', color: '#8A94A6', marginTop: '6px' }}>Залогировано</div>
              </div>
            </div>

            {/* По типам */}
            <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ color: '#F0F4FC', fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>По типам операций</div>
              {stats.by_event_type.length === 0 && (
                <div style={{ color: '#3D4A60', fontSize: '13px' }}>Данных пока нет</div>
              )}
              {stats.by_event_type.map((item: any, i: number) => {
                const color = typeColors[item.event_type] || '#8A94A6'
                const maxCount = Math.max(...stats.by_event_type.map((x: any) => x.count))
                const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                return (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ fontSize: '12px', color: '#F0F4FC', fontWeight: '500' }}>
                        {typeLabels[item.event_type] || item.event_type}
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: color, fontWeight: '700' }}>{item.count} операций</span>
                        <span style={{ fontSize: '12px', color: '#3D4A60' }}>{item.tokens} токенов</span>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: '#1A2234', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Инфо */}
            <div style={{ background: '#111827', border: '1px solid rgba(33,170,255,0.15)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ color: '#21aaff', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>💡 Следующий шаг</div>
              <div style={{ color: '#8A94A6', fontSize: '13px', lineHeight: '1.6' }}>
                Подключите GigaChat API на <span style={{ color: '#21aaff' }}>developers.sber.ru</span> чтобы использовать реальный AI. После подключения здесь появится стоимость токенов в рублях.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}