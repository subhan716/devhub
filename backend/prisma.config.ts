import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// CLI-only configuration (prisma db push / generate / studio).
// The runtime uses the pg driver adapter in src/config/prisma.js and is
// unaffected by this file — this only gives the Prisma CLI a way to reach
// the database via DATABASE_URL, since the datasource block has no url.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
