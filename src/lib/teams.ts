export const FIFA_CODES: Record<string, string> = {
  'ARG': 'Argentina',
  'AUS': 'Australia',
  'AUT': 'Austria',
  'BEL': 'Belgium',
  'BRA': 'Brazil',
  'CMR': 'Cameroon',
  'CAN': 'Canada',
  'CHI': 'Chile',
  'COL': 'Colombia',
  'CRC': 'Costa Rica',
  'CRO': 'Croatia',
  'CZE': 'Czech Republic',
  'DEN': 'Denmark',
  'ECU': 'Ecuador',
  'EGY': 'Egypt',
  'ENG': 'England',
  'ESP': 'Spain',
  'FRA': 'France',
  'GER': 'Germany',
  'GHA': 'Ghana',
  'GRE': 'Greece',
  'IRN': 'Iran',
  'ITA': 'Italy',
  'JPN': 'Japan',
  'KOR': 'South Korea',
  'KSA': 'Saudi Arabia',
  'MAR': 'Morocco',
  'MEX': 'Mexico',
  'NED': 'Netherlands',
  'NGA': 'Nigeria',
  'NOR': 'Norway',
  'PER': 'Peru',
  'POL': 'Poland',
  'POR': 'Portugal',
  'QAT': 'Qatar',
  'ROU': 'Romania',
  'SEN': 'Senegal',
  'SRB': 'Serbia',
  'SUI': 'Switzerland',
  'SWE': 'Sweden',
  'TUN': 'Tunisia',
  'TUR': 'Turkey',
  'URU': 'Uruguay',
  'USA': 'United States',
  'WAL': 'Wales'
};

export function normalizeTeamName(value: string | null | undefined): string {
  if (!value) return ''
  const trimmed = value.trim()
  const upper = trimmed.toUpperCase()
  
  if (FIFA_CODES[upper]) {
    return FIFA_CODES[upper].toLowerCase()
  }
  
  return trimmed.toLowerCase()
}
