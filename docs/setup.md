# 🚀 Guia de Configuração - Dashboard de KPIs Grupo Blue

Este guia fornece instruções detalhadas para configurar e executar o Dashboard de KPIs em ambiente de desenvolvimento e produção.

---

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação](#instalação)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Obtenção de Chaves de API](#obtenção-de-chaves-de-api)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Execução em Desenvolvimento](#execução-em-desenvolvimento)
7. [Build de Produção](#build-de-produção)
8. [Deploy](#deploy)
9. [Políticas de Cookies](#políticas-de-cookies)
10. [Requisitos de Domínio](#requisitos-de-domínio)
11. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos do Sistema

### Software Necessário

- **Node.js**: versão 22.x ou superior
- **pnpm**: versão 10.x ou superior
- **MySQL**: versão 8.0 ou superior (ou TiDB compatível)
- **Git**: para controle de versão

### Instalação do pnpm

```bash
npm install -g pnpm
```

---

## 🔧 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/Grupo-Blue/dash-kpi.git
cd dash-kpi
```

### 2. Instalar Dependências

```bash
pnpm install
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### Variáveis Essenciais

```env
# Database
DATABASE_URL=mysql://usuario:senha@host:3306/nome_do_banco

# Authentication
JWT_SECRET=sua-chave-secreta-jwt-muito-segura-aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=seu-app-id-manus
OWNER_OPEN_ID=seu-open-id-manus
OWNER_NAME=Seu Nome

# Application
VITE_APP_TITLE=Dashboard de KPIs - Grupo Blue
VITE_APP_LOGO=https://example.com/logo.png
NODE_ENV=development
LOG_LEVEL=info
```

### Variáveis de Integração (Opcionais)

```env
# Metricool
METRICOOL_API_TOKEN=seu-token-metricool

# Pipedrive
PIPEDRIVE_API_TOKEN=seu-token-pipedrive

# Nibo
NIBO_API_TOKEN=seu-token-nibo

# Mautic
MAUTIC_BASE_URL=https://mautic.grupoblue.com.br/api
MAUTIC_USERNAME=seu-usuario-mautic
MAUTIC_PASSWORD=sua-senha-mautic
MAUTIC_CLIENT_ID=seu-client-id-mautic
MAUTIC_CLIENT_SECRET=seu-client-secret-mautic
# OU
MAUTIC_ACCESS_TOKEN=seu-token-de-acesso-mautic

# Tokeniza
TOKENIZA_API_URL=https://api.tokeniza.com.br/v1
TOKENIZA_API_TOKEN=seu-token-tokeniza

# Tokeniza Academy
TOKENIZA_ACADEMY_API_URL=https://academy.tokeniza.com.br/api/v1
TOKENIZA_ACADEMY_API_TOKEN=seu-token-tokeniza-academy

# Discord
DISCORD_BOT_TOKEN=seu-bot-token-discord
DISCORD_GUILD_ID=id-do-servidor-discord

# Cademi
CADEMI_API_KEY=sua-chave-api-cademi
```

---

## 🔑 Obtenção de Chaves de API

### Metricool

1. Acesse [https://app.metricool.com](https://app.metricool.com)
2. Faça login na sua conta
3. Vá em **Configurações** → **API**
4. Gere um novo token de API
5. Copie o token e adicione em `METRICOOL_API_TOKEN`

**Nota:** Você também precisará do `userId` que pode ser obtido na mesma página.

---

### Pipedrive

1. Acesse [https://app.pipedrive.com](https://app.pipedrive.com)
2. Faça login na sua conta
3. Clique no seu avatar (canto superior direito)
4. Vá em **Configurações** → **Pessoal** → **API**
5. Copie o token de API pessoal
6. Adicione em `PIPEDRIVE_API_TOKEN`

**Documentação:** [https://developers.pipedrive.com/docs/api/v1](https://developers.pipedrive.com/docs/api/v1)

---

### Nibo

1. Entre em contato com o suporte da Nibo
2. Solicite acesso à API
3. Aguarde aprovação e receba suas credenciais
4. Adicione o token em `NIBO_API_TOKEN`

**Documentação:** [https://developers.nibo.com.br](https://developers.nibo.com.br)

---

### Mautic

#### Opção 1: OAuth2 (Recomendado)

1. Acesse sua instância Mautic: `https://mautic.grupoblue.com.br`
2. Faça login como administrador
3. Vá em **Configurações** → **API Credentials**
4. Clique em **New**
5. Preencha:
   - **Name:** Dashboard KPIs
   - **Redirect URI:** `http://localhost:3000/api/oauth/mautic/callback`
   - **Public Key:** (deixe em branco para OAuth2)
6. Salve e copie:
   - `Client ID` → `MAUTIC_CLIENT_ID`
   - `Client Secret` → `MAUTIC_CLIENT_SECRET`
7. Adicione também:
   - `MAUTIC_USERNAME`: seu usuário Mautic
   - `MAUTIC_PASSWORD`: sua senha Mautic

#### Opção 2: Access Token Direto

1. Gere um token de acesso na interface do Mautic
2. Adicione em `MAUTIC_ACCESS_TOKEN`

**Documentação:** [https://developer.mautic.org](https://developer.mautic.org)

---

### Tokeniza

1. Entre em contato com a equipe Tokeniza
2. Solicite acesso à API
3. Receba seu token de autenticação
4. Adicione em `TOKENIZA_API_TOKEN`

---

### Tokeniza Academy

1. Acesse o painel administrativo da Tokeniza Academy
2. Vá em **Configurações** → **API**
3. Gere um novo token
4. Adicione em `TOKENIZA_ACADEMY_API_TOKEN`

---

### Discord

1. Acesse [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Clique em **New Application**
3. Dê um nome (ex: "KPI Dashboard Bot")
4. Vá em **Bot** (menu lateral)
5. Clique em **Add Bot**
6. Em **Token**, clique em **Copy**
7. Adicione em `DISCORD_BOT_TOKEN`
8. Vá em **OAuth2** → **URL Generator**
9. Selecione scopes: `bot`, `applications.commands`
10. Selecione permissões: `Read Messages/View Channels`, `Read Message History`
11. Copie a URL gerada e acesse no navegador
12. Adicione o bot ao seu servidor Discord
13. Copie o ID do servidor (clique com botão direito no servidor → Copy ID)
14. Adicione em `DISCORD_GUILD_ID`

**Nota:** Você precisa ativar o "Developer Mode" no Discord para copiar IDs.

**Documentação:** [https://discord.com/developers/docs](https://discord.com/developers/docs)

---

### Cademi

1. Entre em contato com o suporte da Cademi
2. Solicite acesso à API
3. Receba sua chave de API
4. Adicione em `CADEMI_API_KEY`

---

## 🗄️ Configuração do Banco de Dados

### 1. Criar Banco de Dados

```sql
CREATE DATABASE kpi_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar URL de Conexão

Adicione a URL de conexão no `.env`:

```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/kpi_dashboard
```

**Formato:**
```
mysql://[usuario]:[senha]@[host]:[porta]/[nome_do_banco]
```

### 3. Executar Migrações

```bash
pnpm db:push
```

Este comando irá:
- Criar todas as tabelas necessárias
- Aplicar o schema definido em `drizzle/schema.ts`

### 4. Verificar Tabelas Criadas

```sql
USE kpi_dashboard;
SHOW TABLES;
```

Você deverá ver tabelas como:
- `users`
- `companies`
- `kpi_snapshots`
- `social_media_metrics`
- `tiktok_metrics`
- `lead_journey_searches`
- `lead_journey_cache`
- `api_status`

---

## 🚀 Execução em Desenvolvimento

### 1. Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3000/api

### 2. Logs

Os logs serão exibidos no console em formato colorizado e legível.

Para ajustar o nível de log:

```env
LOG_LEVEL=debug  # debug, info, warn, error
```

---

## 📦 Build de Produção

### 1. Criar Build

```bash
pnpm build
```

Este comando irá:
- Compilar o TypeScript do servidor
- Fazer build do frontend com Vite
- Gerar arquivos otimizados em `dist/`

### 2. Verificar Build

```bash
ls -lh dist/
```

Você deverá ver:
- `index.js` - Servidor compilado
- `public/` - Assets estáticos do frontend

### 3. Testar Build Localmente

```bash
NODE_ENV=production node dist/index.js
```

---

## 🌐 Deploy

### Opção 1: Deploy Manual (VPS/Servidor Dedicado)

#### 1. Preparar Servidor

```bash
# Instalar Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (gerenciador de processos)
npm install -g pm2
```

#### 2. Clonar e Configurar

```bash
git clone https://github.com/Grupo-Blue/dash-kpi.git
cd dash-kpi
pnpm install
```

#### 3. Configurar Variáveis de Ambiente

```bash
nano .env
# Cole as variáveis de produção
```

#### 4. Fazer Build

```bash
pnpm build
```

#### 5. Iniciar com PM2

```bash
pm2 start dist/index.js --name kpi-dashboard
pm2 save
pm2 startup
```

#### 6. Configurar Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name dashboard.grupoblue.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 7. Configurar SSL com Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.grupoblue.com.br
```

---

### Opção 2: Deploy com Docker

#### 1. Criar Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### 2. Criar docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: kpi_dashboard
      MYSQL_USER: kpi_user
      MYSQL_PASSWORD: kpi_password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

#### 3. Executar

```bash
docker-compose up -d
```

---

## 🍪 Políticas de Cookies

O sistema utiliza cookies HTTP-only para autenticação. As políticas de cookies são configuradas em `server/_core/cookies.ts`.

### Configurações de Segurança

```typescript
{
  httpOnly: true,        // Não acessível via JavaScript
  secure: true,          // Apenas HTTPS em produção
  sameSite: 'strict',    // Proteção contra CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  domain: '.grupoblue.com.br', // Domínio explícito
}
```

### Importante

- **Produção:** Cookies só funcionam em HTTPS
- **Desenvolvimento:** Cookies funcionam em HTTP (localhost)
- **Domínio:** Configure o domínio correto em produção

---

## 🌐 Requisitos de Domínio

### Desenvolvimento

- **URL:** http://localhost:3000
- **Cookies:** Funcionam normalmente

### Produção

- **URL:** https://dashboard.grupoblue.com.br (ou seu domínio)
- **SSL/TLS:** Obrigatório (HTTPS)
- **Domínio:** Configure em `server/_core/cookies.ts`

### Subdomínios

Se você usar subdomínios (ex: `app.grupoblue.com.br`, `api.grupoblue.com.br`):

1. Configure o cookie domain como `.grupoblue.com.br` (com ponto inicial)
2. Isso permite compartilhar cookies entre subdomínios

---

## 🔧 Troubleshooting

### Problema: "Database not available"

**Causa:** Banco de dados não está acessível

**Solução:**
1. Verifique se o MySQL está rodando: `sudo systemctl status mysql`
2. Verifique a `DATABASE_URL` no `.env`
3. Teste a conexão: `mysql -h host -u usuario -p`

---

### Problema: "Port 3000 is already in use"

**Causa:** Porta 3000 já está sendo usada

**Solução:**
1. Encontre o processo: `lsof -i :3000`
2. Mate o processo: `kill -9 <PID>`
3. Ou use outra porta: `PORT=3001 pnpm dev`

---

### Problema: Cookies não funcionam

**Causa:** Configuração incorreta de domínio ou HTTPS

**Solução:**
1. **Desenvolvimento:** Use http://localhost:3000 (não 127.0.0.1)
2. **Produção:** Certifique-se de usar HTTPS
3. Verifique o domínio em `server/_core/cookies.ts`

---

### Problema: "Module not found"

**Causa:** Dependências não instaladas

**Solução:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### Problema: Erros de TypeScript

**Causa:** Tipos incompatíveis ou faltando

**Solução:**
```bash
pnpm exec tsc --noEmit
```

Corrija os erros apontados.

---

### Problema: Build falha

**Causa:** Erros de compilação ou falta de memória

**Solução:**
1. Verifique erros: `pnpm build 2>&1 | tee build.log`
2. Aumente memória Node.js: `NODE_OPTIONS="--max-old-space-size=4096" pnpm build`

---

### Problema: APIs retornam erro 401/403

**Causa:** Tokens inválidos ou expirados

**Solução:**
1. Verifique se os tokens estão corretos no `.env`
2. Gere novos tokens nas respectivas plataformas
3. Verifique logs: `tail -f logs/error-*.log`

---

### Problema: Logs não são gerados

**Causa:** Diretório de logs não existe ou sem permissão

**Solução:**
```bash
mkdir -p logs
chmod 755 logs
```

---

## 📚 Recursos Adicionais

- **Documentação de Segurança:** [docs/security.md](./security.md)
- **Guia de Testes:** [docs/testing.md](./testing.md)
- **Relatórios de Sprint:** [docs/sprint*_final_report.md](./sprint1_final_report.md)

---

## 💡 Dicas

1. **Use variáveis de ambiente separadas** para desenvolvimento e produção
2. **Nunca commite o arquivo `.env`** no Git
3. **Faça backup do banco de dados** regularmente
4. **Monitore os logs** em produção
5. **Configure alertas** para erros críticos
6. **Teste localmente** antes de fazer deploy
7. **Use PM2** para gerenciar processos em produção
8. **Configure SSL/TLS** com Let's Encrypt (gratuito)

---

## 🆘 Suporte

Se você encontrar problemas não listados aqui:

1. Verifique os logs: `tail -f logs/combined-*.log`
2. Consulte a documentação das APIs integradas
3. Abra uma issue no GitHub
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização:** 28 de novembro de 2025
