import { useState } from 'react';
import { api } from '../services/api';
import { Error } from '../components/ui';

export function Login({ onLogin }) {
  const [email, setEmail] = useState(''),
    [senha, setSenha] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onLogin(email, senha);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <div className="login-aside">
        <div className="brand brand-login">
          <span className="brand-icon">g</span>
          <span>
            gestão<span className="brand-light">.local</span>
            <small>PESSOAS & ROTINA</small>
          </span>
        </div>
        <div className="login-copy">
          <div className="spark">✳</div>
          <span className="eyebrow">UM ESPAÇO PARA CUIDAR DE QUEM FAZ</span>
          <h1>
            O trabalho flui
            <br />
            quando as pessoas
            <br />
            <em>estão bem.</em>
          </h1>
          <p>Organize a equipe, acompanhe a rotina e tenha uma visão clara da operação.</p>
        </div>
        <div className="login-aside-foot">
          PRIVADO POR PADRÃO <span>·</span> EXECUTADO LOCALMENTE
        </div>
      </div>
      <div className="login-main">
        <form className="login-card" onSubmit={submit}>
          <div className="login-mobile-brand">gestão.local</div>
          <span className="eyebrow">BEM-VINDO DE VOLTA</span>
          <h2>Acesse seu painel</h2>
          <p>Entre com a conta administrativa configurada neste computador.</p>
          {error && <Error text={error} />}
          <label>
            E-mail
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>
          <button className="btn primary full" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar no painel'} <span>→</span>
          </button>
          <div className="secure-note">▣ Acesso protegido e restrito ao ambiente local</div>
        </form>
      </div>
    </div>
  );
}
