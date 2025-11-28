# 🔒 Sprint 1 - Auditoria de Segurança

**Data:** 28 de novembro de 2025  
**Status:** EM ANDAMENTO

---

## 📋 Resumo Executivo

Esta auditoria identificou **vulnerabilidades críticas de segurança** no código que expõem:
- Tokens e chaves de API hard-coded
- Endpoints de debug sem proteção
- Políticas de cookies inseguras
- Logs com dados sensíveis

---

## 🚨 Vulnerabilidades Identificadas

### 1. Tokens Hard-coded (CRÍTICO)

#### 1.1 Token Metricool Exposto
**Arquivo:** `server/routers.ts`  
**Linhas:** 487, 498

```typescript
// ❌ VULNERABILIDADE CRÍTICA
const metricoolToken = process.env.METRICOOL_API_TOKEN || 'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC';
const metricoolUserId = process.env.METRICOOL_USER_ID || '3061390';
```

**Risco:**
- Token exposto no código-fonte
- Acesso não autorizado à conta Metricool
- Possibilidade de roubo de dados de redes sociais

**Solução:**
- Remover fallback hard-coded
- Lançar erro se variável de ambiente não configurada
- Adicionar validação de token

---

#### 1.2 Token Nibo com Fallback Comentado
**Arquivo:** `server/routers.ts`  
**Linhas:** 382-389

```typescript
// ⚠️ VULNERABILIDADE MÉDIA
const niboToken = process.env.NIBO_API_TOKEN;
if (!niboToken) {
  throw new Error('[P1-5] NIBO_API_TOKEN not configured in environment variables');
}
console.log('[niboFinancial] Token exists:', !!niboToken);
console.log('[niboFinancial] Token source:', process.env.NIBO_API_TOKEN ? 'env' : 'hardcoded');
```

**Risco:**
- Logs expõem existência e origem do token
- Informação útil para atacantes

**Solução:**
- Remover logs de debug de tokens
- Implementar logger seguro

---

### 2. Endpoints de Debug Expostos (CRÍTICO)

#### 2.1 Endpoint `debugEnv`
**Arquivo:** `server/routers.ts`  
**Linhas:** 369-375

```typescript
// ❌ VULNERABILIDADE CRÍTICA
debugEnv: protectedProcedure.query(async () => {
  return {
    hasNiboToken: !!process.env.NIBO_API_TOKEN,
    niboTokenLength: process.env.NIBO_API_TOKEN?.length || 0,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('NIBO') || k.includes('PIPEDRIVE')),
  };
}),
```

**Risco:**
- Expõe nomes de variáveis de ambiente
- Expõe tamanho de tokens (facilita brute force)
- Expõe estrutura de configuração

**Solução:**
- Remover endpoint completamente OU
- Adicionar middleware de admin-only
- Implementar flag de debug

---

#### 2.2 Endpoint `debugTikTokData`
**Arquivo:** `server/routers.ts`  
**Linhas:** 479-490

```typescript
// ❌ VULNERABILIDADE ALTA
debugTikTokData: protectedProcedure
  .input(z.object({ 
    blogId: z.string(),
    from: z.string(),
    to: z.string()
  }))
  .query(async ({ input }) => {
    const { MetricoolService } = await import('./services/integrations');
    const metricoolToken = process.env.METRICOOL_API_TOKEN || 'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC';
    const service = new MetricoolService(metricoolToken);
    const data = await service.getTikTokVideos(input.blogId, input.from, input.to);
    return data;
  }),
```

**Risco:**
- Expõe dados brutos da API
- Usa token hard-coded
- Sem restrição de acesso

**Solução:**
- Remover endpoint completamente OU
- Adicionar middleware de admin-only
- Remover token hard-coded

---

#### 2.3 Endpoint `metricoolBrands`
**Arquivo:** `server/routers.ts`  
**Linhas:** 494-514

```typescript
// ❌ VULNERABILIDADE ALTA
metricoolBrands: protectedProcedure.query(async () => {
  console.log('[metricoolBrands] Fetching brands...');
  
  try {
    const metricoolToken = process.env.METRICOOL_API_TOKEN || 'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC';
    const metricoolUserId = process.env.METRICOOL_USER_ID || '3061390';
    
    const service = new MetricoolService(metricoolToken);
    const calculator = new MetricoolKpiCalculator(metricoolToken, metricoolUserId);
    const brands = await calculator.getBrands();
    
    console.log('[metricoolBrands] Brands fetched:', brands.data?.length || 0);
    return brands;
  } catch (error: any) {
    console.error('[metricoolBrands] ERROR:', error.message);
    throw error;
  }
}),
```

