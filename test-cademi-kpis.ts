import { calculateCademiKpis } from './server/services/cademiKpiCalculator';

async function test() {
  console.log('=== Testing Cademi KPIs Calculation ===\n');
  
  try {
    const kpis = await calculateCademiKpis();
    
    console.log('\n✅ KPIs Calculated Successfully!\n');
    console.log('📊 Summary:');
    console.log(`- Total Students: ${kpis.totalStudents}`);
    console.log(`- Growth: ${kpis.studentsVariation.toFixed(2)}%`);
    console.log(`- Never Accessed: ${kpis.neverAccessed}`);
    console.log(`- Invalid Emails: ${kpis.invalidEmails}`);
    console.log(`- Access Last 30 Days: ${kpis.accessLast30Days}`);
    
    console.log('\n📅 Access Distribution:');
    console.log(`- Today: ${kpis.accessDistribution.today}`);
    console.log(`- Yesterday: ${kpis.accessDistribution.yesterday}`);
    console.log(`- 2-7 days: ${kpis.accessDistribution.days2to7}`);
    console.log(`- 7-14 days: ${kpis.accessDistribution.days7to14}`);
    console.log(`- 14-30 days: ${kpis.accessDistribution.days14to30}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

test();
