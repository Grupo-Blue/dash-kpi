#!/bin/bash

# Script para aplicar a correção do cache de leads no servidor
# Execute este script no servidor de produção (84.247.191.105)

echo "=== Deploy da Correção do Cache de Leads ==="
echo ""

# Navegar para o diretório do projeto
cd /root/dash-kpi || { echo "Erro: Diretório /root/dash-kpi não encontrado"; exit 1; }

echo "✓ Diretório do projeto: $(pwd)"
echo ""

# Verificar se o arquivo dist/index.js existe
if [ ! -f "dist/index.js" ]; then
    echo "✗ Erro: dist/index.js não encontrado"
    echo "  Execute o rsync primeiro para fazer upload dos arquivos"
    exit 1
fi

echo "✓ Arquivo dist/index.js encontrado"
echo ""

# Encontrar PM2
PM2_PATH=$(which pm2 2>/dev/null)
if [ -z "$PM2_PATH" ]; then
    # Tentar caminhos comuns
    if [ -f "/usr/local/bin/pm2" ]; then
        PM2_PATH="/usr/local/bin/pm2"
    elif [ -f "$HOME/.nvm/versions/node/$(node -v)/bin/pm2" ]; then
        PM2_PATH="$HOME/.nvm/versions/node/$(node -v)/bin/pm2"
    elif [ -f "/usr/bin/pm2" ]; then
        PM2_PATH="/usr/bin/pm2"
    else
        echo "✗ Erro: PM2 não encontrado"
        echo "  Instale com: npm install -g pm2"
        exit 1
    fi
fi

echo "✓ PM2 encontrado em: $PM2_PATH"
echo ""

# Reiniciar aplicação
echo "Reiniciando aplicação..."
$PM2_PATH restart kpi-dashboard

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Aplicação reiniciada com sucesso!"
    echo ""
    echo "Verificando status..."
    $PM2_PATH status kpi-dashboard
    echo ""
    echo "Últimas 20 linhas do log:"
    $PM2_PATH logs kpi-dashboard --lines 20 --nostream
    echo ""
    echo "=== Deploy Concluído ==="
    echo ""
    echo "Teste a correção em: https://dashboard.grupoblue.com.br/lead-analysis"
    echo "Busque por: viniciusdeoa@gmail.com"
else
    echo ""
    echo "✗ Erro ao reiniciar aplicação"
    echo ""
    echo "Logs de erro:"
    $PM2_PATH logs kpi-dashboard --lines 50 --nostream --err
    exit 1
fi
