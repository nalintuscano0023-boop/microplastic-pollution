'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const HOTSPOT_COUNT = 8

export type BadgeId =
  | 'plastic-detective'
  | 'ocean-guardian'
  | 'eco-champion'
  | 'marine-protector'

export type Badge = {
  id: BadgeId
  name: string
  description: string
  icon: string
}

export const BADGES: Badge[] = [
  {
    id: 'plastic-detective',
    name: 'Plastic Detective',
    description: 'Discovered every hidden plastic source in the home',
    icon: '🔍',
  },
  {
    id: 'ocean-guardian',
    name: 'Ocean Guardian',
    description: 'Completed the Plastic Time Machine and activated Plastic Vision',
    icon: '🌊',
  },
  {
    id: 'eco-champion',
    name: 'Eco Champion',
    description: 'Checked your exposure risk and completed a Daily Eco Challenge',
    icon: '🏆',
  },
  {
    id: 'marine-protector',
    name: 'Marine Protector',
    description: 'Made a personal pledge to protect the ocean',
    icon: '🐢',
  },
]

export const QUEST_POINTS = {
  hotspot: 10,
  allHotspots: 30,
  timeMachine: 50,
  vision: 30,
  riskCheck: 40,
  simulator: 30,
  challenge: 40,
  pledge: 60,
} as const

type EcoState = {
  ecoPoints: number
  discoveredHotspots: string[]
  timeMachineComplete: boolean
  visionActivated: boolean
  riskCheckDone: boolean
  riskScore: number | null
  simulatorUsed: boolean
  challengeCompletedOn: string | null
  challengesCompleted: number
  pledges: string[]
  pledgeSubmitted: boolean

  discoverHotspot: (id: string) => void
  completeTimeMachine: () => void
  activateVision: () => void
  completeRiskCheck: (score: number) => void
  useSimulator: () => void
  completeChallenge: (dateKey: string) => void
  submitPledge: (pledges: string[]) => void
}

export const useEcoStore = create<EcoState>()(
  persist(
    (set, get) => ({
      ecoPoints: 0,
      discoveredHotspots: [],
      timeMachineComplete: false,
      visionActivated: false,
      riskCheckDone: false,
      riskScore: null,
      simulatorUsed: false,
      challengeCompletedOn: null,
      challengesCompleted: 0,
      pledges: [],
      pledgeSubmitted: false,

      discoverHotspot: (id) => {
        const { discoveredHotspots, ecoPoints } = get()
        if (discoveredHotspots.includes(id)) return
        const next = [...discoveredHotspots, id]
        const bonus = next.length === HOTSPOT_COUNT ? QUEST_POINTS.allHotspots : 0
        set({
          discoveredHotspots: next,
          ecoPoints: ecoPoints + QUEST_POINTS.hotspot + bonus,
        })
      },

      completeTimeMachine: () => {
        if (get().timeMachineComplete) return
        set((s) => ({
          timeMachineComplete: true,
          ecoPoints: s.ecoPoints + QUEST_POINTS.timeMachine,
        }))
      },

      activateVision: () => {
        if (get().visionActivated) return
        set((s) => ({
          visionActivated: true,
          ecoPoints: s.ecoPoints + QUEST_POINTS.vision,
        }))
      },

      completeRiskCheck: (score) => {
        set((s) => ({
          riskScore: score,
          riskCheckDone: true,
          ecoPoints: s.riskCheckDone ? s.ecoPoints : s.ecoPoints + QUEST_POINTS.riskCheck,
        }))
      },

      useSimulator: () => {
        if (get().simulatorUsed) return
        set((s) => ({
          simulatorUsed: true,
          ecoPoints: s.ecoPoints + QUEST_POINTS.simulator,
        }))
      },

      completeChallenge: (dateKey) => {
        if (get().challengeCompletedOn === dateKey) return
        set((s) => ({
          challengeCompletedOn: dateKey,
          challengesCompleted: s.challengesCompleted + 1,
          ecoPoints: s.ecoPoints + QUEST_POINTS.challenge,
        }))
      },

      submitPledge: (pledges) => {
        set((s) => ({
          pledges,
          pledgeSubmitted: true,
          ecoPoints: s.pledgeSubmitted ? s.ecoPoints : s.ecoPoints + QUEST_POINTS.pledge,
        }))
      },
    }),
    {
      name: 'unseen-ocean-progress',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
)

export function earnedBadges(s: {
  discoveredHotspots: string[]
  timeMachineComplete: boolean
  visionActivated: boolean
  riskCheckDone: boolean
  challengesCompleted: number
  pledgeSubmitted: boolean
}): BadgeId[] {
  const earned: BadgeId[] = []
  if (s.discoveredHotspots.length >= HOTSPOT_COUNT) earned.push('plastic-detective')
  if (s.timeMachineComplete && s.visionActivated) earned.push('ocean-guardian')
  if (s.riskCheckDone && s.challengesCompleted > 0) earned.push('eco-champion')
  if (s.pledgeSubmitted) earned.push('marine-protector')
  return earned
}

/** Rehydrate the persisted store on the client after mount (avoids SSR hydration mismatch). */
export function rehydrateEcoStore() {
  void useEcoStore.persist.rehydrate()
}
