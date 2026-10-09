-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "funcao" TEXT NOT NULL DEFAULT 'ADMIN',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "dataNascimento" DATETIME,
    "telefone" TEXT,
    "admissaoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desligamentoEm" DATETIME,
    "cargoId" INTEGER,
    "departamentoId" INTEGER,
    "horarioId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "funcionarios_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "funcionarios_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "departamentos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "funcionarios_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "horarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "horarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "entrada" TEXT NOT NULL,
    "saida" TEXT NOT NULL,
    "pausaInicio" TEXT,
    "pausaFim" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pontos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "funcionarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "ocorridoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "criadoPorId" INTEGER,
    CONSTRAINT "pontos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ausencias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "funcionarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME NOT NULL,
    "motivo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "aprovadoPorId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "ausencias_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ausencias_aprovadoPorId_fkey" FOREIGN KEY ("aprovadoPorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "funcionarioId" INTEGER NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "enviadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "detalhes" TEXT,
    "ocorridoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_email_key" ON "funcionarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- CreateIndex
CREATE INDEX "funcionarios_nome_idx" ON "funcionarios"("nome");

-- CreateIndex
CREATE INDEX "funcionarios_ativo_idx" ON "funcionarios"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_nome_key" ON "cargos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nome_key" ON "departamentos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_nome_key" ON "horarios"("nome");

-- CreateIndex
CREATE INDEX "pontos_funcionarioId_ocorridoEm_idx" ON "pontos"("funcionarioId", "ocorridoEm");

-- CreateIndex
CREATE INDEX "ausencias_funcionarioId_inicio_fim_idx" ON "ausencias"("funcionarioId", "inicio", "fim");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_nomeArquivo_key" ON "documentos"("nomeArquivo");

-- CreateIndex
CREATE INDEX "auditoria_ocorridoEm_idx" ON "auditoria"("ocorridoEm");
