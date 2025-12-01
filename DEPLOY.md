# 🚀 Guia de Deploy - KPI Dashboard

## Variáveis de Ambiente Necessárias

### ✅ Já Configuradas no Ambiente Manus

Todas as variáveis abaixo já estão configuradas no ambiente Manus e serão copiadas automaticamente para produção:

- `JWT_SECRET` - Token de segurança para sessões
- `DATABASE_URL` - Conexão com banco de dados
- `PIPEDRIVE_API_TOKEN` - API do Pipedrive (CRM)
- `DISCORD_BOT_TOKEN` - Bot do Discord
- `DISCORD_GUILD_ID` - ID do servidor Discord
- `CADEMI_API_KEY` - API da Cademi (cursos)
- `NIBO_API_TOKEN` - API do Nibo (financeiro)
- `MAUTIC_*` - Configurações do Mautic (marketing)
- `VITE_APP_TITLE` - Título da aplicação

### ❌ Variáveis Removidas (não são mais obrigatórias)

As seguintes variáveis eram do sistema OAuth da Manus e foram tornadas opcionais:
- `OAUTH_SERVER_URL`
- `VITE_APP_ID`
- `OWNER_OPEN_ID`

## Deploy Automático

### Opção 1: Usar Script de Deploy (Recomendado)

```bash
# No ambiente Manus, execute:
cd /home/ubuntu/kpi-dashboard
./deploy-to-production.sh
```

Este script irá:
1. Fazer backup do código atual no servidor
2. Atualizar código do GitHub
3. Configurar variáveis de ambiente
4. Instalar dependências
5. Fazer build
6. Reiniciar aplicação com PM2

### Opção 2: Deploy Manual

```bash
# 1. Conectar ao servidor
ssh root@84.247.191.105

# 2. Navegar até o projeto
cd /root/dash-kpi

# 3. Fazer backup
cp -r . ../dash-kpi-backup-$(date +%Y%m%d-%H%M%S)

# 4. Atualizar código
git pull origin main

# 5. Configurar .env (copiar do ambiente Manus)
nano .env
# Cole as variáveis de ambiente

# 6. Instalar dependências
npm install --legacy-peer-deps

# 7. Build
npm run build

# 8. Reiniciar
pm2 restart kpi-dashboard

# 9. Verificar logs
pm2 logs kpi-dashboard
```

## Verificação Pós-Deploy

```bash
# Verificar status da aplicação
pm2 list

# Ver logs em tempo real
pm2 logs kpi-dashboard

# Verificar se está respondendo
curl http://localhost:3000/api/trpc/system.health
```

## Troubleshooting

### Erro: "Missing required environment variables"

**Solução:** Verifique se o arquivo `.env` existe e contém todas as variáveis necessárias:

```bash
cd /root/dash-kpi
cat .env
```

### Erro: "Database not available"

**Solução:** Verifique a conexão com o banco de dados:

```bash
# Testar conexão MySQL
mysql -h HOST -u USER -p DATABASE_NAME
```

### Aplicação crashando constantemente

**Solução:** Ver logs detalhados:

```bash
pm2 logs kpi-dashboard --lines 100
```

## Rollback

Se algo der errado, você pode voltar para o backup:

```bash
cd /root
rm -rf dash-kpi
cp -r dash-kpi-backup-YYYYMMDD-HHMMSS dash-kpi
cd dash-kpi
pm2 restart kpi-dashboard
```

## Contato

Em caso de problemas, verifique:
1. Logs do PM2: `pm2 logs kpi-dashboard`
2. Logs do sistema: `/root/logs/`
3. Status das integrações: Acesse `/admin` no dashboard
