import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
})
