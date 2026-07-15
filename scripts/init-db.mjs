import { neon } from '@neondatabase/serverless'

process.loadEnvFile('.env.local')

const sql = neon(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    level TEXT NOT NULL,
    user_agent TEXT
  )
`

console.log('survey_responses table ready')
