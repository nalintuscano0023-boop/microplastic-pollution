import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { scoreAnswers } from '@/lib/risk-scoring'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const result = scoreAnswers(body?.answers)

  if (!result) {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 })
  }

  await sql`
    INSERT INTO survey_responses (answers, score, level, user_agent)
    VALUES (
      ${JSON.stringify(body.answers)}::jsonb,
      ${result.score},
      ${result.level},
      ${request.headers.get('user-agent') ?? null}
    )
  `

  return NextResponse.json({ ok: true })
}
