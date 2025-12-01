# Auditoria de Servidor e Análise de Sincronia do Projeto dash-kpi

**Autor:** Manus AI
**Data:** 01 de Dezembro de 2025

## 1. Introdução

Este documento apresenta uma auditoria completa do servidor de produção (IP: `84.247.191.105`) e uma análise comparativa entre o código em execução e o estado atual do repositório `Grupo-Blue/dash-kpi` no GitHub. O objetivo é identificar desalinhamentos, vulnerabilidades de infraestrutura e problemas de configuração que possam comprometer a estabilidade, segurança e manutenibilidade do sistema `dash-kpi`.

A análise foi dividida em duas frentes: a sincronia do código-fonte e a qualidade da infraestrutura do servidor.

## 2. Comparação do Código: Servidor vs. GitHub

A análise do diretório `/root/dash-kpi` no servidor revelou que, embora o código base venha do commit correto, existem modificações locais significativas e arquivos não rastreados que não foram sincronizados com o repositório central no GitHub.

### 2.1. Status de Sincronização do Git

- **Commit Base:** O servidor está no commit `f7eafd0` ("Checkpoint: Correções de Deploy em Produção"), que é o mais recente no branch `main` do GitHub. Isso confirma que a base do código está atualizada.
- **Status do Branch:** `On branch main. Your branch is up to date with 'origin/main'.`
- **Problema Principal:** Existem **modificações locais e arquivos não rastreados**, indicando que foram feitas alterações diretamente no servidor sem o devido versionamento.

### 2.2. Arquivos Modificados (Não Versionados)

Os seguintes arquivos foram alterados no servidor, mas as mudanças não foram enviadas (commit/push) para o GitHub. Isso cria uma divergência crítica entre o ambiente de produção e o código-fonte oficial.

| Arquivo Modificado | Análise da Mudança |
| :--- | :--- |
| `client/src/components/DashboardLayout.tsx` | Alterações visuais no layout principal, como gradientes e bordas. |
| `client/src/components/KpiCardWithTooltip.tsx` | Ajustes de estilo nos cards de KPI. |
| `client/src/const.ts` | Adição de novas constantes, provavelmente relacionadas a configurações de UI. |
| `client/src/index.css` | Modificações significativas no CSS global, incluindo novos gradientes e estilos. |
| `ecosystem.config.cjs` | Alterações no arquivo de configuração do PM2. |
| `vite.config.ts` | Mudanças na configuração de build do frontend (Vite). |

### 2.3. Arquivos Não Rastreáveis (Untracked)

Estes arquivos existem no servidor, mas não fazem parte do repositório Git. Alguns são artefatos de processos de deploy e outros são scripts manuais que deveriam ser versionados ou removidos.

- `.env.new`: Arquivo de ambiente temporário.
- `client/src/components/index.css`: Arquivo de CSS duplicado ou movido.
- `package-lock.json`: **Ponto crítico.** A presença deste arquivo indica que `npm install` foi executado, enquanto o projeto está configurado para usar `pnpm` (com um `pnpm-lock.yaml`). Essa inconsistência pode causar diferenças sutis e difíceis de depurar nas dependências instaladas.
- `start.sh`, `update-admin.mjs`: Scripts manuais que não estão sob controle de versão.

## 3. Auditoria da Infraestrutura do Servidor

A análise da configuração do servidor revelou pontos críticos de segurança e manutenção que necessitam de atenção imediata.

### 3.1. Status da Aplicação e Logs

- **Aplicação em Execução:** O processo `kpi-dashboard` está **online** e sendo gerenciado pelo PM2.
- **Erros Críticos nos Logs:** Os logs de erro do PM2 (`/root/.pm2/logs/kpi-dashboard-error-0.log`) estão repletos de mensagens `Error: MAUTIC_CLIENT_ID and MAUTIC_CLIENT_SECRET must be configured`. Isso indica que a aplicação está falhando ao tentar inicializar o serviço do Mautic por falta de credenciais no arquivo `.env`.
- **Erros de Proxy:** Os logs de erro do Apache (`/var/log/apache2/kpi-dashboard-error.log`) mostram múltiplos erros de `(111)Connection refused`, indicando que em vários momentos a aplicação Node.js não estava respondendo na porta `3000`, provavelmente devido a reinicializações causadas pelos erros fatais.

### 3.2. Diagnóstico de Segurança

| Ponto de Auditoria | Status | Risco | Análise e Recomendação |
| :--- | :--- | :--- | :--- |
| **Firewall (UFW)** | 🔴 **Inativo** | **Crítico** | O firewall do servidor está desativado. Isso expõe todas as portas do servidor à internet, aumentando drasticamente a superfície de ataque. **Ação imediata:** Ativar o UFW e permitir apenas as portas necessárias (SSH, HTTP, HTTPS). |
| **Atualizações de Segurança** | 🟡 **90 Pendentes** | **Alto** | Existem 90 atualizações de pacotes do sistema classificadas como de segurança. A falta de atualização expõe o servidor a vulnerabilidades conhecidas. **Ação:** Agendar uma janela de manutenção para aplicar todas as atualizações de segurança. |
| **Permissões de Arquivos** | 🟡 **Inconsistentes** | **Médio** | Os arquivos do projeto pertencem a uma mistura de usuários (`root` e `mychel`). A aplicação está sendo executada como `root`, o que é uma má prática de segurança. **Ação:** Criar um usuário de serviço dedicado para a aplicação e ajustar as permissões dos arquivos. |
| **Certificado SSL** | ✅ **Ativo e Válido** | **Baixo** | O domínio `dashboard.grupoblue.com.br` possui um certificado SSL válido emitido pelo Let's Encrypt, com 77 dias restantes. A configuração de renovação automática deve ser verificada. |

