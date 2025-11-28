# 🔒 Checklist de Segurança - Dashboard de KPIs

Este documento fornece práticas recomendadas de segurança e um checklist completo para garantir que o Dashboard de KPIs esteja protegido contra vulnerabilidades comuns.

---

## 📋 Índice

1. [Práticas de Segurança Gerais](#práticas-de-segurança-gerais)
2. [Gestão de Secrets e Credenciais](#gestão-de-secrets-e-credenciais)
3. [Autenticação e Autorização](#autenticação-e-autorização)
4. [Proteção de Dados](#proteção-de-dados)
5. [Segurança de API](#segurança-de-api)
6. [Endpoints de Debug](#endpoints-de-debug)
7. [Anonimização de Dados](#anonimização-de-dados)
8. [CORS e CSP](#cors-e-csp)
9. [Rate Limiting](#rate-limiting)
10. [Backup e Recovery](#backup-e-recovery)
11. [Auditoria de Segurança](#auditoria-de-segurança)
12. [Checklist Final](#checklist-final)

---

## 🛡️ Práticas de Segurança Gerais

### ✅ Evitar localStorage para Dados Sensíveis

**Problema:** localStorage é acessível via JavaScript e vulnerável a XSS.

**Solução:**
- ✅ Use **httpOnly cookies** para tokens de autenticação
- ✅ Nunca armazene tokens, senhas ou dados sensíveis no localStorage
- ✅ Use sessionStorage apenas para dados não-sensíveis e temporários

**Implementação Atual:**
```typescript
// ✅ CORRETO - Cookies httpOnly (server/_core/cookies.ts)
{
  httpOnly: true,  // Não acessível via JavaScript
  secure: true,    // Apenas HTTPS
  sameSite: 'strict',
}

// ❌ ERRADO - Não faça isso
localStorage.setItem('authToken', token);
```

---

### ✅ Usar httpOnly Cookies

**Benefícios:**
- Proteção contra XSS (Cross-Site Scripting)
- Não acessível via JavaScript
- Enviado automaticamente em requisições

**Configuração:**
```typescript
// server/_core/cookies.ts
export function getSessionCookieOptions(req: Request): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const hostname = req.hostname;

  return {
    httpOnly: true,        // ✅ Não acessível via JS
    secure: isProduction,  // ✅ HTTPS em produção
    sameSite: 'strict',    // ✅ Proteção CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    domain: isProduction ? `.${hostname}` : undefined,
  };
}
```

---

### ✅ Implementar CSRF Protection

**O que é CSRF?**
Cross-Site Request Forgery - ataque que força usuário autenticado a executar ações não intencionais.

**Proteção Implementada:**
- ✅ `sameSite: 'strict'` nos cookies
- ✅ Verificação de origem das requisições
- ✅ Tokens CSRF (se necessário)

**Adicionar Token CSRF (Opcional):**
```typescript
// server/_core/csrf.ts
import crypto from 'crypto';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCsrfToken(token: string, expected: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expected)
  );
}
```

---

### ✅ Validar Inputs do Usuário

**Sempre valide e sanitize inputs!**

**Implementação com Zod (já usado no projeto):**
```typescript
import { z } from 'zod';

// ✅ CORRETO - Validação com Zod
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(0).max(150),
});

// Validar input
const result = schema.safeParse(input);
if (!result.success) {
  throw new Error('Invalid input');
}
```

**Regras:**
- ✅ Valide tipo, formato e tamanho
- ✅ Use whitelist ao invés de blacklist
- ✅ Sanitize antes de usar em queries SQL
- ✅ Escape antes de renderizar em HTML

---

### ✅ Sanitizar Dados Antes de Exibir

**Proteção contra XSS:**

```typescript
// ✅ Use biblioteca de sanitização
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(userInput);
```

**No React:**
```tsx
// ✅ React já escapa por padrão
<div>{userInput}</div>

// ❌ Cuidado com dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // Evite!

// ✅ Se necessário, sanitize primeiro
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## 🔑 Gestão de Secrets e Credenciais

### ✅ Nunca Commitar .env

**Configuração do .gitignore:**
```gitignore
# Environment variables
.env
.env.local
.env.production
.env.*.local

# Logs
logs/
*.log

# Sensitive files
*.pem
*.key
*.cert
```

**Verificar se .env foi commitado:**
```bash
git log --all --full-history -- .env
```

**Se .env foi commitado acidentalmente:**
```bash
# Remover do histórico (CUIDADO!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordene com equipe!)
git push origin --force --all
```

---

### ✅ Usar Variáveis de Ambiente

**Boas práticas:**
- ✅ Use `.env` para desenvolvimento
- ✅ Use variáveis de ambiente do sistema em produção
- ✅ Nunca hardcode secrets no código
- ✅ Use diferentes secrets para dev/staging/prod

**Exemplo:**
```typescript
// ❌ ERRADO
const apiKey = 'sk-1234567890abcdef';

// ✅ CORRETO
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY not configured');
}
```

---

### ✅ Rotação de Tokens

**Política recomendada:**
- 🔄 Tokens de API: Rotacionar a cada 90 dias
- 🔄 Senhas de banco: Rotacionar a cada 180 dias
- 🔄 JWT Secret: Rotacionar anualmente
- 🔄 OAuth Secrets: Rotacionar quando comprometidos

**Processo de rotação:**
1. Gerar novo token/secret
2. Adicionar ao sistema (suportar ambos temporariamente)
3. Atualizar clientes para usar novo token
4. Remover token antigo após período de transição
5. Documentar a rotação

---

## 🔐 Autenticação e Autorização

### ✅ Implementar Role-Based Access Control (RBAC)

**Schema atual:**
```typescript
// drizzle/schema.ts
export const users = mysqlTable("users", {
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
});
```

**Middleware de autorização:**
```typescript
// server/_core/trpc.ts
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});
```

**Uso:**
```typescript
// ✅ Endpoint protegido para admins
debugEnv: adminProcedure.query(() => {
  return process.env;
}),
```

---

### ✅ Proteger Rotas Sensíveis

**Níveis de proteção:**

1. **Público** - Sem autenticação
```typescript
publicProcedure.query(() => { ... })
```

2. **Autenticado** - Requer login
```typescript
protectedProcedure.query(({ ctx }) => {
  // ctx.user está disponível
})
```

3. **Admin** - Requer role admin
```typescript
adminProcedure.query(({ ctx }) => {
  // ctx.user.role === 'admin'
})
```

---

## 🛡️ Proteção de Dados

### ✅ Criptografar Dados Sensíveis

**Dados em trânsito:**
- ✅ Use HTTPS em produção (SSL/TLS)
- ✅ Configure certificados válidos
- ✅ Force HTTPS redirect

**Dados em repouso:**
```typescript
import crypto from 'crypto';

// Criptografar
function encrypt(text: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Descriptografar
function decrypt(text: string, key: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

---

### ✅ Hash de Senhas

**Nunca armazene senhas em texto plano!**

```typescript
import bcrypt from 'bcrypt';

// Hash password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

---

## 🔌 Segurança de API

### ✅ Rate Limiting

**Implementar rate limiting para prevenir abuso:**

```typescript
// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições por IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar em rotas específicas
app.use('/api/', apiLimiter);
```

**Rate limits recomendados:**
- Login: 5 tentativas por 15 minutos
- API geral: 100 requisições por 15 minutos
- Endpoints públicos: 30 requisições por minuto

---

### ✅ Validação de Origem (CORS)

**Configurar CORS restritivo:**

```typescript
// server/_core/index.ts
import cors from 'cors';

const allowedOrigins = [
  'https://dashboard.grupoblue.com.br',
  'https://app.grupoblue.com.br',
];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Permitir cookies
}));
```

---

### ✅ Timeout de Requisições

**Prevenir requisições longas:**

```typescript
// server/_core/index.ts
import timeout from 'connect-timeout';

app.use(timeout('30s')); // 30 segundos

app.use((req, res, next) => {
  if (!req.timedout) next();
});
```

---

## 🐛 Endpoints de Debug

### ✅ Desabilitar em Produção

**Endpoints de debug identificados:**
- `debugEnv` - Expõe variáveis de ambiente
- `debugTikTokData` - Expõe dados do TikTok
- `metricoolBrands` - Expõe dados do Metricool

**Proteção implementada:**
```typescript
// ✅ Protegido com adminProcedure
debugEnv: adminProcedure.query(() => {
  return process.env;
}),
```

**Checklist:**
- ✅ Todos os endpoints de debug usam `adminProcedure`
- ✅ Logs não expõem dados sensíveis
- ✅ Erros não revelam stack traces em produção

---

### ✅ Proteger com Middleware

**Adicionar flag de debug:**

```typescript
// server/_core/env.ts
export const ENV = {
  enableDebug: process.env.ENABLE_DEBUG === 'true',
};

// server/routers.ts
debugEnv: protectedProcedure.query(({ ctx }) => {
  if (!ENV.enableDebug || ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return process.env;
}),
```

---

## 🔍 Anonimização de Dados

### ✅ Logs

**Implementado no logger:**
```typescript
// server/utils/logger.ts
function maskSensitiveData(value: any): any {
  // Mask tokens
  masked = masked.replace(/([Tt]oken[:\s=]+)([A-Za-z0-9_-]{4})[A-Za-z0-9_-]+/g, '$1$2...');
  
  // Mask email addresses
  masked = masked.replace(/\b([a-zA-Z0-9]{1,2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, '$1***@$2');
  
  // Mask passwords
  masked = masked.replace(/([Pp]assword[:\s=]+)([^\s,}]+)/g, '$1***');
}
```

**Exemplo:**
```
❌ ANTES: User logged in: john.doe@example.com with token sk-1234567890abcdef
✅ DEPOIS: User logged in: jo***@example.com with token sk-1...
```

---

### ✅ Analytics

**Anonimizar dados de usuários:**

```typescript
// Não enviar dados identificáveis
analytics.track({
  event: 'page_view',
  // ❌ userId: user.email,
  // ✅ userId: hash(user.email),
  userId: crypto.createHash('sha256').update(user.email).digest('hex'),
  page: '/dashboard',
});
```

---

### ✅ Relatórios

**Agregar dados antes de exportar:**

```typescript
// ❌ Exportar dados individuais
const users = await db.select().from(users);

// ✅ Exportar dados agregados
const stats = await db
  .select({
    date: users.createdAt,
    count: sql`COUNT(*)`,
  })
  .from(users)
  .groupBy(users.createdAt);
```

---

## 🌐 CORS e CSP

### ✅ Content Security Policy (CSP)

**Implementar CSP headers:**

```typescript
// server/_core/index.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.example.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
```

---

### ✅ Outros Headers de Segurança

```typescript
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny', // Prevenir clickjacking
  },
  noSniff: true, // X-Content-Type-Options
  xssFilter: true, // X-XSS-Protection
}));
```

---

## ⏱️ Rate Limiting

### ✅ Implementar por Endpoint

**Diferentes limites para diferentes endpoints:**

```typescript
// Login - Mais restritivo
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
});

// API geral
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Endpoints públicos
const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
});
```

---

### ✅ Rate Limiting por Usuário

```typescript
// Rate limit baseado em user ID
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});
```

---

## 💾 Backup e Recovery

### ✅ Backup Automático do Banco

**Script de backup:**

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
DB_NAME="kpi_dashboard"

mkdir -p $BACKUP_DIR

mysqldump -u root -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**Agendar com cron:**
```bash
# Backup diário às 2h da manhã
0 2 * * * /path/to/backup-db.sh
```

---

### ✅ Backup de Arquivos

```bash
#!/bin/bash
# backup-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/files"
APP_DIR="/var/www/kpi-dashboard"

