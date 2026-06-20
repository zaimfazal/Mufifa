import fs from 'fs'
import { generateTemplate } from './src/lib/csv/template-generator'

const sql = fs.readFileSync('fifa_2026_r32_seed.sql', 'utf8')
const matches = []

const regex = /\('(.*?)', '(.*?)', '(.*?)', '(.*?)',/g
let match

while ((match = regex.exec(sql)) !== null) {
  matches.push({
    match_code: match[1],
    stage: match[2],
    home_team: match[3],
    away_team: match[4]
  })
}

const csv = generateTemplate(matches as any)
fs.writeFileSync('new_template.csv', csv)
console.log('Done')
