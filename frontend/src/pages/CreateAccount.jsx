import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Error } from '../components/ui';

export function CreateAccount({ onRegister, onBack, onLogin }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/auth/register/status')
      .then((status) => setOpen(status.open))
      .catch((e) => setError(e.message));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onRegister(form.nome, form.email, form.senha);
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
          <span className="eyebrow">COMECE POR AQUI</span>
          <h1>
            Um começo simples para uma <em>equipe forte.</em>
          </h1>
          <p>A conta inicial configura o acesso administrativo deste computador.</p>
        </div>
        <div className="login-aside-foot">
          PRIVADO POR PADRÃO <span>·</span> EXECUTADO LOCALMENTE
        </div>
      </div>
      <div className="login-main">
        <section className="login-card">
          <button className="text-btn auth-back" onClick={onBack}>
            ← Voltar ao início
          </button>
          <div className="login-mobile-brand">gestão.local</div>
          <span className="eyebrow">PRIMEIRO ACESSO</span>
          <h2>Criar conta</h2>
          <p>
            Crie a conta inicial de administrador. Depois, ela poderá cadastrar acessos autorizados.
          </p>
          {open === false ? (
            <div className="registration-closed">
              <strong>Este sistema já tem uma conta configurada.</strong>
              <span>
                Por segurança, novos acessos devem ser criados pelo administrador dentro do painel.
              </span>
              <button className="btn primary full" onClick={onLogin}>
                Ir para o login <span>→</span>
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <Error text={error} />
              <label>
                Nome
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  minLength={2}
                  autoComplete="name"
                  required
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Senha · mínimo 12 caracteres
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  minLength={12}
                  autoComplete="new-password"
                  required
                />
              </label>
              <button className="btn primary full" disabled={busy || open === null}>
                {busy ? 'Criando conta…' : 'Criar conta e abrir painel'} <span>→</span>
              </button>
            </form>
          )}
          <div className="secure-note">▣ Sua senha será armazenada com proteção</div>
        </section>
      </div>
    </div>
  );
}
