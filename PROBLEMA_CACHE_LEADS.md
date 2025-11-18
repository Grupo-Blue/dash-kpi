# Problema: Erro ao Salvar Cache de Jornada de Leads

## Resumo
Ao buscar um lead pela primeira vez (sem cache), o sistema consegue buscar os dados do Mautic e Pipedrive corretamente, mas **falha ao salvar no cache** (`leadJourneyCache` table). Isso causa erro 500 e impede que os dados sejam exibidos ao usuário.

## Sintoma
- Usuário busca lead por e-mail em `/lead-analysis`
- Sistema busca dados do Mautic/Pipedrive com sucesso
- **Erro 500** ao tentar salvar no cache
- Dados não são exibidos ao usuário

## Erro nos Logs
```
},,2025-11-18 17:44:36.963,2025-11-19 17:44:36.963
```

Este log aparece repetidamente e indica que o Drizzle ORM está gerando um **SQL INSERT com formato incorreto**:
- `}` = final do JSON (`mauticData` ou `pipedriveData`)
- `,` = separador normal
- `,` = **SEGUNDO separador** (indica campo vazio - provavelmente `aiAnalysis`)
- `2025-11-18 17:44:36.963` = `cachedAt`
- `2025-11-19 17:44:36.963` = `expiresAt`

As **duas vírgulas seguidas** (`,,`) indicam que há um valor vazio/null sendo passado incorretamente.

## Arquivos Envolvidos

### 1. `server/db/leadJourneyDb.ts`
Função `saveLeadJourneyCache()` - linha 126

**Tentativas de correção já feitas:**
- ✅ Adicionada função `normalizeDates()` para converter datas no formato ISO com `+00:00` para formato MySQL
- ✅ Garantido que `aiAnalysis` nunca seja `null` (convertido para string vazia `''`)
- ✅ Adicionados logs de debug (mas não aparecem nos logs do servidor)
- ❌ **Problema persiste**

### 2. `drizzle/schema.ts`
Definição da tabela `leadJourneyCache` - linhas 175-183

```typescript
export const leadJourneyCache = mysqlTable("leadJourneyCache", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  mauticData: json("mauticData").notNull(),
  pipedriveData: json("pipedriveData").notNull(),
  aiAnalysis: text("aiAnalysis"),
  cachedAt: timestamp("cachedAt").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});
```

### 3. `server/services/leadJourneyService.ts`
Função que chama `saveLeadJourneyCache()` - linha 144

## Ambiente

### Desenvolvimento (Local)
- ✅ Funciona corretamente
- ✅ `DATABASE_URL` configurado via secrets do sistema
- ✅ Drizzle conecta e salva sem problemas

### Produção (Servidor 84.247.191.105)
- ❌ Falha ao salvar cache
- ✅ `DATABASE_URL` configurado via `ecosystem.config.cjs` do PM2
- ✅ Drizzle conecta ao banco (outras queries funcionam)
- ❌ INSERT na tabela `leadJourneyCache` gera formato incorreto

## Configuração do Servidor

### DATABASE_URL
```
mysql://root:Grupo%40Blue2025@localhost:3306/kpi_dashboard
```
(Senha URL-encoded porque contém `@`)

### PM2 Configuration (`/root/dash-kpi/ecosystem.config.cjs`)
```javascript
module.exports = {
  apps: [{
    name: 'kpi-dashboard',
    script: './dist/index.js',
    env: {
      DATABASE_URL: 'mysql://root:Grupo%40Blue2025@localhost:3306/kpi_dashboard',
      NODE_ENV: 'production'
    }
  }]
};
```

## Dados de Teste
- **Email**: viniciusdeoa@gmail.com
- **Mautic Contact ID**: 97918
- **Cache**: Limpo antes de cada teste

## Hipóteses

### 1. Problema com campos JSON + timestamp no mesmo INSERT
O Drizzle pode estar tendo problema ao serializar JSON junto com timestamps no MySQL.

### 2. Problema com `aiAnalysis` null/empty
Mesmo garantindo que seja string vazia, o Drizzle pode estar tratando incorretamente.

### 3. Problema com timezone das datas
As datas estão sendo criadas com `new Date()` mas o MySQL pode estar esperando formato diferente.

### 4. Problema com `onDuplicateKeyUpdate`
O código usa `.onDuplicateKeyUpdate()` que pode estar gerando SQL incorreto.

## Código Relevante

### saveLeadJourneyCache (server/db/leadJourneyDb.ts)
```typescript
export async function saveLeadJourneyCache(data: InsertLeadJourneyCache): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save lead journey cache: database not available");
    return;
  }

  try {
    console.log('[DEBUG] Attempting to save cache:', {
      email: data.email,
      cachedAt: data.cachedAt,
      cachedAtType: typeof data.cachedAt,
      expiresAt: data.expiresAt,
      expiresAtType: typeof data.expiresAt
    });
    
    // Normalizar datas antes de salvar
    const normalizedData = {
      email: data.email,
      mauticData: normalizeDates(data.mauticData),
      pipedriveData: normalizeDates(data.pipedriveData),
      aiAnalysis: data.aiAnalysis || '', // Garantir que nunca seja null
      cachedAt: data.cachedAt instanceof Date ? data.cachedAt : new Date(data.cachedAt),
      expiresAt: data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt),
    };
    
    // Tentar inserir, se já existir, atualizar
    await db
      .insert(leadJourneyCache)
      .values(normalizedData)
      .onDuplicateKeyUpdate({
        set: {
          mauticData: normalizedData.mauticData,
          pipedriveData: normalizedData.pipedriveData,
          aiAnalysis: normalizedData.aiAnalysis,
          cachedAt: normalizedData.cachedAt,
          expiresAt: normalizedData.expiresAt,
        },
      });
  } catch (error) {
    console.error("[Database] Failed to save lead journey cache:", error);
    throw error;
  }
}
```

## Próximos Passos Sugeridos

1. **Verificar versão do Drizzle ORM** - pode haver bug conhecido
2. **Testar INSERT direto via SQL** - verificar se o problema é do Drizzle ou do MySQL
3. **Simplificar o INSERT** - remover `onDuplicateKeyUpdate` temporariamente
4. **Converter timestamps para strings** - passar datas como strings MySQL DATETIME ao invés de objetos Date
5. **Adicionar logging do SQL gerado** - ver exatamente qual query o Drizzle está gerando

## Como Reproduzir

1. Acessar https://dashboard.grupoblue.com.br/lead-analysis
2. Buscar por: viniciusdeoa@gmail.com
3. Verificar logs do PM2: `pm2 logs kpi-dashboard --lines 100`
4. Observar erro com formato `},,2025-11-18...`

## Contato
Para dúvidas, verificar:
- Logs do PM2 no servidor: `ssh root@84.247.191.105` (senha: fjykwePMThmj6nav)
- Código no GitHub: https://github.com/Grupo-Blue/dash-kpi
- Branch: `master`
- Commit mais recente com tentativas de correção
