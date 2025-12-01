# 🚀 Guia de Deploy - KPI Dashboard

## Variáveis de Ambiente Necessárias

### ✅ Variáveis Obrigatórias

- `JWT_SECRET` - Token de segurança para sessões (mínimo 32 caracteres)
- `DATABASE_URL` - Conexão com banco de dados MySQL/TiDB

### 📊 Variáveis de Integrações (Opcionais)

Cada integração pode ser configurada conforme necessário:

- `PIPEDRIVE_API_TOKEN` - API do Pipedrive (CRM)
- `DISCORD_BOT_TOKEN` - Bot do Discord
- `DISCORD_GUILD_ID` - ID do servidor Discord
- `CADEMI_API_KEY` - API da Cademi (cursos)
- `NIBO_API_TOKEN` - API do Nibo (financeiro)
- `MAUTIC_BASE_URL` - URL do Mautic
- `MAUTIC_CLIENT_ID` - Client ID do Mautic
- `MAUTIC_CLIENT_SECRET` - Client Secret do Mautic
- `METRICOOL_API_TOKEN` - Token da API Metricool
- `METRICOOL_USER_ID` - User ID do Metricool
- `YOUTUBE_API_KEY` - API Key do YouTube

### 🎨 Variáveis de Configuração (Opcionais)

- `VITE_APP_TITLE` - Título da aplicação (padrão: "Dashboard de KPIs")
- `VITE_APP_LOGO` - URL do logo da aplicação
- `VITE_ANALYTICS_WEBSITE_ID` - ID do site para analytics
- `VITE_ANALYTICS_ENDPOINT` - Endpoint do analytics

## Deploy Automático

### Opção 1: Usar Script de Deploy (Recomendado)

```bash
# No servidor de produção, execute:
cd /root/dash-kpi
./deploy-to-production.sh
```

Este script irá:
1. Fazer backup do código atual no servidor
2. Atualizar código do GitHub
3. Instalar dependências com pnpm
4. Fazer build
5. Reiniciar aplicação com PM2

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

# 5. Verificar .env
nano .env
# Certifique-se de que JWT_SECRET e DATABASE_URL estão configurados

# 6. Instalar dependências
pnpm install

# 7. Build
pnpm build

# 8. Reiniciar
pm2 restart kpi-dashboard

# 9. Verificar logs
pm2 logs kpi-dashboard
```

## Primeiro Deploy (Configuração Inicial)

### 1. Configurar Banco de Dados

```bash
# Aplicar schema do banco
pnpm db:push
```

### 2. Criar Usuário Admin

Execute o script para criar o primeiro usuário administrador:

```bash
node scripts/create-admin.js
```

Ou insira manualmente no banco:

```sql
INSERT INTO users (openId, email, name, password, role, lastSignedIn)
VALUES (
  'admin-001',
  'admin@grupoblue.com.br',
  'Admin',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt para gerar o hash
  'admin',
  NOW()
);
```

### 3. Configurar PM2 para Auto-start

```bash
pm2 startup
pm2 save
```

## Verificação Pós-Deploy

```bash
# Verificar status da aplicação
pm2 list

# Ver logs em tempo real
pm2 logs kpi-dashboard

# Verificar se está respondendo
curl http://localhost:3000/api/trpc/system.health

# Verificar firewall
sudo ufw status
```

## Troubleshooting

### Erro: "Missing required environment variables"

**Solução:** Verifique se o arquivo `.env` existe e contém JWT_SECRET e DATABASE_URL:

```bash
cd /root/dash-kpi
cat .env | grep -E "JWT_SECRET|DATABASE_URL"
```

### Erro: "Database not available"

**Solução:** Verifique a conexão com o banco de dados:

```bash
# Testar conexão MySQL
mysql -h HOST -u USER -p DATABASE_NAME
```

### Erro: "Invalid credentials" no login

**Solução:** Verifique se o usuário admin foi criado corretamente:

```sql
SELECT id, email, role FROM users WHERE role = 'admin';
```

### Aplicação crashando constantemente

**Solução:** Ver logs detalhados:

```bash
pm2 logs kpi-dashboard --lines 100
```

### Erro de dependências no build

**Solução:** Limpar cache e reinstalar:

```bash
rm -rf node_modules package-lock.json
pnpm install
pnpm build
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

## Segurança

### Checklist de Segurança

- [ ] Firewall ativado (ufw) com apenas portas 22, 80, 443 abertas
- [ ] Certificado SSL configurado (Let's Encrypt)
- [ ] JWT_SECRET com pelo menos 32 caracteres aleatórios
- [ ] Arquivo .env com permissões restritas (chmod 600)
- [ ] PM2 configurado para reiniciar automaticamente
- [ ] Backups automáticos configurados
- [ ] Atualizações de segurança do sistema aplicadas

### Comandos de Segurança

```bash
# Ativar firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Restringir permissões do .env
chmod 600 /root/dash-kpi/.env

# Aplicar atualizações de segurança
sudo apt update && sudo apt upgrade -y
```

## Monitoramento

### Logs

```bash
# Logs da aplicação
pm2 logs kpi-dashboard

# Logs do Apache
tail -f /var/log/apache2/kpi-dashboard-error.log

# Logs do sistema
journalctl -u pm2-root -f
```

### Performance

```bash
# Status do PM2
pm2 status

# Uso de recursos
pm2 monit

# Informações detalhadas
pm2 info kpi-dashboard
```

## Contato

Em caso de problemas, verifique:
1. Logs do PM2: `pm2 logs kpi-dashboard`
2. Status das integrações: Acesse `/admin` no dashboard
3. Documentação completa: `README.md`
