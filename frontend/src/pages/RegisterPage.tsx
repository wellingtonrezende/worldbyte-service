import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('organizationName', data.organization.name);
      navigate('/app');
    } catch {
      setMessage('Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm(current => ({ ...current, [field]: value }));
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">WorldByte Service</div>
        <h1>Crie sua conta</h1>
        <p className="muted">Sua empresa começa com 7 dias de avaliação.</p>

        <form onSubmit={submit}>
          <label>Seu nome</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} required />

          <label>Nome da empresa</label>
          <input value={form.organizationName} onChange={e => update('organizationName', e.target.value)} required />

          <label>E-mail</label>
          <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required />

          <label>Senha</label>
          <input type="password" minLength={8} value={form.password} onChange={e => update('password', e.target.value)} required />

          {message && <div className="error">{message}</div>}

          <button disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
        </form>

        <p className="muted center">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
