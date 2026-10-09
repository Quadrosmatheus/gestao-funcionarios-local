import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Empty, Error, Heading } from '../components/ui';

const formatDate = (value) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );

export function Audit() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/audit?limit=100')
      .then(setRows)
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <>
      <Heading
        title="Auditoria"
        sub="Ações administrativas recentes, visíveis somente para administradores."
      />
      <Error text={error} />
      <section className="panel table-panel">
        {rows.length ? (
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Tabela de auditoria. Role horizontalmente para ver as colunas."
          >
            <table>
              <thead>
                <tr>
                  <th>DATA E HORA</th>
                  <th>USUÁRIO</th>
                  <th>AÇÃO</th>
                  <th>REGISTRO</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.ocorridoEm)}</td>
                    <td>{row.usuario?.nome || 'Acesso removido'}</td>
                    <td>{row.acao.replaceAll('_', ' ')}</td>
                    <td>
                      {row.entidade}
                      {row.entidadeId ? ` #${row.entidadeId}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>
            {error ? 'Não foi possível carregar a auditoria' : 'Nenhuma ação registrada'}
          </Empty>
        )}
      </section>
    </>
  );
}
