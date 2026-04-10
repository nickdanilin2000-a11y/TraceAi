'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { router.push('/login'); return }
    setToken(t)
  }, [router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', text: input, time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt: input, model: 'gigachat' }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, {
          role: 'ai', text: data.text,
          tokens: data.tokens, model: data.model,
          time: new Date().toLocaleTimeString()
        }])
      } else {
        setMessages(prev => [...prev, { role: 'error', text: data.detail || 'Ошибка', time: new Date().toLocaleTimeString() }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'error', text: 'Ошибка соединения', time: new Date().toLocaleTimeString() }])
    } finally {
      setLoading(false)
    }
  }

  const nav = [
    { label: 'Дашборд', path: '/dashboard', icon: '◈' },
    { label: 'Редактор', path: '/editor', icon: '✦' },
    { label: 'AI-чат', path: '/chat', icon: '◎' },
    { label: 'Аналитика', path: '/analytics', icon: '▦' },
    { label: 'Audit Trail', path: '/audit', icon: '⊕' },
  ]

  return (
    <div style={{ background: '#07090F', height: '100vh', fontFamily: 'sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0C1018', borderRight: '1px solid #1C2640', display: 'flex', flexDirection: 'column', padding: '16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '13px' }}>T</div>
          <span style={{ color: '#F0F4FC', fontWeight: '800', fontSize: '15px' }}>TraceAI</span>
        </div>
        {nav.map(item => (
          <div key={item.path} onClick={() => router.push(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 9px', borderRadius: '7px', cursor: 'pointer', color: item.path === '/chat' ? '#21aaff' : '#8A94A6', background: item.path === '/chat' ? 'rgba(33,170,255,0.12)' : 'transparent', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '10px 9px', borderTop: '1px solid #1C2640' }}>
          <div onClick={() => { localStorage.removeItem('token'); router.push('/login') }} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Выйти</div>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1C2640', display: 'flex', alignItems: 'center', gap: '10px', background: '#0C1018' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#F0F4FC' }}>AI-чат</div>
          <div style={{ background: 'rgba(33,170,255,0.12)', border: '1px solid rgba(33,170,255,0.2)', color: '#21aaff', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>GigaChat Pro</div>
          <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#8A94A6' }}>Все запросы логируются</div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#3D4A60', marginTop: '80px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✦</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#8A94A6' }}>Начните диалог с AI</div>
              <div style={{ fontSize: '13px', color: '#3D4A60', marginTop: '4px' }}>Каждый запрос автоматически логируется</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg, #818cf8, #6366f1)' : 'linear-gradient(135deg, #21aaff, #0d8fdb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                {msg.role === 'user' ? 'Вы' : '✦'}
              </div>
              <div style={{ maxWidth: '70%' }}>
                <div style={{ padding: '11px 14px', borderRadius: '12px', background: msg.role === 'user' ? 'linear-gradient(135deg, #21aaff, #0d8fdb)' : msg.role === 'error' ? 'rgba(239,68,68,0.1)' : '#111827', border: msg.role === 'ai' ? '1px solid #1C2640' : msg.role === 'error' ? '1px solid rgba(239,68,68,0.3)' : 'none', color: msg.role === 'error' ? '#ef4444' : '#F0F4FC', fontSize: '13px', lineHeight: '1.6' }}>
                  {msg.text}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px', color: '#3D4A60', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <span>{msg.time}</span>
                  {msg.tokens && <span>● Залогировано · {msg.tokens} токенов</span>}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff' }}>✦</div>
              <div style={{ padding: '11px 14px', background: '#111827', border: '1px solid #1C2640', borderRadius: '12px', color: '#8A94A6', fontSize: '13px' }}>
                Генерирую ответ...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1C2640', background: '#0C1018' }}>
          <div style={{ background: '#111827', border: '1px solid #1C2640', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', padding: '12px 14px', gap: '10px' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Напишите запрос к AI... (Enter для отправки)"
                rows={1}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#F0F4FC', fontSize: '13px', resize: 'none', fontFamily: 'sans-serif', lineHeight: '1.5' }}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', color: '#fff', border: 'none', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: loading || !input.trim() ? 0.5 : 1 }}>↑</button>
            </div>
            <div style={{ padding: '8px 14px', borderTop: '1px solid #1C2640', fontSize: '10px', color: '#3D4A60' }}>
              Все запросы логируются автоматически · GigaChat Pro
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}