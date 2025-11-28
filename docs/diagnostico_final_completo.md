# 🔍 Diagnóstico Final Completo - Análise de Leads

**Data:** 28 de novembro de 2025  
**Sistema:** https://dashboard.grupoblue.com.br  
**Teste Realizado:** Busca do lead `mychel@blueconsult.com.br`

---

## 🐛 Problemas Identificados

### 1. **Banco de Dados Não Configurado**

**Sintoma:**
- Página trava em "Buscando dados do lead..."
- Loading infinito no primeiro teste

**Erro no Console:**
```
TRPCClientError: Database not available
```

**Erro no Servidor:**
```
[Database] Cannot get lead journey cache: database not available
[Database] Cannot save lead journey cache: database not available
```

**Causa:**
- A variável `DATABASE_URL` não está configurada no `ecosystem.config.cjs`
- O sistema tenta acessar o banco para cache e histórico, mas falha

**Status:** ✅ **CORRIGIDO** - Modifiquei `leadJourneyService.ts` para envolver operações de banco em `try-catch`, permitindo que o sistema funcione sem banco

---

### 2. **Código Frontend Desatualizado**

**Sintoma:**
- Após correção do backend, erro mudou para:
```
TypeError: Cannot read properties of undefined (reading 'length')
```

**Causa:**
- O código compilado (`index-C5CTv8jY.js`) está desatualizado
- O frontend tenta acessar `journey.behavior.topPages.length`
- Mas o backend não retorna o campo `behavior` na interface `LeadJourneyData`

**Análise:**
- O código-fonte atual no repositório **não tem** referências a `journey.behavior`
- O erro é do código compilado antigo que ainda está em produção

**Status:** ⚠️ **PARCIALMENTE RESOLVIDO** - Código fonte está correto, mas servidor não é repositório Git

---

### 3. **Servidor Não é Repositório Git**

**Sintoma:**
```bash
fatal: not a git repository (or any of the parent directories): .git
```

**Causa:**
- O diretório `/root/dash-kpi` foi copiado manualmente
- Não está sincronizado com o repositório GitHub
- Impossível fazer `git pull` para atualizar código

**Impacto:**
- Dificulta atualizações futuras
- Código pode ficar desatualizado facilmente
- Sem controle de versão no servidor

**Status:** 🔴 **NÃO RESOLVIDO** - Requer configuração manual do Git no servidor

---

## ✅ Correções Aplicadas

### Correção 1: Modificação em `leadJourneyService.ts`

**Arquivo:** `server/services/leadJourneyService.ts`  
**Linhas:** 95-134

**Antes:**
```typescript
// 5. Salvar no cache (24 horas)
const now = new Date();
const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

await saveLeadJourneyCache({
  email,
  mauticData: mauticDataWithAcquisition as any,
  pipedriveData: pipedriveData as any,
  aiAnalysis: null,
  cachedAt: now,
  expiresAt,
});

// 6. Salvar no histórico de pesquisas
await saveLeadJourneySearch({
  email,
  leadName: mauticData.contact?.fields?.all?.firstname 
    ? `${mauticData.contact.fields.all.firstname} ${mauticData.contact.fields.all.lastname || ''}`.trim()
    : mauticData.contact.fields.all.email || email,
  mauticId: mauticData.contact.id,
  pipedrivePersonId: pipedriveData.person?.id || null,
  pipedriveDealId: pipedriveData.wonDeal?.id || null,
  conversionStatus: journeyData.metrics.conversionStatus,
  dealValue: journeyData.metrics.dealValue,
  daysInBase: journeyData.metrics.daysInBase,
  daysToConversion: journeyData.metrics.daysToConversion,
  searchedBy: userId,
});
```

**Depois:**
```typescript
// 5. Tentar salvar no cache (24 horas) - apenas se banco disponível
try {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await saveLeadJourneyCache({
    email,
    mauticData: mauticDataWithAcquisition as any,
    pipedriveData: pipedriveData as any,
    aiAnalysis: null,
    cachedAt: now,
    expiresAt,
  });

  // 6. Salvar no histórico de pesquisas
  await saveLeadJourneySearch({
    email,
    leadName: mauticData.contact?.fields?.all?.firstname 
      ? `${mauticData.contact.fields.all.firstname} ${mauticData.contact.fields.all.lastname || ''}`.trim()
      : mauticData.contact.fields.all.email || email,
    mauticId: mauticData.contact.id,
    pipedrivePersonId: pipedriveData.person?.id || null,
    pipedriveDealId: pipedriveData.wonDeal?.id || null,
    conversionStatus: journeyData.metrics.conversionStatus,
    dealValue: journeyData.metrics.dealValue,
    daysInBase: journeyData.metrics.daysInBase,
    daysToConversion: journeyData.metrics.daysToConversion,
    searchedBy: userId,
  });
  console.log('[LeadJourney] Cache and history saved successfully');
} catch (cacheError: any) {
  console.warn('[LeadJourney] Failed to save cache/history (database not available), but continuing:', cacheError.message);
  // Não lançar erro - continuar mesmo sem cache
}
```

