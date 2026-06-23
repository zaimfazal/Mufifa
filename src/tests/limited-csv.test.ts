import { describe, it, expect } from 'vitest'
import { parseJerseyNumbers, parseLimitedCsvText, isLimitedCsvText } from '../lib/csv/parser'
import { validateLimitedCsv } from '../lib/csv/validator'

const HEADER = 'match_id,home_team,away_team,predicted_home_score,predicted_away_score,predicted_scorers_home,predicted_scorers_away'

const matches = [
  { match_code: 'R16_089', home_team: 'Brazil', away_team: 'Spain' },
]

describe('parseJerseyNumbers', () => {
  it('parses a semicolon list into a sorted unique set', () => {
    expect(parseJerseyNumbers('10;7;7').numbers).toEqual([7, 10]) // dedupe + sort
    expect(parseJerseyNumbers('10;7;7').invalid).toEqual([])
  })
  it('flags non-integer entries', () => {
    const r = parseJerseyNumbers('10;abc;7.5')
    expect(r.numbers).toEqual([10])
    expect(r.invalid).toEqual(['abc', '7.5'])
  })
  it('empty string yields empty set', () => {
    expect(parseJerseyNumbers('').numbers).toEqual([])
  })
})

describe('isLimitedCsvText', () => {
  it('detects the limited template by header', () => {
    expect(isLimitedCsvText(HEADER + '\nR16_089,Brazil,Spain,2,1,10;7,9')).toBe(true)
  })
  it('rejects a full-format header', () => {
    expect(isLimitedCsvText('match_id,home_team,predicted_winner')).toBe(false)
  })
})

describe('validateLimitedCsv', () => {
  const parse = (body: string) => parseLimitedCsvText(HEADER + '\n' + body).rows

  it('accepts a valid row and produces jersey scorer sets', () => {
    const rows = parse('R16_089,Brazil,Spain,2,1,10;7,9')
    const res = validateLimitedCsv(rows, matches)
    expect(res.valid).toBe(true)
    expect(res.predictions[0].home_score).toBe(2)
    expect(res.predictions[0].goal_scorers_jersey).toEqual({ home: [7, 10], away: [9] })
  })

  it('rejects when scorer count does not match the score', () => {
    const rows = parse('R16_089,Brazil,Spain,2,1,10,9') // 2-0 home but only 1 scorer
    const res = validateLimitedCsv(rows, matches)
    expect(res.valid).toBe(false)
    expect(res.errors.some(e => e.column === 'predicted_scorers_home')).toBe(true)
  })

  it('accepts a 0-0 with no scorers', () => {
    const rows = parse('R16_089,Brazil,Spain,0,0,,')
    const res = validateLimitedCsv(rows, matches)
    expect(res.valid).toBe(true)
    expect(res.predictions[0].goal_scorers_jersey).toEqual({ home: [], away: [] })
  })

  it('rejects non-integer jersey numbers', () => {
    const rows = parse('R16_089,Brazil,Spain,1,0,abc,')
    const res = validateLimitedCsv(rows, matches)
    expect(res.valid).toBe(false)
    expect(res.errors.some(e => e.message.includes('integers'))).toBe(true)
  })

  it('rejects an unknown match id', () => {
    const rows = parse('XX_999,A,B,1,0,10,')
    const res = validateLimitedCsv(rows, matches)
    expect(res.valid).toBe(false)
    expect(res.errors.some(e => e.message.includes('Invalid match ID'))).toBe(true)
  })

  it('flags missing predictions for matches in the bracket', () => {
    const rows = parse('R16_089,Brazil,Spain,1,0,10,')
    const twoMatches = [...matches, { match_code: 'R16_090', home_team: 'France', away_team: 'Japan' }]
    const res = validateLimitedCsv(rows, twoMatches)
    expect(res.valid).toBe(false)
    expect(res.errors.some(e => e.message.includes('Missing predictions'))).toBe(true)
  })
})
