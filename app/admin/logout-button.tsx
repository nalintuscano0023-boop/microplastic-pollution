'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
      }}
      className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      Log out
    </button>
  )
}
