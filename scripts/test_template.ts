import { generateTemplate } from '../src/lib/csv/template-generator';

async function test() {
  try {
    const matches: any[] = [
      { stage: 'round_of_16', match_code: 'R16_001', home_team: 'Team A', away_team: 'Team B' }
    ];
    const csv = generateTemplate(matches, true);
    console.log('Success:', csv);
  } catch (err) {
    console.error('Test Error:', err);
  }
}

test();
