import { CademiKpiCalculator } from './server/services/cademiKpiCalculator';

async function test() {
  const calculator = new CademiKpiCalculator();
  const kpis = await calculator.calculateKpis();
  
  console.log('=== KPIs da Cademi ===');
  console.log('Total de alunos:', kpis.totalStudents);
  console.log('Variação:', kpis.studentsGrowth);
  console.log('Nunca acessaram:', kpis.neverAccessed);
  console.log('Emails inválidos:', kpis.invalidEmails);
  console.log('\nDistribuição de acessos:');
  console.log(JSON.stringify(kpis.accessDistribution, null, 2));
}

test().catch(console.error);
