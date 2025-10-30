import { BlueConsultKpiCalculatorRefined } from './server/services/kpiCalculatorRefined';
import { NiboKpiCalculator } from './server/services/niboKpiCalculator';
import { TokenizaAcademyKpiCalculatorRefined } from './server/services/kpiCalculatorDiscordRefined';
import { MetricoolKpiCalculator } from './server/services/metricoolKpiCalculator';

async function testConsolidated() {
  console.log('Testing consolidated KPIs endpoint...\n');

  try {
    // 1. Blue Consult - Pipedrive
    console.log('1. Testing Blue Consult (Pipedrive)...');
    const blueConsultCalculator = new BlueConsultKpiCalculatorRefined();
    const blueConsultKpis = await blueConsultCalculator.calculate();
    console.log('✅ Blue Consult:', blueConsultKpis);

    // 2. Nibo
    console.log('\n2. Testing Nibo (Financial)...');
    const niboCalculator = new NiboKpiCalculator();
    const niboKpis = await niboCalculator.calculate();
    console.log('✅ Nibo:', niboKpis);

    // 3. Tokeniza Academy - Discord
    console.log('\n3. Testing Tokeniza Academy (Discord)...');
    const tokenizaAcademyCalculator = new TokenizaAcademyKpiCalculatorRefined();
    const tokenizaAcademyKpis = await tokenizaAcademyCalculator.calculate();
    console.log('✅ Tokeniza Academy:', tokenizaAcademyKpis);

    // 4. Metricool
    console.log('\n4. Testing Metricool (Social Media)...');
    const metricoolCalculator = new MetricoolKpiCalculator('3890486');
    const metricoolKpis = await metricoolCalculator.calculate();
    console.log('✅ Metricool:', metricoolKpis);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

testConsolidated();
