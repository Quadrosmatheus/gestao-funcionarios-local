# Relatório de preparação — Gestão de Funcionários

Data: 09/10/2026
Repositório: `https://github.com/developmatheus/gestao-funcionarios-local` (privado, branch `main`)

## Preparação para portfólio

- Separei a interface React em páginas, componentes, serviços de API e constantes de navegação.
- Organizei a API Express em configuração, rotas, middleware e cliente Prisma.
- Atualizei o README com instalação, funcionalidades, estrutura, arquitetura, privacidade, demo e comandos de backup/restauração.
- Configurei Prettier e verificação de estilo no GitHub Actions, junto ao build e aos testes.
- Criei um modo demo isolado, com dados inteiramente fictícios e banco e uploads separados da instalação local.
- Fiz capturas da visão geral, funcionários e férias/ausências durante a demo fictícia; elas foram exibidas nesta conversa.

## Segurança e manutenção

- Senhas ficam com hash bcrypt. A troca exige senha atual, mínimo de 12 caracteres e revoga sessões anteriores.
- A API verifica status da conta e versão de sessão em cada requisição autenticada.
- A auditoria recente é acessível somente a administradores.
- Upload valida extensão, tipo informado e assinatura básica de PDF/JPG/PNG.
- CPF é validado por dígitos verificadores; CSV neutraliza fórmulas comuns.
- Criei comandos de backup e restauração local, com confirmação explícita antes de restaurar e cópia preventiva.
- Banco, anexos, backups, dependências, builds e arquivos `.env` permanecem ignorados pelo Git; só `.env.example` é versionado.
- Não encontrei credenciais versionáveis na inspeção desta revisão.

## Verificações executadas

- `npm test`: 9 testes aprovados, 0 falhas.
- `npm run format:check`: aprovado.
- `npm run build`: build de produção concluído.
- `npm run db:deploy`: sem migrações pendentes.
- `npm audit` (raiz, backend e frontend): 0 vulnerabilidades reportadas.
- A demonstração local foi conferida visualmente com nomes e e-mails fictícios.

## Limitações conhecidas

A aplicação é local e não criptografa banco ou anexos em repouso. Ainda não oferece recuperação de senha, backup automático, cálculo de folha/encargos, validação de saldo legal de férias ou certificação de ponto. Os relatórios de ponto são estimativas baseadas nas marcações inseridas. Não use dados pessoais reais sem definir controles de acesso, retenção e backups protegidos.

O projeto não inclui licença permissiva: todos os direitos permanecem reservados ao titular. O repositório continua privado; o titular decide quando torná-lo público.

## GitHub

As melhorias foram enviadas para `main` no repositório privado indicado acima. A execução do GitHub Actions para o novo commit deve ser conferida após o push.
