# 📊 Importação de Dados Históricos de KPIs

Este documento explica como preencher e importar dados históricos de KPIs para o dashboard usando a planilha modelo Excel.

## 📋 Visão Geral

O sistema de snapshots foi implementado para coletar automaticamente dados diários de KPIs à meia-noite. No entanto, para ter histórico de comparação imediato, você pode importar dados manualmente de períodos anteriores usando a planilha modelo fornecida.

## 📂 Arquivos Fornecidos

- **KPI_Import_Template.xlsx**: Planilha modelo com abas para cada tipo de dado
- **scripts/import_historical_data.py**: Script Python para importar a planilha preenchida
- **IMPORTACAO_HISTORICO.md**: Este documento com instruções

## 🎯 Passo a Passo

### 1. Preencher a Planilha Modelo

Abra o arquivo `KPI_Import_Template.xlsx` no Excel ou Google Sheets.

#### Aba "📋 INSTRUÇÕES"
Contém instruções gerais sobre como usar a planilha. Leia atentamente antes de preencher.

#### Aba "Blue Consult"
Dados de vendas (Pipedrive) e financeiro (Nibo) da Blue Consult.

**Colunas:**
- `data`: Data do snapshot no formato YYYY-MM-DD (ex: 2024-10-01)
- `faturamento_mensal`: Faturamento total em reais (ex: 180000.00)
- `novos_clientes`: Número de novos clientes (ex: 12)
- `clientes_implantacao`: Clientes em processo de implantação (ex: 61)
- `taxa_conversao`: Taxa de conversão em % sem símbolo (ex: 89.8)
- `receitas_nibo`: Receitas do Nibo em reais (ex: 17800.00)
- `despesas_nibo`: Despesas do Nibo em reais (ex: 246300.00)
- `saldo_nibo`: Saldo (receitas - despesas) em reais (ex: -228600.00)

#### Aba "Tokeniza Academy"
Dados do Discord e plataforma Cademi.

**Colunas:**
- `data`: Data do snapshot (YYYY-MM-DD)
- `total_membros_discord`: Total de membros no servidor Discord
- `membros_online`: Membros online no momento
- `novos_membros_7d`: Novos membros nos últimos 7 dias
- `novos_membros_30d`: Novos membros nos últimos 30 dias
- `total_alunos_cademi`: Total de alunos cadastrados na plataforma
- `alunos_ativos`: Alunos com acesso ativo
- `total_cursos`: Número de cursos disponíveis

#### Aba "Redes Sociais"
Métricas de redes sociais (Metricool) para todas as empresas.

**Colunas:**
- `data`: Data do snapshot (YYYY-MM-DD)
- `empresa`: Nome da empresa (Blue Consult, Tokeniza, Tokeniza Academy, Mychel Mendes)
- `total_posts`: Número de posts publicados
- `total_interacoes`: Soma de curtidas, comentários, compartilhamentos
- `engagement_medio`: Taxa de engajamento em % (ex: 2.09)
- `alcance_total`: Número de pessoas alcançadas
- `impressoes_total`: Número total de impressões
- `seguidores_instagram`: Seguidores no Instagram
- `seguidores_facebook`: Seguidores no Facebook
- `seguidores_youtube`: Seguidores no YouTube
- `seguidores_twitter`: Seguidores no Twitter/X
- `seguidores_linkedin`: Seguidores no LinkedIn
- `seguidores_tiktok`: Seguidores no TikTok
- `seguidores_threads`: Seguidores no Threads

**Importante:** Para cada data, você deve criar uma linha para cada empresa.

#### Aba "Cademi Cursos"
Dados detalhados da plataforma de cursos Cademi.

**Colunas:**
- `data`: Data do snapshot (YYYY-MM-DD)
- `total_alunos`: Total de alunos cadastrados
- `alunos_ativos`: Alunos com acesso ativo
- `alunos_inativos`: Alunos sem acesso ativo
- `total_cursos`: Número de cursos disponíveis
- `taxa_ativacao`: Percentual de alunos ativos (ex: 71.1)

### 2. Regras de Preenchimento

✅ **Formatos Obrigatórios:**
- Datas: `YYYY-MM-DD` (ex: 2024-10-01)
- Números decimais: Use ponto `.` e não vírgula `,` (ex: 180000.00)
- Percentuais: Apenas o número sem símbolo % (ex: 89.8)
- Valores monetários: Sem símbolo R$ (ex: 180000.00)

✅ **Boas Práticas:**
- Não altere os nomes das colunas (primeira linha)
- Não delete as linhas de instruções (serão ignoradas automaticamente)
- Você pode adicionar quantas linhas quiser
- Se não tiver um dado específico, deixe a célula vazia
- Recomendado: preencher pelo menos 30 dias de histórico

### 3. Salvar a Planilha

Após preencher todos os dados:
1. Salve o arquivo Excel (.xlsx)
2. Mantenha o nome ou renomeie como preferir
3. Envie o arquivo para importação

### 4. Importar os Dados