### 3.3. Configuração e Manutenibilidade

| Ponto de Auditoria | Status | Risco | Análise e Recomendação |
| :--- | :--- | :--- | :--- |
| **Variáveis de Ambiente (`.env`)** | 🔴 **Incompletas** | **Crítico** | O arquivo `.env` no servidor não contém as credenciais para Mautic e Metricool, causando os erros vistos nos logs e a falha de funcionalidades. **Ação imediata:** Preencher as variáveis de ambiente ausentes. |
| **Gerenciador de Pacotes** | 🔴 **Inconsistente** | **Alto** | O uso de `npm` em produção (gerando `package-lock.json`) em vez de `pnpm` (definido no projeto) é uma fonte de instabilidade. **Ação:** Remover `package-lock.json` e `node_modules`, e reinstalar as dependências usando `pnpm install`. |
| **Persistência do PM2** | 🔴 **Não Configurada** | **Alto** | O serviço `pm2-root` do systemd está `inactive (dead)`. Isso significa que, se o servidor for reiniciado, a aplicação **não** iniciará automaticamente. **Ação:** Executar `pm2 startup` e `pm2 save` para garantir a persistência. |
| **Backups Automatizados** | 🔴 **Inexistentes** | **Médio** | Não há rotinas de `cron` configuradas para realizar backups automáticos da aplicação ou do banco de dados. **Ação:** Configurar um cron job para realizar backups diários ou semanais dos dados críticos. |
| **Uso de Recursos** | ✅ **Saudável** | **Baixo** | O servidor possui ampla capacidade de memória (62 GB) e disco (2.4 TB), com baixo uso atual. No entanto, existem outros serviços (`geth`, `presearch-node`) consumindo recursos que devem ser monitorados. |

## 4. Plano de Ação Recomendado

A seguir, uma lista de tarefas priorizadas para estabilizar e proteger o ambiente de produção.

### Prioridade Crítica: Ações Imediatas

1.  **Ativar e Configurar o Firewall:**
    - `sudo ufw allow ssh`
    - `sudo ufw allow http`
    - `sudo ufw allow https`
    - `sudo ufw enable`
2.  **Corrigir Variáveis de Ambiente:**
    - Editar o arquivo `/root/dash-kpi/.env` e adicionar as credenciais corretas para `MAUTIC_CLIENT_ID`, `MAUTIC_CLIENT_SECRET`, `METRICOOL_API_TOKEN` e `METRICOOL_USER_ID`.
3.  **Sincronizar Código e Corrigir Dependências:**
    - No diretório `/root/dash-kpi`, executar `git stash` para salvar as modificações locais temporariamente.
    - Remover `rm -f package-lock.json` e `rm -rf node_modules`.
    - Instalar o `pnpm` globalmente: `npm install -g pnpm`.
    - Instalar as dependências corretamente: `pnpm install`.
    - Reconstruir a aplicação: `pnpm build`.
    - Reiniciar a aplicação: `pm2 restart kpi-dashboard`.

### Prioridade Alta: Estabilização e Boas Práticas

4.  **Garantir Persistência da Aplicação:**
    - Executar `pm2 startup` e seguir as instruções para registrar o serviço no `systemd`.
    - Executar `pm2 save` para salvar a lista de processos atual.
5.  **Aplicar Atualizações de Segurança:**
    - Agendar uma janela de manutenção e executar `sudo apt update && sudo apt upgrade -y`.
6.  **Versionar Alterações do Servidor:**
    - Após estabilizar o ambiente, revisar as alterações salvas com `git stash` e, se forem válidas, aplicá-las, fazer o commit e o push para o repositório no GitHub para eliminar a divergência.

### Prioridade Média: Melhorias de Longo Prazo

7.  **Criar Usuário de Serviço:**
    - Criar um usuário Linux dedicado para a aplicação (ex: `kpi-user`) e transferir a propriedade dos arquivos do projeto para ele.
    - Configurar o PM2 para executar a aplicação com este usuário em vez de `root`.
8.  **Configurar Backups Automatizados:**
    - Criar um script de backup para o banco de dados e os arquivos da aplicação.
    - Adicionar uma entrada no `crontab` para executar o script de backup regularmente.

## 5. Conclusão

A auditoria revela uma infraestrutura funcional, mas com falhas críticas de segurança e manutenção que a tornam vulnerável e instável. A divergência entre o código no servidor e no GitHub é um risco significativo para a governança e a continuidade do desenvolvimento.

A execução do plano de ação, começando pelas medidas críticas, é essencial para garantir um ambiente de produção seguro, estável e alinhado com as melhores práticas de DevOps. Recomendo fortemente a implementação imediata das correções de firewall e de configuração de ambiente para mitigar os riscos mais urgentes.
