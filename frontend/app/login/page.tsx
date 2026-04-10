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
}