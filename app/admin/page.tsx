import { sql } from '@/lib/db'
import { LogoutButton } from './logout-button'

export const dynamic = 'force-dynamic'

type ResponseRow = {
  id: number
  created_at: string
  answers: number[]
  score: number
  level: string
  user_agent: string | null
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl text-foreground">{value}</p>
    </div>
  )
}

export default async function AdminPage() {
  const rows = (await sql`
    SELECT id, created_at, answers, score, level, user_agent
    FROM survey_responses
    ORDER BY created_at DESC
    LIMIT 500
  `) as ResponseRow[]

  const avg = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length)
    : 0
  const highExposure = rows.filter((r) => r.score >= 55).length

  return (
    <main className="min-h-screen bg-abyss px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary">
              Admin
            </p>
            <h1 className="mt-2 font-serif text-3xl text-foreground">
              Risk Checker Responses
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Total responses" value={rows.length} />
          <Stat label="Average score" value={avg} />
          <Stat label="High exposure+" value={highExposure} />
        </div>

        <div className="glass mt-8 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Answers</th>
                <th className="px-5 py-3">Device</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/50">
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-serif text-lg text-primary">
                    {r.score}
                  </td>
                  <td className="px-5 py-3">{r.level}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {r.answers.join(', ')}
                  </td>
                  <td className="max-w-[16rem] truncate px-5 py-3 text-xs text-muted-foreground">
                    {r.user_agent ?? '—'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-muted-foreground"
                  >
                    No responses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