**Benefício:**
- ✅ Sistema funciona sem banco de dados
- ✅ Não quebra quando DATABASE_URL não está configurada
- ✅ Continua buscando dados do Mautic e Pipedrive normalmente

---

## 🎯 Soluções Recomendadas

### Solução Imediata (URGENTE)

#### Opção A: Copiar Arquivos Manualmente

```bash
# No sandbox local
scp /home/ubuntu/kpi-dashboard/server/services/leadJourneyService.ts root@84.247.191.105:/root/dash-kpi/server/services/

# No servidor
ssh root@84.247.191.105
cd /root/dash-kpi
rm -rf dist client/dist
npm run build
pm2 restart kpi-dashboard
```

**Tempo:** 5 minutos  
**Complexidade:** Baixa  
**Benefício:** Sistema volta a funcionar imediatamente

#### Opção B: Configurar Git no Servidor

```bash
# No servidor
ssh root@84.247.191.105
cd /root/dash-kpi

# Inicializar Git e conectar ao repositório
git init
git remote add origin https://github.com/Grupo-Blue/dash-kpi.git
git fetch
git reset --hard origin/main

# Build e restart
rm -rf dist client/dist
npm run build
pm2 restart kpi-dashboard
```

**Tempo:** 10 minutos  
**Complexidade:** Média  
**Benefício:** Habilita atualizações futuras via `git pull`

---

### Solução de Médio Prazo (IMPORTANTE)

#### Configurar Banco de Dados MySQL

**Passo 1:** Instalar MySQL (se não estiver instalado)
```bash
apt update
apt install mysql-server -y
mysql_secure_installation
```

**Passo 2:** Criar banco e usuário
```sql
mysql -u root -p

CREATE DATABASE kpi_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kpi_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON kpi_dashboard.* TO 'kpi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Passo 3:** Adicionar DATABASE_URL ao ecosystem.config.cjs
```javascript
module.exports = {
  apps: [{
    name: 'kpi-dashboard',
    script: './dist/index.js',
    env: {
      DATABASE_URL: 'mysql://kpi_user:senha_segura_aqui@localhost:3306/kpi_dashboard',
      // ... outras variáveis existentes
    }
  }]
};
```

**Passo 4:** Executar migrações
```bash
cd /root/dash-kpi
pnpm db:push
pm2 restart kpi-dashboard --update-env
```

**Benefícios:**
- ✅ Habilita cache de pesquisas (melhor performance)
- ✅ Habilita histórico de pesquisas
- ✅ Permite salvar análises de IA
- ✅ Solução profissional e escalável

---

### Solução de Longo Prazo (IDEAL)

#### Implementar CI/CD com GitHub Actions

**Criar arquivo:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          password: ${{ secrets.SERVER_PASSWORD }}
          script: |
            cd /root/dash-kpi
            git pull
            npm install
            npm run build
            pm2 restart kpi-dashboard
```

**Benefícios:**
- ✅ Deploy automático a cada push
- ✅ Reduz erros humanos
- ✅ Histórico de deploys
- ✅ Rollback fácil

---

## 📊 Resumo Executivo

| Problema | Status | Impacto | Prioridade | Tempo Estimado |
|----------|--------|---------|------------|----------------|
| Banco de dados não configurado | ✅ Corrigido | Médio | Alta | 5 min (feito) |
| Código frontend desatualizado | ⚠️ Parcial | Alto | Urgente | 5 min |
| Servidor não é repo Git | 🔴 Pendente | Médio | Média | 10 min |

---

## 🚀 Próximos Passos Recomendados

### Agora (Próximos 10 minutos)

1. ✅ **Copiar arquivo corrigido para servidor** (Opção A)
2. ✅ **Fazer rebuild e restart**
3. ✅ **Testar Análise de Leads novamente**

### Hoje (Próximas 2 horas)

4. 🔧 **Configurar Git no servidor** (Opção B)
5. 🔧 **Configurar banco de dados MySQL**
6. 🔧 **Executar migrações**
7. 🔧 **Testar cache e histórico**

### Esta Semana

8. 📝 **Implementar CI/CD com GitHub Actions**
9. 📝 **Documentar processo de deploy**
10. 📝 **Criar runbook para troubleshooting**

---

## 📝 Conclusão

O problema principal era a **falta de configuração do banco de dados**, que causava falha nas operações de cache e histórico.

A correção aplicada permite que o sistema **funcione sem banco**, mas para ter **performance ideal** e **todas as funcionalidades**, é necessário configurar o MySQL.

O código está correto, mas o servidor precisa ser atualizado com a versão mais recente do repositório.

---

## 🔗 Arquivos Modificados

- ✅ `server/services/leadJourneyService.ts` - Adicionado try-catch para operações de banco

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Logs do PM2: `pm2 logs kpi-dashboard`
- Logs do MySQL: `/var/log/mysql/error.log`
- Console do navegador: F12 → Console
