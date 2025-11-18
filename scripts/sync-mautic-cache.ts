/**
 * Script para sincronizar cache de e-mails e páginas do Mautic
 * Execução: tsx scripts/sync-mautic-cache.ts
 */

import { mauticCacheService } from '../server/services/mauticCacheService';

async function main() {
  console.log('=== Sincronização de Cache do Mautic ===\n');
  
  try {
    const result = await mauticCacheService.syncAll();
    
    console.log('\n=== Resultado ===');
    console.log(`E-mails: ${result.emails.synced} sincronizados, ${result.emails.errors} erros`);
    console.log(`Páginas: ${result.pages.synced} sincronizadas, ${result.pages.errors} erros`);
    console.log('\n✅ Sincronização concluída!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro na sincronização:', error);
    process.exit(1);
  }
}

main();
