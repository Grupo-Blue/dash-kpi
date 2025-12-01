#!/bin/bash

# ============================================
# Script de Deploy para Produção
# Dashboard KPIs - Grupo Blue
# ============================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy para produção..."

# Configurações
SERVER_IP="84.247.191.105"
SERVER_USER="root"
PROJECT_DIR="/root/dash-kpi"

echo "📦 Fazendo backup do servidor..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_DIR && cp -r . ../dash-kpi-backup-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || true"

echo "📥 Atualizando código do GitHub..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_DIR && git pull origin main"

echo "📝 Configurando variáveis de ambiente..."
# Criar arquivo .env no servidor com as variáveis necessárias
ssh $SERVER_USER@$SERVER_IP "cat > $PROJECT_DIR/.env << 'EOF'
# Core
JWT_SECRET=${JWT_SECRET}
DATABASE_URL=${DATABASE_URL}

# Integrações
PIPEDRIVE_API_TOKEN=${PIPEDRIVE_API_TOKEN}
DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
DISCORD_GUILD_ID=${DISCORD_GUILD_ID}
METRICOOL_API_TOKEN=${METRICOOL_API_TOKEN:-}
METRICOOL_USER_ID=${METRICOOL_USER_ID:-}
CADEMI_API_KEY=${CADEMI_API_KEY}
NIBO_API_TOKEN=${NIBO_API_TOKEN}

# Mautic
MAUTIC_BASE_URL=${MAUTIC_BASE_URL}
MAUTIC_CLIENT_ID=${MAUTIC_CLIENT_ID}
MAUTIC_CLIENT_SECRET=${MAUTIC_CLIENT_SECRET}
MAUTIC_USERNAME=${MAUTIC_USERNAME:-}
MAUTIC_PASSWORD=${MAUTIC_PASSWORD:-}
MAUTIC_REDIRECT_URI=${MAUTIC_REDIRECT_URI:-}

# Frontend
VITE_APP_TITLE=\"${VITE_APP_TITLE}\"
VITE_APP_LOGO=${VITE_APP_LOGO:-}

# Ambiente
NODE_ENV=production
EOF"

echo "📦 Instalando dependências..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_DIR && npm install --legacy-peer-deps"

echo "🔨 Fazendo build..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_DIR && npm run build"

echo "🔄 Reiniciando aplicação..."
ssh $SERVER_USER@$SERVER_IP "pm2 restart kpi-dashboard"

echo "✅ Deploy concluído!"
echo "📊 Verificando status..."
ssh $SERVER_USER@$SERVER_IP "pm2 list && pm2 logs kpi-dashboard --lines 10 --nostream"

echo ""
echo "🎉 Deploy finalizado com sucesso!"
echo "🌐 Acesse: http://$SERVER_IP:3000"
