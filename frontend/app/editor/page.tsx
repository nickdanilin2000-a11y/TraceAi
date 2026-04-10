'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditorPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [docs, setDocs] = useState<any[]>([])
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { router.push('/login'); return }
    setToken(t)
    loadDocs(t)
  }, [router])

  const loadDocs = async (t: string) => {
    const res = await fetch('http://85.193.85.81:8000/documents/', {
      headers: { 'Authorization': `Bearer ${t}` }
    })
    const data = await res.json()
    setDocs(Array.isArray(data) ? data : [])
  }

  const selectDoc = async (doc: any) => {
    const res = await fetch(`http://85.193.85.81:8000/documents/${doc.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setSelectedDoc(data)
    setContent(data.content || '')
    setTitle(data.title || '')
  }

  const saveDoc = async () => {
    if (!selectedDoc) return
    setSaving(true)
    await fetch(`http://85.193.85.81:8000/documents/${selectedDoc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content, title }),
    })
    setSaving(false)
    loadDocs(token)
  }

  const createDoc = async () => {
    if (!newTitle.trim()) return
    const res = await fetch('http://85.193.85.81:8000/documents/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: newTitle, content: '' }),
    })
    const data = await res.json()
    setShowNew(false)
    setNewTitle('')
    await loadDocs(token)
    selectDoc(data)
  }

  const askAi = async () => {
    if (!aiPrompt.trim() || !selectedDoc) return
    setAiLoading(true)
    const res = await fetch(`http://85.193.85.81:8000/documents/${selectedDoc.id}/ai-assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ prompt: aiPrompt }),
    })
    const data = await res.json()
    if (data.text) {
      setContent(prev => prev + '\n\n' + data.text)
    }
    setAiPrompt('')
    setAiLoading(false)
  }

  const updateStatus = async (status: string) => {
    if (!selectedDoc) return
    await fetch(`http://85.193.85.81:8000/documents/${selectedDoc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    setSelectedDoc({ ...selectedDoc, status })
    loadDocs(token)
  }

  const nav = [
    { label: 'Дашборд', path: '/dashboard', icon: '◈' },
    { label: 'Редактор', path: '/editor', icon: '✦' },
    { label: 'AI-чат', path: '/chat', icon: '◎' },
    { label: 'Аналитика', path: '/analytics', icon: '▦' },
    { label: 'Audit Trail', path: '/audit', icon: '⊕' },
  ]

  const statusColors: any = {
    draft: { bg: 'rgba(33,170,255,0.1)', color: '#21aaff', label: 'Черновик' },
    review: { bg: 'rgba(249,115,22,0.1)', color: '#f97316', label: 'На проверке' },
    approved: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'Утверждён' },
    sent: { bg: 'rgba(129,140,248,0.1)', color: '#818cf8', label: 'Отправлен' },
  }

  return (
    <div style={{ background: '#07090F', height: '100vh', fontFamily: 'sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0C1018', borderRight: '1px solid #1C2640', display: 'flex', flexDirection: 'column', padding: '16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#fff', fontSize: '13px' }}>T</div>
          <span style={{ color: '#F0F4FC', fontWeight: '800', fontSize: '15px' }}>TraceAI</span>
        </div>
        {nav.map(item => (
          <div key={item.path} onClick={() => router.push(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 9px', borderRadius: '7px', cursor: 'pointer', color: item.path === '/editor' ? '#21aaff' : '#8A94A6', background: item.path === '/editor' ? 'rgba(33,170,255,0.12)' : 'transparent', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '10px 9px', borderTop: '1px solid #1C2640' }}>
          <div onClick={() => { localStorage.removeItem('token'); router.push('/login') }} style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Выйти</div>
        </div>
      </div>

      {/* Doc list */}
      <div style={{ width: '220px', background: '#0C1018', borderRight: '1px solid #1C2640', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px', borderBottom: '1px solid #1C2640' }}>
          <div style={{ color: '#F0F4FC', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Документы</div>
          <button onClick={() => setShowNew(true)} style={{ width: '100%', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Новый</button>
        </div>

        {showNew && (
          <div style={{ padding: '10px' }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Название документа" style={{ width: '100%', background: '#111827', border: '1px solid #1C2640', borderRadius: '6px', padding: '7px', color: '#F0F4FC', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <button onClick={createDoc} style={{ flex: 1, background: '#21aaff', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Создать</button>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, background: '#1A2234', color: '#8A94A6', border: 'none', borderRadius: '6px', padding: '6px', fontSize: '11px', cursor: 'pointer' }}>Отмена</button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {docs.map(doc => {
            const st = statusColors[doc.status] || statusColors.draft
            return (
              <div key={doc.id} onClick={() => selectDoc(doc)} style={{ padding: '9px 10px', borderRadius: '7px', cursor: 'pointer', marginBottom: '4px', background: selectedDoc?.id === doc.id ? 'rgba(33,170,255,0.08)' : 'transparent', border: `1px solid ${selectedDoc?.id === doc.id ? 'rgba(33,170,255,0.2)' : 'transparent'}` }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#F0F4FC', marginBottom: '4px' }}>{doc.title}</div>
                <span style={{ background: st.bg, color: st.color, fontSize: '9px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px' }}>{st.label}</span>
              </div>
            )
          })}
          {docs.length === 0 && <div style={{ color: '#3D4A60', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>Документов пока нет</div>}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedDoc ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D4A60', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '40px' }}>✦</div>
            <div style={{ fontSize: '16px', color: '#8A94A6' }}>Выберите документ или создайте новый</div>
          </div>
        ) : (
          <>
            {/* Doc header */}
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #1C2640', display: 'flex', alignItems: 'center', gap: '10px', background: '#0C1018' }}>
              <input value={title} onChange={e => setTitle(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F0F4FC', fontSize: '15px', fontWeight: '800', flex: 1 }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                {Object.entries(statusColors).map(([key, val]: any) => (
                  <div key={key} onClick={() => updateStatus(key)} style={{ padding: '3px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '10px', fontWeight: '700', background: selectedDoc.status === key ? val.bg : 'transparent', color: selectedDoc.status === key ? val.color : '#3D4A60', border: `1px solid ${selectedDoc.status === key ? val.color + '40' : '#1C2640'}` }}>
                    {val.label}
                  </div>
                ))}
              </div>
              <button onClick={saveDoc} disabled={saving} style={{ background: '#21aaff', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>

            {/* Text area */}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Начните писать документ..."
              style={{ flex: 1, background: '#07090F', border: 'none', outline: 'none', color: '#F0F4FC', fontSize: '14px', lineHeight: '1.8', padding: '24px 32px', resize: 'none', fontFamily: 'sans-serif' }}
            />

            {/* AI assist */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid #1C2640', background: '#0C1018' }}>
              <div style={{ background: '#111827', border: '1px solid rgba(33,170,255,0.15)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
                  <div style={{ width: '22px', height: '22px', background: 'linear-gradient(135deg, #21aaff, #0d8fdb)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', flexShrink: 0 }}>✦</div>
                  <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') askAi() }} placeholder="Попроси AI помочь с документом..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#F0F4FC', fontSize: '13px', fontFamily: 'sans-serif' }} />
                  <button onClick={askAi} disabled={aiLoading} style={{ background: '#21aaff', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', opacity: aiLoading ? 0.5 : 1 }}>
                    {aiLoading ? '...' : '→'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}