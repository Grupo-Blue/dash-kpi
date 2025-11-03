# Sistema de Snapshots Diários de KPIs

## 📋 Visão Geral

Sistema automatizado que captura e armazena snapshots diários de todos os KPIs do dashboard, permitindo consultas históricas independentes das APIs externas.

## 🎯 Objetivo

Resolver a limitação das APIs externas (Pipedrive, Nibo, Discord, Metricool, Cademi) que retornam apenas dados atuais, sem suporte a consultas históricas. Com os snapshots armazenados no banco de dados, é possível:

- ✅ Visualizar dados históricos de qualquer período
- ✅ Comparar métricas entre diferentes datas
- ✅ Gerar relatórios mensais/trimestrais/anuais
- ✅ Independência das APIs externas para dados passados

## 🏗️ Arquitetura

### 1. Banco de Dados

**Tabela: `kpiSnapshots`**
```sql
CREATE TABLE kpiSnapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyId INTEGER NOT NULL,
  snapshotDate DATETIME NOT NULL,
  kpiType TEXT NOT NULL,
  source TEXT NOT NULL,
  data JSON NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `companyId`: ID da empresa (1=Blue Consult, 2=Tokeniza, 4=Tokeniza Academy, 30004=Mychel Mendes)
- `snapshotDate`: Data do snapshot (sempre meia-noite: 00:00:00)
- `kpiType`: Tipo de KPI (`blue_consult_all`, `metricool_social`, `cademi_courses`, etc.)
- `source`: Fonte dos dados (`consolidated`, `metricool`, `cademi`, etc.)
- `data`: Dados completos em formato JSON

### 2. Serviço de Snapshot

**Arquivo: `server/services/snapshotService.ts`**

Responsável por coletar dados de todas as APIs e salvá-los no banco:

- `snapshotBlueConsult()` - KPIs consolidados da Blue Consult (Pipedrive + Nibo)
- `snapshotTokenizaAcademy()` - KPIs consolidados da Tokeniza Academy (Discord + Metricool)
- `snapshotMetricool()` - Métricas de redes sociais por empresa
- `snapshotCademi()` - Dados dos cursos da Tokeniza Academy
- `executeAllSnapshots()` - Executa todos os snapshots

### 3. Job Diário

**Arquivo: `server/jobs/dailySnapshot.ts`**

Job automatizado que executa à meia-noite (00:00) todos os dias usando `node-cron`:

```typescript
// Schedule: Every day at midnight (00:00)
cron.schedule('0 0 0 * * *', async () => {
  await SnapshotService.executeAllSnapshots();
});
```

**Inicialização:** O job é inicializado automaticamente quando o servidor inicia (`server/_core/index.ts`).

### 4. Endpoints tRPC

**Arquivo: `server/routers.ts`**

Três endpoints disponíveis:

1. **`snapshots.executeManual`** - Executa snapshot manualmente (para testes)
   ```typescript
   const result = await trpc.snapshots.executeManual.mutate();
   // Returns: { success: true, success: 7, failed: 0 }
   ```

2. **`snapshots.getHistorical`** - Busca snapshots por período
   ```typescript
   const snapshots = await trpc.snapshots.getHistorical.query({
     companyId: 1,
     startDate: '2025-01-01',
     endDate: '2025-01-31',
     kpiType: 'metricool_social' // opcional
   });
   ```

3. **`snapshots.getLatest`** - Busca snapshot mais recente
   ```typescript
   const latest = await trpc.snapshots.getLatest.query({
     companyId: 1,
     kpiType: 'blue_consult_all'
   });
   ```

## 🧪 Como Testar

### Teste 1: Executar Snapshot Manualmente

```bash
cd /home/ubuntu/kpi-dashboard
pnpm exec tsx test-snapshot.ts
```

**Resultado esperado:**
```
=== Testing Snapshot System ===

[SnapshotService] Starting daily snapshot execution...
[SnapshotService] Processing Blue Consult...
[SnapshotService] Saved snapshot: blue_consult_all for company 1
[SnapshotService] Processing Tokeniza Academy...
[SnapshotService] Saved snapshot: tokeniza_academy_all for company 4
[SnapshotService] Processing Metricool for Blue Consult...
[SnapshotService] Saved snapshot: metricool_social for company 1
... (mais logs)
[SnapshotService] Snapshot execution completed. Success: 7, Failed: 0

