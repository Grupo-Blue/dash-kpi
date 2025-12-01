# Sprint I6 - Sincronizar Menu Lateral com Gerenciar Empresas

## Objetivo

Garantir que as 4 empresas core do sistema (Blue Consult, Tokeniza, Tokeniza Academy e Mychel Mendes) sempre existam na tabela `companies` e sejam protegidas contra alterações destrutivas de slug ou exclusão acidental.

## Implementação

### I6.1 - Seed Automático das Empresas Padrão

**Arquivo:** `server/db.ts`

- Adicionado import de `COMPANIES` do `config/companies.ts`
- Criada constante `SYSTEM_COMPANY_DEFS` com mapeamento das 4 empresas core
- Implementada função `ensureDefaultCompanies()` que:
  - Verifica se cada empresa core já existe no banco (por slug)
  - Cria automaticamente empresas ausentes com dados de `COMPANIES`
  - Loga criação de empresas para auditoria

**Arquivo:** `server/_core/index.ts`

- Adicionado import de `ensureDefaultCompanies`
- Chamada da função após `validateEnv()` e antes de criar o app Express
- Garante que empresas existam antes do servidor processar requisições

### I6.2 - Proteção de Empresas Core no Backend

**Arquivo:** `server/db.ts`

- Criada constante `PROTECTED_SLUGS` com os 4 slugs das empresas core
- **`updateCompany()`:**
  - Busca empresa existente antes de atualizar
  - Bloqueia alteração de slug se empresa for protegida
  - Força manutenção do slug original ao atualizar nome
  - Mantém comportamento normal para empresas comuns
- **`deleteCompany()`:**
  - Verifica se empresa é protegida antes de deletar
  - Lança erro: "Empresa do sistema não pode ser removida"
  - Mantém validação de KPIs associados

### I6.3 - Desabilitação de Edição no Frontend

**Arquivo:** `client/src/components/admin/ManageCompanies.tsx`

- Adicionada constante `PROTECTED_SLUGS` no componente
- Criada variável `isProtected` que detecta se empresa em edição é protegida
- **Campo Slug:**
  - Desabilitado (`disabled={isProtected}`) para empresas protegidas
  - Estilo visual diferenciado (cinza, cursor-not-allowed)
  - Mensagem: "🔒 Slug de empresas do sistema não pode ser alterado"
- **Botão Deletar:**
  - Desabilitado para empresas protegidas
  - Tooltip: "Empresa do sistema não pode ser removida"
  - Estilo visual diferenciado (cinza claro)

## Arquivos Modificados

- `server/db.ts` - 3 alterações (import, seed, proteções)
- `server/_core/index.ts` - 2 alterações (import, chamada)
- `client/src/components/admin/ManageCompanies.tsx` - 3 alterações (constante, lógica, UI)

## Resultado

### Backend

✅ Empresas core criadas automaticamente na inicialização  
✅ Slug protegido contra alteração (erro: "Slug de empresa do sistema não pode ser alterado")  
✅ Exclusão bloqueada (erro: "Empresa do sistema não pode ser removida")  
✅ Logs de auditoria para criação de empresas

### Frontend

✅ Campo slug desabilitado visualmente para empresas protegidas  
✅ Mensagem clara sobre proteção de slug  
✅ Botão deletar desabilitado para empresas protegidas  
✅ Tooltip explicativo sobre impossibilidade de remoção

### Empresas Garantidas

1. **Blue Consult** - `slug: 'blue-consult'`
2. **Tokeniza** - `slug: 'tokeniza'`
3. **Tokeniza Academy** - `slug: 'tokeniza-academy'`
4. **Mychel Mendes** - `slug: 'mychel-mendes'`

## Impacto

- **Menu lateral** continua funcionando com rotas fixas (`/blue-consult`, etc.)
- **`useCompanySlug`** sempre encontra empresas corretas por slug
- **Administração > Gerenciar Empresas** lista todas as empresas
- **Impossível quebrar** rotas do sistema por alteração acidental
- **Experiência consistente** entre menu e administração

## Critérios de Aceite

✅ Empresas core existem no banco após inicialização  
✅ Slug não pode ser alterado via backend  
✅ Slug não pode ser alterado via frontend  
✅ Empresas core não podem ser deletadas  
✅ Mensagens de erro claras e em português  
✅ UI indica visualmente proteções  
✅ Menu lateral sincronizado com banco de dados
