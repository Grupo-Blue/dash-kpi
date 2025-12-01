# Dashboard de KPIs - Grupo Blue

Dashboard completo de KPIs integrando múltiplas fontes de dados (Pipedrive, Nibo, Discord, Metricool, Mautic) com análise por IA.

## 🚀 Funcionalidades

### Visão Geral
- **Faturamento Total** - Pipedrive (Blue Consult)
- **Seguidores Totais** - Metricool (todas as redes sociais)
- **Membros Discord** - Tokeniza Academy
- **Receitas e Despesas** - Nibo (Blue Consult)
- **Performance por Empresa** - Métricas consolidadas

### Páginas por Empresa
- **Blue Consult** - Pipedrive + Nibo + Metricool
- **Tokeniza** - Metricool
- **Tokeniza Academy** - Discord + Cademi + Metricool
- **Mychel Mendes** - Metricool

### Análise de Jornada de Leads (Mautic + Pipedrive + IA)
- Busca de leads por e-mail
- Timeline completa de atividades (e-mails, páginas, formulários, downloads)
- Cruzamento automático com Pipedrive (identificação de conversão)
- Análise por IA com insights e recomendações
- Histórico de pesquisas

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL 8 / TiDB (Drizzle ORM)
- **Auth**: Sistema próprio com JWT (email/senha)
- **IA**: LLM integration para análise de leads
- **APIs**: Pipedrive, Nibo, Discord, Metricool, Mautic, Cademi

## 📋 Pré-requisitos

- Node.js 20+ ou 22+
- PNPM 9+
- MySQL 8+ ou TiDB
- PM2 (para produção)

## 🔧 Instalação

### 1. Clonar repositório

```bash
git clone https://github.com/Grupo-Blue/dash-kpi.git
cd dash-kpi
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT
JWT_SECRET=sua-chave-secreta-jwt

# App Config
VITE_APP_TITLE=Dashboard de KPIs - Grupo Blue
VITE_APP_LOGO=/logo.png

# Pipedrive
PIPEDRIVE_API_TOKEN=seu-token-pipedrive

# Nibo
NIBO_API_TOKEN=seu-token-nibo

# Discord
DISCORD_BOT_TOKEN=seu-token-discord
DISCORD_GUILD_ID=seu-guild-id

# Metricool
METRICOOL_API_TOKEN=seu-token-metricool
METRICOOL_USER_ID=seu-user-id

# Mautic
MAUTIC_BASE_URL=https://mautic.grupoblue.com.br
MAUTIC_CLIENT_ID=seu-client-id
MAUTIC_CLIENT_SECRET=seu-client-secret

# Cademi
CADEMI_API_KEY=sua-api-key-cademi

# YouTube
YOUTUBE_API_KEY=sua-api-key-youtube

# Analytics (opcional)
VITE_ANALYTICS_WEBSITE_ID=seu-website-id
VITE_ANALYTICS_ENDPOINT=https://analytics.exemplo.com
```

### 4. Configurar banco de dados

```bash
# Aplicar migrações
pnpm db:push
```

### 5. Criar primeiro usuário admin

Após configurar o banco de dados, você precisa criar um usuário administrador diretamente no banco:

```sql
-- Substitua os valores conforme necessário
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

Ou use o script auxiliar:

```bash
node scripts/create-admin.js
```

### 6. Rodar em desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

## 🔐 Autenticação

O sistema usa autenticação própria baseada em email e senha:

1. Acesse `/login` para fazer login
2. Use as credenciais do usuário criado no passo 5
3. O sistema gera um JWT que é armazenado em cookie
4. Sessões duram 7 dias por padrão

## 🚀 Deploy em Produção

### 1. Build

```bash
pnpm build
```

### 2. Iniciar com PM2

```bash
pm2 start dist/index.js --name "kpi-dashboard"
pm2 save
pm2 startup
```

### 3. Configurar Nginx/Apache como proxy reverso

**Nginx:**

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

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

**Apache:**

```apache
<VirtualHost *:80>
    ServerName seu-dominio.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## 📊 Importação de Dados Históricos

Para popular o banco com dados históricos de KPIs:

1. Baixe a planilha modelo: `KPI_Import_Template.xlsx`
2. Preencha com seus dados históricos
3. Execute o script de importação:

```bash
python3 scripts/import_historical_data.py caminho/para/planilha.xlsx
```

Veja instruções detalhadas em `IMPORTACAO_HISTORICO.md`

## 📝 Estrutura do Projeto

```
├── client/              # Frontend React
│   ├── public/         # Assets estáticos
│   └── src/
│       ├── components/ # Componentes reutilizáveis
│       ├── pages/      # Páginas da aplicação
│       ├── hooks/      # Custom hooks
│       └── lib/        # Utilitários e configurações
├── server/             # Backend Express + tRPC
│   ├── _core/         # Infraestrutura (auth, context, etc)
│   ├── services/      # Integrações com APIs externas
│   ├── db/            # Queries e helpers do banco
│   ├── jobs/          # Jobs agendados (cron)
│   └── routers.ts     # Definição de endpoints tRPC
├── drizzle/           # Schema e migrações do banco
├── shared/            # Tipos e constantes compartilhadas
└── scripts/           # Scripts utilitários
```

## 🔐 Segurança

- Todas as credenciais devem estar em variáveis de ambiente (`.env`)
- NUNCA commite o arquivo `.env` no repositório
- Use JWT para autenticação de sessão
- APIs externas são chamadas apenas do backend
- Senhas são armazenadas com hash bcrypt

## 📈 Monitoramento

O dashboard inclui:
- **Status das Integrações** - Monitoramento em tempo real das APIs
- **Logs de erros** - Rastreamento de falhas nas integrações
- **Cache de dados** - Otimização de performance

## 🤝 Contribuindo

Este é um projeto privado do Grupo Blue. Para contribuir:

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Abra um Pull Request

## 📄 Licença

Propriedade do Grupo Blue. Todos os direitos reservados.

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
