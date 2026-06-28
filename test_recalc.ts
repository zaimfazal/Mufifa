require('dotenv').config({ path: '.env.local' });
import { recalculateAll } from './src/lib/scoring/calculator';

async function test() {
  console.log('Starting recalculation...');
  try {
    await recalculateAll();
    console.log('Recalculation finished.');
  } catch (err) {
    console.error('Error during recalculation:', err);
  }
}

test();
