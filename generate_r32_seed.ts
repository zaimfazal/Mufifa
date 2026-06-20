import fs from 'fs'

const matches = []
let date = new Date('2026-06-28T16:00:00Z') // R32 usually starts around late June

function addMatches(prefix: string, count: number, stage: string, multiplier: number, daysInterval: number = 0) {
  for (let i = 1; i <= count; i++) {
    const code = `${prefix}_${i.toString().padStart(3, '0')}`
    // Placeholder teams since group stage outcomes are unknown
    const home = `Winner Group ${String.fromCharCode(64 + i)}` // Arbitrary mapping for seed
    const away = `Runner-up Group ${String.fromCharCode(64 + i + 1)}`
    
    matches.push(`('${code}', '${stage}', '${home}', '${away}', '${date.toISOString()}', 'scheduled', ${multiplier.toFixed(1)})`)
    
    // Advance date every 2 matches
    if (i % 2 === 0) {
      date.setUTCDate(date.getUTCDate() + daysInterval)
    }
  }
}

addMatches('R32', 16, 'round_of_32', 1.2, 1)
addMatches('R16', 8, 'round_of_16', 1.5, 1)
addMatches('QF', 4, 'quarter_final', 2.0, 1)
addMatches('SF', 2, 'semi_final', 3.0, 1)
addMatches('TP', 1, 'third_place', 2.5, 1)
addMatches('F', 1, 'final', 5.0, 0)

const sql = `-- FIFA 2026 Round of 32 Dataset
-- Exactly 32 Matches

INSERT INTO matches (match_code, stage, home_team, away_team, kickoff_time, status, multiplier)
VALUES
${matches.join(',\n')};
`

fs.writeFileSync('fifa_2026_r32_seed.sql', sql)
console.log('fifa_2026_r32_seed.sql generated successfully with 32 matches.')
