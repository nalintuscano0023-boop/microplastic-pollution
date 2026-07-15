export type Option = {
  label: string
  weight: number
  suggestion?: string
}

export type Question = {
  id: string
  prompt: string
  options: Option[]
}

export const questions: Question[] = [
  {
    id: 'bottles',
    prompt: 'How often do you drink bottled water?',
    options: [
      { label: 'Rarely — I use a refillable bottle', weight: 0 },
      {
        label: 'A few bottles per week',
        weight: 2,
        suggestion:
          'Bottled water carries roughly twice the microplastics of tap. A steel bottle pays for itself within weeks.',
      },
      {
        label: 'Every day',
        weight: 4,
        suggestion:
          'Daily bottled water is likely your single largest exposure. Switching to filtered tap in a steel bottle cuts it dramatically.',
      },
    ],
  },
  {
    id: 'containers',
    prompt: 'How often do you heat food in plastic containers?',
    options: [
      { label: 'Never — I use glass or ceramic', weight: 0 },
      {
        label: 'Sometimes, when convenient',
        weight: 2,
        suggestion:
          'Heat multiplies particle shedding. Transfer food to a plate or glass before microwaving.',
      },
      {
        label: 'Most reheated meals',
        weight: 4,
        suggestion:
          'Microwaving in plastic releases millions of particles per session. Glass containers eliminate this entirely.',
      },
    ],
  },
  {
    id: 'tea',
    prompt: 'What kind of tea do you usually drink?',
    options: [
      { label: 'Loose leaf, or none at all', weight: 0 },
      {
        label: 'Standard paper tea bags',
        weight: 1,
        suggestion:
          'Some paper bags are sealed with plastic. Look for brands labeled plastic-free.',
      },
      {
        label: 'Silky / mesh pyramid bags',
        weight: 4,
        suggestion:
          '"Silky" pyramid bags are woven plastic and release billions of particles per cup. Loose leaf is an easy upgrade.',
      },
    ],
  },
  {
    id: 'laundry',
    prompt: 'What is your wardrobe mostly made of?',
    options: [
      { label: 'Mostly cotton, linen, or wool', weight: 0 },
      {
        label: 'A mix of natural and synthetic',
        weight: 2,
        suggestion:
          'Wash synthetics cold and full-load — less friction means fewer microfibers shed.',
      },
      {
        label: 'Mostly polyester / nylon / activewear',
        weight: 4,
        suggestion:
          'A single synthetic load sheds up to 700,000 microfibers. A microfiber laundry bag captures most of them.',
      },
    ],
  },
  {
    id: 'singleuse',
    prompt: 'How often do you use single-use plastics (bags, cutlery, takeout)?',
    options: [
      { label: 'Rarely — I carry reusables', weight: 0 },
      {
        label: 'A few times a week',
        weight: 2,
        suggestion:
          'Keeping a fold-up bag and cutlery set in your everyday bag removes most accidental single-use.',
      },
      {
        label: 'Most days',
        weight: 4,
        suggestion:
          'Daily single-use plastic fragments quickly in the environment. Reusables cut your footprint the fastest.',
      },
    ],
  },
]

export const MAX_SCORE = questions.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.weight)),
  0,
)

export type Level = {
  name: string
  color: string
  blurb: string
}

export function levelFor(score: number): Level {
  if (score < 30)
    return {
      name: 'Low exposure',
      color: 'oklch(0.75 0.12 185)',
      blurb: 'Your habits already keep most microplastics out of your life — and the ocean.',
    }
  if (score < 55)
    return {
      name: 'Moderate exposure',
      color: 'oklch(0.82 0.13 195)',
      blurb: 'A few everyday habits are quietly adding up. Small swaps will make a real difference.',
    }
  if (score < 78)
    return {
      name: 'High exposure',
      color: 'oklch(0.78 0.15 55)',
      blurb: 'Several daily routines carry significant microplastic exposure — but each one has an easy alternative.',
    }
  return {
    name: 'Very high exposure',
    color: 'oklch(0.7 0.17 30)',
    blurb: 'Your routine relies heavily on plastic touchpoints. The good news: you have the most to gain.',
  }
}

/** Validates raw option indices and computes the 0-100 score server-side. */
export function scoreAnswers(answers: unknown): { score: number; level: string } | null {
  if (!Array.isArray(answers) || answers.length !== questions.length) return null
  for (let i = 0; i < questions.length; i++) {
    const a = answers[i]
    if (!Number.isInteger(a) || a < 0 || a >= questions[i].options.length) return null
  }
  const raw = (answers as number[]).reduce(
    (sum, a, i) => sum + questions[i].options[a].weight,
    0,
  )
  const score = Math.round((raw / MAX_SCORE) * 100)
  return { score, level: levelFor(score).name }
}
