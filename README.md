# Gestão de Funcionários

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

## Como executar o projeto

Para executar a aplicação, é necessário ter o Node.js 20 ou superior e o npm instalados. O projeto pode ser utilizado no Windows, macOS ou Linux.

### 1. Baixar o projeto

Clone o repositório ou baixe os arquivos e abra um terminal na pasta principal do projeto.

### 2. Instalar as dependências

Execute os comandos abaixo na raiz do projeto:

```bash
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

### 3. Configurar as variáveis de ambiente

Crie o arquivo `backend/.env` com base no arquivo `backend/.env.example`.

Gere um segredo aleatório para a variável `JWT_SECRET` utilizando o comando:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Utilize o segredo gerado somente no ambiente local e não o compartilhe publicamente.

### 4. Preparar o banco de dados

Execute os comandos:

```bash
npm run db:generate
npm run db:deploy
```

Caso seja necessário criar ou modificar uma migração durante o desenvolvimento, utilize:

```bash
npm run db:migrate
```

### 5. Criar o primeiro administrador

Execute o comando abaixo em um terminal interativo:

```bash
npm run admin:create
```

Siga as instruções para criar a conta administrativa. A senha não aparece na tela enquanto é digitada.

### 6. Iniciar a aplicação

Execute:

```bash
npm run dev
```

Depois, abra o endereço abaixo no navegador:

**http://127.0.0.1:5173**

A API funciona em `http://127.0.0.1:5000`.

Para executar a versão compilada, utilize `npm run build` e depois `npm start`.

## Demonstração com dados fictícios

Também preparei um modo de demonstração para apresentar o sistema sem utilizar os dados do banco principal.

Para iniciar a demonstração, execute:

```bash
npm run demo:setup
npm run dev:demo
```

O primeiro comando cria um banco separado em `backend/data/demo.db`, aplica as migrações e adiciona dados totalmente fictícios.

Depois, acesse `http://127.0.0.1:5173`, selecione **Entrar no sistema** e, em seguida, **Entrar no painel**.

Nesse modo, o acesso é liberado sem e-mail ou senha. Essa funcionalidade existe exclusivamente para a demonstração e não deve ser utilizada no ambiente normal.

A demonstração utiliza um banco separado do banco principal `funcionarios.db`. Para recriá-la, pare os servidores e exclua apenas `backend/data/demo.db` antes de executar novamente o comando de preparação.

## Comandos úteis

Durante o desenvolvimento, deixei alguns comandos para facilitar a execução, os testes e a manutenção do projeto.

| Comando | Para que serve |
|---|---|
| `npm run dev` | Inicia a API e o frontend |
| `npm run build` | Compila o frontend para produção |
| `npm start` | Inicia a API e serve a interface compilada, se disponível |
| `npm test` | Executa os testes de domínio e integração da API |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:deploy` | Aplica as migrações existentes |
| `npm run db:migrate` | Cria e aplica migrações durante o desenvolvimento |
| `npm run admin:create` | Cria o primeiro administrador |
| `npm run format` | Formata os arquivos do projeto |
| `npm run format:check` | Verifica a formatação do código |
| `npm run backup` | Cria um backup do banco e dos anexos |
| `npm run demo:setup` | Prepara a demonstração com dados fictícios |
| `npm run dev:demo` | Inicia o ambiente de demonstração |

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