mkdir -p $BACKUP_DIR

tar -czf $BACKUP_DIR/files_$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='logs' \
  $APP_DIR

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +7 -delete
```

---

### ✅ Testar Recovery

**Procedimento de teste mensal:**

1. Restaurar backup em ambiente de teste
2. Verificar integridade dos dados
3. Testar funcionalidades críticas
4. Documentar tempo de recovery

---

## 🔍 Auditoria de Segurança

### ✅ Checklist de Auditoria Mensal

- [ ] Revisar logs de erro
- [ ] Verificar tentativas de login falhadas
- [ ] Analisar padrões de tráfego anormal
- [ ] Verificar certificados SSL (expiração)
- [ ] Revisar permissões de usuários
- [ ] Verificar atualizações de dependências
- [ ] Testar backups
- [ ] Revisar configurações de segurança

---

### ✅ Ferramentas de Auditoria

**Scan de vulnerabilidades:**
```bash
# npm audit
pnpm audit

# Corrigir vulnerabilidades
pnpm audit fix
```

**Scan de secrets:**
```bash
# Instalar gitleaks
brew install gitleaks

# Scan do repositório
gitleaks detect --source . --verbose
```

**Scan de dependências:**
```bash
# Snyk
npx snyk test
```

---

## ✅ Checklist Final

### Desenvolvimento

- [ ] `.env` está no `.gitignore`
- [ ] Variáveis de ambiente estão documentadas
- [ ] Validação de inputs implementada
- [ ] Logs não expõem dados sensíveis
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado

### Autenticação

- [ ] Cookies são httpOnly
- [ ] Cookies são secure em produção
- [ ] sameSite configurado como 'strict'
- [ ] JWT secret é forte e único
- [ ] Tokens expiram adequadamente
- [ ] RBAC implementado

### API

- [ ] Endpoints de debug protegidos
- [ ] Rate limiting por endpoint
- [ ] Validação de origem (CORS)
- [ ] Timeout de requisições
- [ ] Headers de segurança (Helmet)

### Dados

- [ ] Senhas são hasheadas (bcrypt)
- [ ] Dados sensíveis são criptografados
- [ ] Logs são anonimizados
- [ ] Backup automático configurado
- [ ] Recovery testado

### Produção

- [ ] HTTPS configurado
- [ ] Certificado SSL válido
- [ ] Firewall configurado
- [ ] Monitoramento ativo
- [ ] Alertas configurados
- [ ] Logs centralizados

### Compliance

- [ ] LGPD compliance
- [ ] Política de privacidade
- [ ] Termos de uso
- [ ] Consentimento de cookies
- [ ] Direito ao esquecimento

---

## 🚨 Resposta a Incidentes

### Procedimento em Caso de Breach

1. **Contenção**
   - Isolar sistemas afetados
   - Bloquear acesso não autorizado
   - Preservar evidências

2. **Investigação**
   - Analisar logs
   - Identificar vetor de ataque
   - Avaliar extensão do dano

3. **Erradicação**
   - Remover malware/backdoors
   - Fechar vulnerabilidades
   - Rotacionar credenciais

4. **Recuperação**
   - Restaurar de backups
   - Verificar integridade
   - Retomar operações

5. **Pós-Incidente**
   - Documentar incidente
   - Notificar partes afetadas
   - Implementar melhorias

---

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Última atualização:** 28 de novembro de 2025

**Próxima revisão:** 28 de dezembro de 2025
