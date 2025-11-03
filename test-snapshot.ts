import { executeSnapshotManually } from './server/jobs/dailySnapshot';

async function testSnapshot() {
  console.log('=== Testing Snapshot System ===\n');
  
  try {
    const result = await executeSnapshotManually();
    console.log('\n=== Snapshot Result ===');
    console.log(`Success: ${result.success}`);
    console.log(`Failed: ${result.failed}`);
    console.log('\nSnapshot test completed successfully!');
  } catch (error) {
    console.error('\n=== Snapshot Test Failed ===');
    console.error(error);
    process.exit(1);
  }
}

testSnapshot();
