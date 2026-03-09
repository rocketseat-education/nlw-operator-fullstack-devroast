# Drizzle ORM — Specification

> Spec de implementacao do banco de dados para o DevRoast usando Drizzle ORM + PostgreSQL + Docker Compose.

## Contexto

O DevRoast e um analisador de qualidade de codigo que da uma nota de 0 a 10. O usuario cola um trecho de codigo, opcionalmente ativa o "roast mode", e recebe:

- **Score** (0-10, decimal)
- **Verdict** (enum: `needs_serious_help`, `rough_around_edges`, `decent_code`, `solid_work`, `exceptional`)
- **Roast quote** (frase sarcastica gerada por IA)
- **Analysis items** (lista de findings com severidade `critical`, `warning` ou `good`)
- **Suggested fix** (diff do codigo original para o melhorado)

Submissoes sao **anonimas** — sem autenticacao. Toda submissao entra automaticamente no **shame leaderboard** (sem opt-in).

A IA sera integrada via **Vercel AI SDK** (provider-agnostico).

---

## Stack do banco

| Camada     | Tecnologia                  |
| ---------- | --------------------------- |
| ORM        | Drizzle ORM (`drizzle-orm`) |
| Migrations | Drizzle Kit (`drizzle-kit`) |
| Driver     | `pg` (node-postgres)        |
| Banco      | PostgreSQL 16               |
| Container  | Docker Compose              |

---

## Decisoes de design

### Casing automatico

Usamos `casing: "snake_case"` tanto no `drizzle.config.ts` (Drizzle Kit) quanto no `drizzle()` client. Isso permite que o schema use camelCase no TypeScript sem alias explicito — o Drizzle converte automaticamente para snake_case no SQL.

```typescript
// Schema: camelCase sem alias
lineCount: integer().notNull()
// SQL gerado: line_count integer NOT NULL
```

### Sem Drizzle relations

Nao usamos `relations()` do Drizzle. Queries sao feitas com `select().from().leftJoin()` — mais explicitas e sem dependencia do `db.query` API.

### Indices minimos

Apenas um indice custom: `roasts_score_idx` para o ORDER BY do leaderboard. PKs ja tem indice implicito. FK inline nao justifica indice dedicado no volume esperado.

---

## Enums

```typescript
export const verdictEnum = pgEnum("verdict", [
  "needs_serious_help", // score 0-2
  "rough_around_edges", // score 2.1-4
  "decent_code",        // score 4.1-6
  "solid_work",         // score 6.1-8
  "exceptional",        // score 8.1-10
])

export const severityEnum = pgEnum("severity", [
  "critical", // vermelho — problema grave
  "warning",  // amarelo — pode melhorar
  "good",     // verde — ponto positivo
])
```

---

## Tabelas

### `roasts`

Tabela principal. Cada row e uma submissao de codigo analisada.

| Coluna        | Tipo                      | Descricao                                           |
| ------------- | ------------------------- | --------------------------------------------------- |
| `id`          | `uuid` PK default random  | Identificador unico do roast                        |
| `code`        | `text` NOT NULL            | Codigo fonte submetido pelo usuario                 |
| `language`    | `varchar(50)` NOT NULL     | Linguagem detectada ou informada (ex: `javascript`) |
| `line_count`  | `integer` NOT NULL         | Quantidade de linhas do codigo                      |
| `roast_mode`  | `boolean` default `false`  | Se o usuario ativou o modo sarcasmo                 |
| `score`       | `real` NOT NULL            | Nota de 0 a 10 (ex: `3.5`)                         |
| `verdict`     | `verdict` NOT NULL         | Enum do veredito baseado no score                   |
| `roast_quote` | `text`                     | Frase sarcastica gerada pela IA                     |
| `suggested_fix` | `text`                   | Codigo melhorado (diff/versao completa)             |
| `created_at`  | `timestamp with tz`        | Data de criacao, default `now()`                    |

```typescript
export const roasts = pgTable(
  "roasts",
  {
    id: uuid().defaultRandom().primaryKey(),
    code: text().notNull(),
    language: varchar({ length: 50 }).notNull(),
    lineCount: integer().notNull(),
    roastMode: boolean().default(false).notNull(),
    score: real().notNull(),
    verdict: verdictEnum().notNull(),
    roastQuote: text(),
    suggestedFix: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("roasts_score_idx").on(table.score)],
)
```

### `analysis_items`

Cada finding da analise detalhada. Relaciona N:1 com `roasts`.

| Coluna        | Tipo                     | Descricao                                   |
| ------------- | ------------------------ | ------------------------------------------- |
| `id`          | `uuid` PK default random | Identificador unico do item                 |
| `roast_id`    | `uuid` FK -> roasts.id   | Roast ao qual pertence                      |
| `severity`    | `severity` NOT NULL      | Nivel de severidade (critical/warning/good)  |
| `title`       | `varchar(200)` NOT NULL  | Titulo curto do finding                     |
| `description` | `text` NOT NULL          | Explicacao detalhada                        |
| `order`       | `integer` NOT NULL       | Ordem de exibicao (0-indexed)               |

