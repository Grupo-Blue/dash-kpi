import * as db from './server/db';

async function checkCompanies() {
  console.log('\n=== CHECKING COMPANIES ===\n');
  
  try {
    const companies = await db.getAllCompanies();
    console.log('Companies found:', companies.length);
    companies.forEach(c => {
      console.log(`- ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}`);
    });
    
    console.log('\n=== CHECKING SPECIFIC IDs ===\n');
    const tokeniza = await db.getCompanyById(30003);
    console.log('Tokeniza (30003):', tokeniza ? `Found: ${tokeniza.name}` : 'NOT FOUND');
    
    const blueConsult = await db.getCompanyById(30001);
    console.log('Blue Consult (30001):', blueConsult ? `Found: ${blueConsult.name}` : 'NOT FOUND');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCompanies();
