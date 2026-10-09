import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Empty, Error } from '../components/ui';

export function Dashboard({ go }) {
  const [d, setD] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    api('/dashboard')
      .then(setD)
      .catch((e) => setError(e.message));
  }, []);
  const stats = d?.resumo;
  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">SEU RESUMO</span>
          <h2>Bom dia. Vamos cuidar da equipe?</h2>
          <p>Uma visão simples do que está acontecendo hoje.</p>
        </div>
        <div className="welcome-mark">✳</div>
      </div>
      <Error text={error} />
      <div className="stats-grid">
        {[
          ['PESSOAS ATIVAS', stats?.ativos, 'No quadro de funcionários', '♙', ''],
          ['EM AFASTAMENTO', stats?.afastados, 'Pessoas ausentes hoje', '◷', 'amber'],
          ['PONTO DE HOJE', stats?.registrosPontoHoje, 'Marcações registradas', '◉', 'blue'],
          ['PENDÊNCIAS', stats?.solicitacoesPendentes, 'Solicitações para revisar', '▤', 'rose'],
        ].map((x) => (
          <div className="stat-card" key={x[0]}>
            <div className={`stat-icon ${x[4]}`}>{x[3]}</div>
            <span>{x[0]}</span>
            <strong>{x[1] ?? '—'}</strong>
            <small>{x[2]}</small>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">ACOMPANHAMENTO</span>
              <h3>Novas pessoas</h3>
            </div>
            <button className="text-btn" onClick={() => go('employees')}>
              Ver equipe →
            </button>
          </div>
          {d?.recentes?.length ? (
            <div className="recent-list">
              {d.recentes.map((x) => (
                <div className="recent-row" key={x.id}>
                  <div className="avatar soft">{x.nome[0]}</div>
                  <div className="grow">
                    <strong>{x.nome}</strong>
                    <small>{x.cargo?.nome || 'Cargo não definido'}</small>
                  </div>
                  <span className="tag green-tag">Ativo</span>
                </div>
              ))}
            </div>
          ) : (
            <Empty>{d ? 'Nenhum funcionário cadastrado' : 'Carregando dados…'}</Empty>
          )}
        </section>
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">ROTINA</span>
              <h3>Afastamentos de hoje</h3>
            </div>
            <button className="text-btn" onClick={() => go('leaves')}>
              Ver férias e ausências →
            </button>
          </div>
          {d?.afastamentos?.length ? (
            <div className="recent-list">
              {d.afastamentos.map((x) => (
                <div className="recent-row" key={x.id}>
                  <div className="avatar soft">{x.funcionario.nome[0]}</div>
                  <div className="grow">
                    <strong>{x.funcionario.nome}</strong>
                    <small>{x.tipo === 'FERIAS' ? 'Férias' : 'Afastamento aprovado'}</small>
                  </div>
                  <span className="tag amber-tag">
                    Até {new Date(x.fim).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty>{d ? 'Ninguém afastado hoje' : 'Carregando dados…'}</Empty>
          )}
        </section>
        <section className="panel side-note">
          <span className="eyebrow">LEMBRETE DE PRIVACIDADE</span>
          <div className="privacy-symbol">♧</div>
          <h3>Dados sob seus cuidados</h3>
          <p>
            Este sistema armazena dados pessoais e documentos neste computador. Proteja o acesso e
            mantenha uma cópia de segurança local.
          </p>
          <div className="privacy-line">
            <i /> Banco local ativo
          </div>
        </section>
      </div>
    </>
  );
}
