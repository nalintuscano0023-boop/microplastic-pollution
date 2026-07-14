'use client'

import { useEffect } from 'react'
import { rehydrateEcoStore } from '@/lib/eco-store'

export function EcoProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    rehydrateEcoStore()
  }, [])

  return <>{children}</>
}
