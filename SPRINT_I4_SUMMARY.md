# Sprint I4 - Integrações Multi-Empresa

## Objetivo
Suportar integrações multi-empresa, amarrando cada integração a uma empresa específica.

## Alterações Implementadas

### I4.1 - Schema do Banco de Dados
- ✅ Adicionado `companyId` à tabela `integrations`
- ✅ Removido unique constraint de `serviceName` (agora permite múltiplas integrações do mesmo serviço para empresas diferentes)
- ✅ Criado unique index composto `(companyId, serviceName)`
- ✅ Migration criada: `0003_greedy_siren.sql`

### I4.2 - Camada de DB
- ✅ Atualizado `getIntegrationCredentials(serviceName, companyId?)` para aceitar companyId opcional
- ✅ Atualizado `upsertIntegrationCredentials` para receber companyId obrigatório
- ✅ Atualizado `deleteIntegrationCredentials` para aceitar companyId
- ✅ Criado `getCompanyIntegrations(companyId)` para buscar todas integrações de uma empresa

### I4.3 - Router adminIntegrations
- ✅ `updateCredentials` agora recebe `companySlug` obrigatório
- ✅ `deleteCredentials` agora recebe `companySlug` obrigatório
- ✅ `getAll` enriquece resultados com `companySlug` e `companyName`
- ✅ Resolve `companySlug` para `companyId` antes de salvar

### I4.4 - IntegrationStatus
- ✅ Refatorado `checkIntegration(serviceName, companyId)` para aceitar companyId
- ✅ Criado `checkAllForCompany(companyId)` para verificar integrações de uma empresa
- ✅ `checkAll()` agora retorna status de todas empresas
- ✅ Métodos deprecated mantidos para backward compatibility (defaultam para companyId 1)

### I4.5 - Helpers de KPIs
- ✅ Todos os helpers refatorados para usar `companySlug` em vez de `userId`
- ✅ `getPipedriveServiceForCompany(companySlug)`
- ✅ `getNiboServiceForCompany(companySlug)`
- ✅ `getMetricoolServiceForCompany(companySlug)`
- ✅ `getDiscordServiceForCompany(companySlug)`
- ✅ `getTokenizaServiceForCompany(companySlug)`
- ✅ `getTokenizaAcademyServiceForCompany(companySlug)`
- ✅ `getMauticServiceForCompany(companySlug)`
- ✅ Métodos deprecated mantidos para backward compatibility

### I4.6 - Frontend
- ✅ Adicionado seletor de empresa no topo da página de Integrações
- ✅ Auto-seleção da primeira empresa ao carregar
- ✅ Filtro de integrações por empresa selecionada
- ✅ `updateCredentials` envia `companySlug` no payload
- ✅ `deleteCredentials` envia `companySlug` no payload
- ✅ Validação: operações bloqueadas se nenhuma empresa selecionada

## Arquivos Modificados

### Backend
- `drizzle/schema.ts` - Schema da tabela integrations
- `drizzle/migrations/0003_greedy_siren.sql` - Migration do banco
- `server/db.ts` - Funções de DB atualizadas
- `server/routers.ts` - Router adminIntegrations atualizado
- `server/services/integrationStatus.ts` - Refatorado para multi-empresa
- `server/services/integrationHelpers.ts` - Helpers refatorados para companySlug

### Frontend
- `client/src/pages/Integrations.tsx` - Seletor de empresa e filtros

## Backward Compatibility
- ✅ Métodos deprecated mantidos com fallback para `companyId 1` (Blue Consult)
- ✅ `getIntegrationCredentials` aceita `companyId` opcional (fallback para busca sem companyId)
- ✅ Código existente continua funcionando

## Migration do Banco de Dados

A migration `0003_greedy_siren.sql` deve ser aplicada no servidor de produção:

```sql
-- Adicionar companyId com valor padrão 1 (Blue Consult)
ALTER TABLE integrations ADD COLUMN companyId INT NOT NULL DEFAULT 1;

-- Adicionar foreign key
ALTER TABLE integrations ADD CONSTRAINT integrations_companyId_companies_id_fk 
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE;

-- Remover unique constraint antigo de serviceName
ALTER TABLE integrations DROP INDEX serviceName;

-- Criar unique index composto (companyId, serviceName)
CREATE UNIQUE INDEX integrations_companyId_serviceName_unique 
  ON integrations(companyId, serviceName);
```

## Testes Realizados
- ✅ Build local: 21.76s
- ✅ Sem erros de TypeScript
- ✅ Sem erros de importação

## Próximos Passos
1. Aplicar migration no banco de produção
2. Deploy do código atualizado
3. Testar seletor de empresa no frontend
4. Configurar integrações para cada empresa

## Critérios de Aceite
✅ Cada integração está amarrada a uma empresa específica  
✅ Múltiplas empresas podem ter a mesma integração (ex: Pipedrive)  
✅ Frontend permite selecionar empresa antes de configurar  
✅ Backend valida e resolve companySlug para companyId  
✅ Backward compatibility mantida  
✅ Migration do banco criada e documentada  
