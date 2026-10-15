# Gestão de Funcionários

## Link do site teste:https://gestao-funcionarios-demo.onrender.com

Desenvolvi este projeto com o objetivo de criar um sistema local para facilitar a organização de funcionários e algumas rotinas básicas de RH. A ideia foi reunir em uma única aplicação funções como cadastro de funcionários, departamentos, cargos, jornadas, registros de ponto, férias e ausências.

O sistema utiliza uma interface web, uma API e um banco de dados SQLite, funcionando diretamente no computador. Atualmente, não possui hospedagem online nem sincronização em nuvem.

> Este é um projeto demonstrativo e de uso local. Ele não substitui sistemas oficiais de folha de pagamento, assessoria jurídica ou trabalhista, nem sistemas homologados de registro de ponto.

## Capturas de tela

Separei algumas capturas de tela utilizando dados fictícios para mostrar um pouco de como ficou a interface do sistema.

![Painel do sistema](https://github.com/user-attachments/assets/28d9b268-1d2c-46b2-a591-fb14ee574168)

![Lista de funcionários](https://github.com/user-attachments/assets/32c6df94-25aa-4130-9089-f70de2cb9388)

## O que desenvolvi no projeto

Ao longo do desenvolvimento, implementei funcionalidades para centralizar as principais informações dos funcionários e facilitar o gerenciamento dos dados.

- **Painel inicial:** resumo de funcionários, ausências, registros de ponto e pendências.
- **Cadastro de funcionários:** cadastro, pesquisa, edição e desligamento lógico, com vínculo opcional a cargos, departamentos e jornadas.
- **Documentos:** possibilidade de anexar arquivos PDF, JPG e PNG de até 5 MB, armazenados localmente.
- **Departamentos e cargos:** cadastro e organização das informações da empresa.
- **Jornadas de trabalho:** cadastro das jornadas utilizadas pelos funcionários.
- **Controle de ponto:** lançamento manual de marcações e exportação do espelho diário em CSV.
- **Férias e ausências:** registro, consulta, revisão e exportação dos dados em CSV.
- **Controle de acesso:** contas com diferentes permissões para os perfis `ADMIN` e `RH`.
- **Segurança das contas:** alteração de senha e revogação das outras sessões ativas.
- **Auditoria:** consulta às atividades recentes pelos administradores.
- **Banco de dados:** armazenamento local com SQLite, migrações Prisma e comandos para backup e restauração.

## Tecnologias utilizadas

Para construir o sistema, utilizei tecnologias voltadas ao desenvolvimento web, à criação de APIs e ao armazenamento de dados.

- **React 18:** construção da interface.
- **Vite:** ambiente de desenvolvimento e compilação do frontend.
- **CSS:** estilização e organização visual das telas.
- **Node.js:** execução do backend.
- **Express 4:** criação das rotas e da API.
- **SQLite:** armazenamento local dos dados.
- **Prisma:** comunicação com o banco de dados e gerenciamento de migrações.
- **JWT:** autenticação por tokens com expiração de 8 horas.
- **bcrypt:** armazenamento de senhas por meio de hash.

## Como organizei os arquivos

Separei o frontend e o backend para manter o código organizado e facilitar futuras alterações.

```text
frontend/
  src/
    components/       Componentes compartilhados
    constants/        Navegação e constantes
    pages/            Páginas do sistema
    services/         Comunicação com a API
    App.jsx           Navegação e layout

backend/
  src/
    app.js            Configuração da API Express
    routes/           Rotas de autenticação e RH
    middleware/       Autenticação e autorização
    prisma/           Cliente e configuração do banco
  prisma/             Esquema e migrações
  scripts/            Administração, demo e backups
  tests/              Testes automatizados
  data/               Banco de dados local
  uploads/            Documentos anexados

scripts/              Preparação dos dados de demonstração
.github/workflows/    Automação de testes no GitHub
```

## Como funciona a arquitetura

Organizei a aplicação em três partes principais: frontend, API e banco de dados.

O React apresenta as telas e envia as requisições para a API Express. A API processa as operações, utiliza o Prisma para acessar o SQLite e gerencia os arquivos anexados localmente.

```mermaid
flowchart LR
    Browser[React no navegador] -->|HTTP local| API[API Express]
    API --> Prisma[Prisma Client]
    Prisma --> DB[(SQLite local)]
    API --> Files[Arquivos locais]
```

## Privacidade e segurança

Durante o desenvolvimento, implementei alguns mecanismos para melhorar a segurança e o controle de acesso.

- A API exige autenticação por token nas operações de RH.
- As senhas são armazenadas em formato de hash com bcrypt.
- O sistema limita as tentativas de login.
- Usuários desativados perdem acesso às próximas requisições.
- Os arquivos enviados passam por verificações de extensão, tipo informado e assinatura básica.
- Os arquivos CSV recebem tratamento para reduzir o risco de execução de fórmulas em planilhas.
- Os administradores podem consultar atividades recentes por meio da auditoria.

Como a aplicação foi pensada para uso local, os dados e os documentos ficam armazenados no próprio computador. Isso não significa que estejam automaticamente protegidos: o banco SQLite e os anexos não são criptografados pela aplicação, e os backups precisam ser protegidos pelo usuário.

O sistema também possui algumas limitações. Ainda não implementei recuperação de senha, cálculo de folha de pagamento e encargos, validação legal de saldos de férias, criptografia dos dados armazenados ou backups automáticos. O projeto não possui certificação de conformidade trabalhista.

Por isso, recomendo utilizar dados fictícios em apresentações e avaliar os cuidados necessários com privacidade, acesso e armazenamento antes de trabalhar com informações reais.

## Backup e restauração

Adicionei comandos para facilitar a criação de cópias de segurança e a recuperação dos dados.

Para criar um backup, execute:

```bash
npm run backup
```

O comando cria uma pasta datada em `backend/backups/`, contendo um snapshot do banco SQLite e os documentos anexados.

Para restaurar um backup, primeiro pare a aplicação e execute:

```bash
npm run backup:restore --prefix backend -- backups/PASTA-DO-BACKUP
```

O processo solicita uma confirmação e cria uma cópia de segurança do banco atual antes de substituir os dados. É importante conferir o caminho selecionado antes de confirmar a operação.

## Testes e automação

Também configurei testes automatizados para ajudar a verificar o funcionamento do projeto.

O comando `npm test` executa os testes de domínio e integração da API. Além disso, configurei o GitHub Actions para gerar o cliente Prisma, executar os testes, verificar a formatação e compilar a interface quando há alterações enviadas ao repositório.

## Sobre o projeto

Este projeto faz parte da minha prática de desenvolvimento web e da aplicação dos conhecimentos que venho adquirindo em programação.

Meu objetivo foi construir uma aplicação que reunisse frontend, backend, banco de dados, autenticação e operações de cadastro em um único projeto, trabalhando com tecnologias utilizadas no desenvolvimento web.

O código está disponível no GitHub para consulta. A aplicação continua sendo executada localmente e não possui uma versão hospedada para acesso público.

**Licença:** o repositório não possui uma licença de código aberto. Todos os direitos permanecem reservados ao titular, e o uso, a redistribuição ou a revenda dependem de autorização.
