import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// The runtime uses the pg driver adapter (see src/config/prisma.js); this file
// ONLY configures the Prisma CLI (db push / studio / generate).
//
// IMPORTANT: read the URL via process.env, NOT prisma's env() helper.
// At build time on the host (e.g. Render `npm install` -> postinstall
// `prisma generate`), DATABASE_URL is not set, and env() THROWS
// (PrismaConfigEnvError), which breaks the build. process.env simply yields
// undefined, and `generate` does not need a URL — only db push/studio do, and
// those run locally where DATABASE_URL is present. When the URL is absent we
// omit the datasource entirely so the CLI falls back to the schema's block.
const databaseUrl = process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
})