=== Snapshot Result ===
Success: 7
Failed: 0
```

### Teste 2: Verificar Dados no Banco

```bash
cd /home/ubuntu/kpi-dashboard
pnpm exec tsx -e "
import { getDb } from './server/db.js';
import { kpiSnapshots } from './drizzle/schema.js';

const db = await getDb();
const snapshots = await db.select().from(kpiSnapshots).limit(10);
console.log(JSON.stringify(snapshots, null, 2));
"
```

### Teste 3: Consultar via tRPC (Frontend)

Adicione este código em qualquer página React:

```typescript
// Executar snapshot manualmente
const executeMutation = trpc.snapshots.executeManual.useMutation();
const handleExecute = async () => {
  const result = await executeMutation.mutateAsync();
  console.log('Snapshot result:', result);
};

// Buscar snapshots históricos
const { data: historicalData } = trpc.snapshots.getHistorical.useQuery({
  companyId: 1,
  startDate: '2025-10-01',
  endDate: '2025-10-31',
});

// Buscar snapshot mais recente
const { data: latestData } = trpc.snapshots.getLatest.useQuery({
  companyId: 1,
  kpiType: 'blue_consult_all',
});
```

## 📊 Tipos de Snapshots

| kpiType | Empresa | Fonte | Conteúdo |
|---------|---------|-------|----------|
| `blue_consult_all` | Blue Consult (1) | Consolidated | Pipedrive + Nibo |
| `tokeniza_academy_all` | Tokeniza Academy (4) | Consolidated | Discord + Metricool |
| `metricool_social` | Todas | Metricool | Redes sociais |
| `cademi_courses` | Tokeniza Academy (4) | Cademi | Cursos e alunos |

## ⏰ Agendamento

**Horário:** Todos os dias às 00:00 (meia-noite)
**Duração estimada:** 30-60 segundos (depende das APIs)
**Logs:** Todos os snapshots são registrados no console do servidor

## 🔧 Manutenção

### Adicionar Novo Tipo de Snapshot

1. Criar método no `SnapshotService`:
   ```typescript
   static async snapshotNovoTipo(): Promise<boolean> {
     // Coletar dados
     // Salvar snapshot
   }
   ```

2. Adicionar chamada em `executeAllSnapshots()`:
   ```typescript
   const result = await this.snapshotNovoTipo();
   result ? success++ : failed++;
   ```

### Limpar Snapshots Antigos

Para evitar crescimento excessivo do banco, considere criar um job mensal para deletar snapshots antigos:

```typescript
// Deletar snapshots com mais de 1 ano
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

await db.delete(kpiSnapshots)
  .where(lt(kpiSnapshots.snapshotDate, oneYearAgo));
```

## 🐛 Troubleshooting

### Problema: Job não está executando

**Verificar:**
1. Servidor está rodando?
2. Logs mostram "DailySnapshotJob initialized"?
3. Verificar timezone do servidor

### Problema: Snapshots falhando

**Verificar:**
1. APIs externas estão online?
2. Tokens/credenciais estão válidos?
3. Logs de erro no console

### Problema: Dados históricos não aparecem

**Verificar:**
1. Snapshots foram executados? (`SELECT * FROM kpiSnapshots LIMIT 10`)
2. Filtro de data está correto?
3. CompanyId está correto?

## 📝 Notas Importantes

1. **Primeiro snapshot:** Execute manualmente para gerar dados iniciais
2. **Performance:** Snapshots podem demorar 30-60s, não bloqueia o servidor
3. **Dados históricos:** Só estarão disponíveis após primeiro snapshot
4. **Timezone:** Snapshots usam timezone do servidor (UTC por padrão)
5. **Armazenamento:** Cada snapshot ocupa ~5-50KB dependendo dos dados

## 🚀 Próximos Passos

1. ✅ Executar primeiro snapshot manualmente
2. ✅ Validar dados no banco
3. ⏳ Aguardar 24h para validar job automático
4. ⏳ Atualizar frontend para usar dados históricos com filtro de período
5. ⏳ Implementar gráficos de evolução temporal