**Risco:**
- Expõe lista de marcas conectadas
- Usa tokens hard-coded
- Logs expõem informações internas

**Solução:**
- Remover endpoint completamente OU
- Adicionar middleware de admin-only
- Remover tokens hard-coded
- Implementar logger seguro

---

### 3. Políticas de Cookies Inseguras (MÉDIO)

#### 3.1 Configuração Atual
**Arquivo:** `server/_core/cookies.ts`  
**Linhas:** 24-48

```typescript
// ⚠️ VULNERABILIDADE MÉDIA
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",  // ❌ INSEGURO
    secure: isSecureRequest(req),  // ⚠️ CONDICIONAL
  };
}
```

**Problemas:**
1. **`sameSite: "none"`** - Permite CSRF (Cross-Site Request Forgery)
2. **`secure` condicional** - Pode ser false em desenvolvimento
3. **`domain` não definido** - Pode vazar cookies entre subdomínios

**Solução:**
```typescript
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    path: "/",
    sameSite: "strict",  // ✅ SEGURO
    secure: true,  // ✅ SEMPRE SEGURO
    domain: isProduction ? hostname : undefined,  // ✅ EXPLÍCITO
  };
}
```

---

### 4. Logs com Dados Sensíveis (ALTO)

#### 4.1 Logs de Tokens
**Arquivo:** `server/routers.ts`  
**Linhas:** 387-388

```typescript
// ❌ VULNERABILIDADE ALTA
console.log('[niboFinancial] Token exists:', !!niboToken);
console.log('[niboFinancial] Token source:', process.env.NIBO_API_TOKEN ? 'env' : 'hardcoded');
```

**Risco:**
- Expõe informações sobre tokens em logs
- Logs podem ser acessados por atacantes

---

#### 4.2 Logs de Métricas Sensíveis
**Arquivo:** `server/services/metricoolKpiCalculator.ts`  
**Linhas:** 309-310, 386

```typescript
// ⚠️ VULNERABILIDADE MÉDIA
console.log('[MetricoolKPI] Starting followers fetch...');
console.log('[MetricoolKPI] Period:', { from, to });
console.log(`[MetricoolKPI] YouTube subscribers from YouTube API: ${ytCurrent}`);
```

**Risco:**
- Expõe métricas de negócio em logs
- Informações competitivas sensíveis

---

#### 4.3 Logs de Dados de Usuários
**Arquivo:** `server/routers.ts`  
**Linhas:** 553, 653

```typescript
// ⚠️ VULNERABILIDADE MÉDIA
console.log('[socialMediaMetrics] Saved manual metrics for company:', input.companyId, 'network:', input.network);
console.log('[tiktokMetrics] Saved manual metrics for company:', input.companyId);
```

**Risco:**
- Expõe IDs de empresas
- Rastreamento de atividades

---

## 🎯 Plano de Correção

### Fase 1: Remoção de Tokens Hard-coded (URGENTE)

**Arquivos a modificar:**
- `server/routers.ts` (linhas 487, 498)

**Ações:**
1. Remover fallback `'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC'`
2. Remover fallback `'3061390'`
3. Lançar erro claro se variáveis não configuradas
4. Adicionar validação de formato de token

---

### Fase 2: Desativação de Endpoints de Debug (URGENTE)

**Arquivos a modificar:**
- `server/routers.ts` (linhas 369-514)

**Opção A: Remoção Completa (Recomendado)**
```typescript
// Remover completamente:
// - debugEnv
// - debugTikTokData
// - metricoolBrands
```

**Opção B: Proteção com Admin-Only**
```typescript
// Criar middleware adminProcedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});

// Usar em endpoints de debug
debugEnv: adminProcedure.query(async () => { ... });
```

---

### Fase 3: Correção de Políticas de Cookies (ALTA PRIORIDADE)

**Arquivo a modificar:**
- `server/_core/cookies.ts` (linhas 24-48)

**Mudanças:**
1. `sameSite: "none"` → `sameSite: "strict"`
2. `secure: isSecureRequest(req)` → `secure: true`
3. Adicionar `domain` explícito

