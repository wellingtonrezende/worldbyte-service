import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('organizationName', data.organization.name);
      navigate('/app');
    } catch {
      setMessage('Não foi possível entrar. Confira seus dados.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">WorldByte Service</div>
        <h1>Entrar</h1>
        <p className="muted">Acesse sua empresa e continue seus atendimentos.</p>

        <form onSubmit={submit}>
          <label>E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />

          <label>Senha</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />

          {message && <div className="error">{message}</div>}

          <button disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <p className="muted center">
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </section>
    </main>
  );
}