```typescript
export const analysisItems = pgTable("analysis_items", {
  id: uuid().defaultRandom().primaryKey(),
  roastId: uuid()
    .references(() => roasts.id, { onDelete: "cascade" })
    .notNull(),
  severity: severityEnum().notNull(),
  title: varchar({ length: 200 }).notNull(),
  description: text().notNull(),
  order: integer().notNull(),
})
```

---

## Estrutura de arquivos

```
src/
  db/
    index.ts          # Conexao com o banco (drizzle client, casing: snake_case)
    schema.ts         # Enums, tabelas e indice
docker-compose.yml    # PostgreSQL 16 container
drizzle.config.ts     # Config do Drizzle Kit (casing: snake_case, dotenv)
drizzle/              # Migrations geradas (gitignored pelo Biome, versionado no git)
.env.local            # DATABASE_URL (gitignored)
```

---

## Arquivos de configuracao

### `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    volumes:
      - devroast_pgdata:/var/lib/postgresql/data

volumes:
  devroast_pgdata:
```

### `.env.local`

```
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

### `drizzle.config.ts`

```typescript
import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: databaseUrl,
  },
})
```

### `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}

export const db = drizzle(databaseUrl, {
  casing: "snake_case",
})
```

---

## Scripts npm

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Dependencias

### Producao

```bash
pnpm add drizzle-orm pg
```

### Desenvolvimento

```bash
pnpm add -D drizzle-kit @types/pg dotenv
```

---

## Queries esperadas

### Leaderboard (shame ranking)

```typescript
import { asc } from "drizzle-orm"

const leaderboard = await db
  .select()
  .from(roasts)
  .orderBy(asc(roasts.score))
  .limit(20)
```

### Roast completo por ID (pagina de resultado)

```typescript
import { eq } from "drizzle-orm"

const [roast] = await db
  .select()
  .from(roasts)
  .where(eq(roasts.id, roastId))

const items = await db
  .select()
  .from(analysisItems)
  .where(eq(analysisItems.roastId, roastId))
  .orderBy(asc(analysisItems.order))
```

### Stats globais (footer)

```typescript
import { avg, count } from "drizzle-orm"

const [stats] = await db
  .select({
    totalRoasts: count(),
    avgScore: avg(roasts.score),
  })
  .from(roasts)
```

### Inserir novo roast (apos resposta da IA)

```typescript
await db.transaction(async (tx) => {
  const [roast] = await tx
    .insert(roasts)
    .values({
      code,
      language,
      lineCount,
      roastMode,
      score,
      verdict,
      roastQuote,
      suggestedFix,
    })
    .returning()

  await tx.insert(analysisItems).values(
    items.map((item, index) => ({
      roastId: roast.id,
      severity: item.severity,
      title: item.title,
      description: item.description,
      order: index,
    })),
  )

  return roast
})
```

---

## Diagrama ER

```
┌─────────────────────────────┐
│           roasts             │
├─────────────────────────────┤
│ id            uuid PK        │
│ code          text            │
│ language      varchar(50)     │
│ line_count    integer         │
│ roast_mode    boolean         │
│ score         real        IDX │
│ verdict       verdict (enum)  │
│ roast_quote   text            │
│ suggested_fix text            │
│ created_at    timestamptz     │
└──────────────┬──────────────┘
               │ 1
               │
               │ N
┌──────────────┴──────────────┐
│       analysis_items         │
├─────────────────────────────┤
│ id          uuid PK          │
│ roast_id    uuid FK           │
│ severity    severity (enum)   │
│ title       varchar(200)      │
│ description text              │
│ order       integer           │
└─────────────────────────────┘
```

---

## To-do de implementacao

- [x] Criar `docker-compose.yml` na raiz do projeto
- [x] Instalar dependencias (`drizzle-orm`, `pg`, `drizzle-kit`, `@types/pg`, `dotenv`)
- [x] Criar `.env.local` com `DATABASE_URL`
- [x] Criar `drizzle.config.ts` com `casing: "snake_case"` e dotenv
- [x] Criar `src/db/schema.ts` com enums, tabelas e indice em score
- [x] Criar `src/db/index.ts` com client Drizzle e `casing: "snake_case"`
- [x] Adicionar scripts `db:generate`, `db:migrate`, `db:push`, `db:studio` ao `package.json`
- [x] Adicionar `!drizzle` ao Biome `files.includes` para ignorar arquivos gerados
- [x] Subir o container: `docker compose up -d`
- [x] Gerar a primeira migration: `pnpm db:generate`
- [x] Aplicar migration: `pnpm db:migrate`
- [ ] Atualizar `README.md` com instrucoes de setup do banco
