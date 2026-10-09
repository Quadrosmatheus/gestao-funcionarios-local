# Relatório de preparação — Gestão de Funcionários

Data: 09/10/2026
Destino: `https://github.com/developmatheus/gestao-funcionarios-local` (repositório privado)

## Organização e conteúdo

- Estrutura organizada em `frontend/` (React/Vite), `backend/` (Express/Prisma), migrações, scripts locais e testes.
- README refeito com funcionalidades observadas no código, tecnologias, instalação, uso, comandos, estrutura, privacidade e limitações.
- Workflow do GitHub Actions adicionado para build da interface e testes de domínio.
- Scripts garantem a criação dos diretórios SQLite e uploads em uma instalação nova.
- Regras Git ignoram banco, journal SQLite, documentos, dependências, build e todos os arquivos `.env`, preservando apenas `.env.example`.
- Sem licença permissiva: o README informa que os direitos permanecem reservados.

## Revisão de segurança e correções

- Verificados arquivos e padrões comuns de tokens/chaves; não foram encontrados segredos versionáveis. O `backend/.env` local, banco e uploads estão ignorados.
- Autorização agora consulta se a conta segue ativa em cada requisição autenticada, então desativação revoga o acesso imediatamente.
- Upload compara extensão/tipo declarado e assinatura básica de PDF/JPG/PNG.
- Validação de CPF passou a verificar dígitos verificadores.
- Criação do administrador exige terminal interativo para evitar exibir a senha em entrada redirecionada.
- Mantidos controles já existentes: API vinculada a `127.0.0.1`, limite de tentativas de login, JWT com expiração e bcrypt.

## Verificações

- Testes: 8 aprovados, 0 falharam.
- Build de produção: concluído.
- Cliente Prisma gerado e esquema previamente validado.
- `npm audit`: 0 vulnerabilidades reportadas na raiz, backend e frontend.
- Smoke test anterior confirmou API saudável e interface servida em localhost.

## Limites conhecidos

A aplicação não criptografa o banco ou anexos em repouso, não oferece recuperação de senha, backup automático, cálculo de folha/encargos, validação de saldo legal de férias ou certificação de ponto. Os CSVs são relatórios de apoio. Use dados reais somente após revisar política de acesso, retenção, backups protegidos e requisitos trabalhistas aplicáveis.

## GitHub

O repositório novo foi criado como privado, sem README automático nem licença gerada pelo GitHub, para preservar o README local preparado e os direitos reservados. O commit e push serão registrados aqui após a conclusão.