#### Opção A: Via Interface Web (Recomendado)

1. Acesse o dashboard
2. Vá em **Administração** → **Importar Dados Históricos**
3. Faça upload da planilha preenchida
4. Aguarde a confirmação de importação

#### Opção B: Via Linha de Comando

Se você tiver acesso ao servidor, pode executar o script diretamente:

```bash
cd /home/ubuntu/kpi-dashboard
python3 scripts/import_historical_data.py caminho/para/sua_planilha.xlsx
```

**Exemplo:**
```bash
python3 scripts/import_historical_data.py ~/Downloads/KPIs_Historico_Outubro.xlsx
```

O script irá:
1. Carregar a planilha
2. Validar os dados
3. Importar linha por linha
4. Mostrar progresso e erros (se houver)
5. Confirmar total de snapshots importados

### 5. Verificar Importação

Após a importação:
1. Acesse o dashboard
2. Use o **Filtro de Período** para selecionar datas históricas
3. Verifique se os dados aparecem corretamente
4. Compare com os valores da planilha para validar

## 📊 Estrutura de Dados no Banco

Os dados são salvos na tabela `kpiSnapshots` com a seguinte estrutura:

```sql
CREATE TABLE kpiSnapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companyId INT,                    -- ID da empresa (1=Blue Consult, 2=Tokeniza, 4=Tokeniza Academy, 30004=Mychel Mendes)
  snapshotDate TIMESTAMP,           -- Data do snapshot (meia-noite)
  kpiType VARCHAR(100),             -- Tipo de KPI (blue_consult_all, metricool_social, etc)
  source VARCHAR(100),              -- Fonte dos dados (consolidated, metricool, cademi, etc)
  data JSON,                        -- Dados completos do KPI em formato JSON
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Mapeamento de Tipos de KPI

| Aba da Planilha | kpiType | source | companyId |
|----------------|---------|--------|-----------|
| Blue Consult | `blue_consult_all` | `consolidated` | 1 |
| Tokeniza Academy | `tokeniza_academy_all` | `consolidated` | 4 |
| Redes Sociais (Blue Consult) | `metricool_social` | `metricool` | 1 |
| Redes Sociais (Tokeniza) | `metricool_social` | `metricool` | 2 |
| Redes Sociais (Tokeniza Academy) | `metricool_social` | `metricool` | 4 |
| Redes Sociais (Mychel Mendes) | `metricool_social` | `metricool` | 30004 |
| Cademi Cursos | `cademi_courses` | `cademi` | 4 |

## ⚠️ Solução de Problemas

### Erro: "time data does not match format"
**Causa:** Data em formato incorreto  
**Solução:** Use o formato YYYY-MM-DD (ex: 2024-10-01)

### Erro: "could not convert string to float"
**Causa:** Número com formato incorreto  
**Solução:** Use ponto (.) para decimais, não vírgula (,)

### Erro: "Empresa desconhecida"
**Causa:** Nome da empresa na aba "Redes Sociais" está incorreto  
**Solução:** Use exatamente: "Blue Consult", "Tokeniza", "Tokeniza Academy" ou "Mychel Mendes"

### Erro: "Database connection failed"
**Causa:** Variável de ambiente DATABASE_URL não configurada  
**Solução:** Verifique se a variável está definida no ambiente

### Dados não aparecem no dashboard
**Causa:** Filtro de período não está selecionando as datas importadas  
**Solução:** Ajuste o filtro de período para incluir as datas dos snapshots importados

## 💡 Dicas e Recomendações

1. **Frequência de Dados:**
   - Mínimo recomendado: 30 dias de histórico
   - Ideal: 90 dias ou mais para análises de tendências
   - Você pode importar dados diários, semanais ou mensais

2. **Consistência:**
   - Mantenha o mesmo padrão de preenchimento
   - Se começar com dados diários, continue com dados diários
   - Evite misturar frequências diferentes

3. **Validação:**
   - Sempre verifique os dados no dashboard após importar
   - Compare alguns valores com suas fontes originais
   - Use o filtro de período para navegar pelos dados históricos

4. **Backup:**
   - Mantenha uma cópia da planilha preenchida
   - Documente de onde vieram os dados
   - Anote qualquer estimativa ou aproximação feita

5. **Atualização:**
   - Após a primeira importação, o sistema coletará dados automaticamente
   - Você pode importar novamente para corrigir ou adicionar dados
   - Snapshots duplicados (mesma data/empresa/tipo) serão adicionados como registros separados

## 🔐 Segurança

- A planilha não contém dados sensíveis de autenticação
- Todos os dados são armazenados no banco de dados criptografado
- O script de importação usa a conexão segura do banco (DATABASE_URL)
- Não compartilhe a planilha preenchida publicamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique as instruções neste documento
2. Confira a seção "Solução de Problemas"
3. Revise os exemplos fornecidos na planilha
4. Entre em contato com o suporte técnico

---

**Última atualização:** 03/11/2025  
**Versão do sistema:** 1.0