---

### Fase 4: Implementação de Logger Seguro (ALTA PRIORIDADE)

**Novo arquivo:** `server/utils/secureLogger.ts`

**Funcionalidades:**
- Mascaramento automático de tokens
- Mascaramento de dados sensíveis
- Níveis de log configuráveis
- Formatação estruturada

**Exemplo de uso:**
```typescript
import { logger } from './utils/secureLogger';

// ❌ ANTES
console.log('[niboFinancial] Token exists:', !!niboToken);

// ✅ DEPOIS
logger.info('Nibo financial data fetched', { 
  hasToken: true,
  // token é automaticamente mascarado
});
```

---

## 📊 Resumo de Impacto

| Vulnerabilidade | Severidade | Arquivos Afetados | Linhas | Prioridade |
|----------------|------------|-------------------|--------|------------|
| Tokens Hard-coded | 🔴 CRÍTICO | 1 | 2 | URGENTE |
| Endpoints Debug | 🔴 CRÍTICO | 1 | 46 | URGENTE |
| Políticas Cookies | 🟡 MÉDIO | 1 | 25 | ALTA |
| Logs Sensíveis | 🟠 ALTO | 2 | 8 | ALTA |

---

## ✅ Checklist de Implementação

### Fase 1: Tokens Hard-coded
- [ ] Remover token Metricool hard-coded (linha 487)
- [ ] Remover userId Metricool hard-coded (linha 498)
- [ ] Adicionar validação de variáveis de ambiente
- [ ] Criar mensagens de erro adequadas
- [ ] Testar com variáveis não configuradas

### Fase 2: Endpoints Debug
- [ ] Decidir: Remover ou Proteger
- [ ] Se Proteger: Criar adminProcedure middleware
- [ ] Se Proteger: Adicionar flag de debug em ENV
- [ ] Aplicar proteção em debugEnv
- [ ] Aplicar proteção em debugTikTokData
- [ ] Aplicar proteção em metricoolBrands
- [ ] Testar acesso com usuário não-admin

### Fase 3: Cookies
- [ ] Alterar sameSite para "strict"
- [ ] Alterar secure para true (sempre)
- [ ] Adicionar domain explícito
- [ ] Testar em desenvolvimento
- [ ] Testar em produção

### Fase 4: Logger Seguro
- [ ] Criar arquivo secureLogger.ts
- [ ] Implementar mascaramento de tokens
- [ ] Implementar mascaramento de dados sensíveis
- [ ] Implementar níveis de log
- [ ] Substituir console.log em routers.ts
- [ ] Substituir console.log em metricoolKpiCalculator.ts
- [ ] Substituir console.error em todos os arquivos
- [ ] Testar logger em desenvolvimento
- [ ] Testar logger em produção

---

## 🔍 Arquivos Identificados para Modificação

1. **`server/routers.ts`** - Tokens, endpoints debug, logs
2. **`server/_core/cookies.ts`** - Políticas de cookies
3. **`server/services/metricoolKpiCalculator.ts`** - Logs sensíveis
4. **`server/utils/secureLogger.ts`** - NOVO ARQUIVO (a criar)

---

## 📝 Notas Técnicas

### Mascaramento de Tokens
```typescript
function maskToken(token: string): string {
  if (!token) return '[EMPTY]';
  if (token.length < 8) return '[TOO_SHORT]';
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}

// Exemplo:
// Input:  'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC'
// Output: 'VQIT...RARC'
```

### Validação de Variáveis de Ambiente
```typescript
function validateEnvVars() {
  const required = [
    'METRICOOL_API_TOKEN',
    'METRICOOL_USER_ID',
    'NIBO_API_TOKEN',
    'PIPEDRIVE_API_TOKEN',
    'DISCORD_BOT_TOKEN',
    'YOUTUBE_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

---

## 🚀 Próximos Passos

1. ✅ **Auditoria concluída** - Vulnerabilidades identificadas
2. 🔄 **Implementação em andamento** - Sprint 1
3. ⏳ **Testes pendentes** - Após implementação
4. ⏳ **Deploy pendente** - Após testes
5. ⏳ **Validação em produção** - Após deploy

---

**Responsável:** Manus AI Agent  
**Última Atualização:** 28/11/2025
