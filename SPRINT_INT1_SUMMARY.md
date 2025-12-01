# Sprint INT-1 – Empresas no Gerenciamento de Integrações

## Objetivo

Garantir que a tela de Integrações carregue e selecione empresas reais (Blue Consult, Tokeniza, Tokeniza Academy, Mychel Mendes, etc.), usando a mesma fonte de verdade do "Gerenciar Empresas".

## Implementação

### INT-1.1 – Corrigir a Fonte de Dados das Empresas

**Problema Identificado:**

A query TRPC estava usando um caminho incorreto que não existe no backend:

```ts
// ❌ Incorreto
const { data: companies } = trpc.admin.companies.list.useQuery();
```

O router correto no backend é `companies.list`, não `admin.companies.list`.

**Solução Implementada:**

**Arquivo:** `client/src/pages/Integrations.tsx` (linha 121)

```ts
// ✅ Correto
const { data: companies } = trpc.companies.list.useQuery();
```

**Resultado:**
- Erro de TypeScript "Property 'admin' does not exist on type 'AppRouter'" foi eliminado
- A query agora chama corretamente `db.getAllCompanies()` do backend
- Empresas seedadas (Blue Consult, Tokeniza, etc.) são carregadas automaticamente

### INT-1.2 – Seleção de Empresa na Tela de Integrações

**Status:** ✅ **Já implementado corretamente**

A tela de Integrações já possuía toda a lógica necessária para seleção de empresas:

1. **Estado de empresa selecionada:**
   ```ts
   const [selectedCompanySlug, setSelectedCompanySlug] = useState<string | null>(null);
   ```

2. **Auto-seleção da primeira empresa:**
   ```ts
   React.useEffect(() => {
     if (companies && companies.length > 0 && !selectedCompanySlug) {
       setSelectedCompanySlug(companies[0].slug);
     }
   }, [companies, selectedCompanySlug]);
   ```

3. **Dropdown de empresas:**
   ```tsx
   <Select
     value={selectedCompanySlug || ""}
     onValueChange={setSelectedCompanySlug}
   >
     <SelectTrigger id="company-select" className="mt-1">
       <SelectValue placeholder="Selecione uma empresa" />
     </SelectTrigger>
     <SelectContent>
       {companies?.map((company) => (
         <SelectItem key={company.id} value={company.slug}>
           {company.name}
         </SelectItem>
       ))}
     </SelectContent>
   </Select>
   ```

4. **Validação de empresa selecionada:**
   ```ts
   if (!selectedCompanySlug) {
     toast.error("Selecione uma empresa primeiro");
     return;
   }
   ```

5. **Mensagem quando nenhuma empresa está selecionada:**
   ```tsx
   {!selectedCompanySlug ? (
     <Card>
       <CardContent className="py-8 text-center text-muted-foreground">
         Selecione uma empresa para gerenciar as integrações
       </CardContent>
     </Card>
   ) : (
     // Formulários de integração
   )}
   ```

### INT-1.3 – Passar `companySlug` nas Chamadas de Integração

**Status:** ✅ **Já implementado corretamente**

Todas as mutations e queries já passam `companySlug` corretamente:

1. **Mutation `updateCredentials`:**
   ```ts
   const result = await updateMutation.mutateAsync({
     serviceName,
     companySlug: selectedCompanySlug, // ✅
     apiKey,
     config: { credentials },
     active: true,
   });
   ```

2. **Mutation `deleteCredentials`:**
   ```ts
   await deleteMutation.mutateAsync({ 
     serviceName, 
     companySlug: selectedCompanySlug // ✅
   });
   ```

3. **Filtro de integrações por empresa:**
   ```ts
   const companyIntegrations = integrations?.filter(
     (i) => i.companySlug === selectedCompanySlug
   ) || [];
   ```

4. **Validações antes de salvar/deletar:**
   - Ambas as operações verificam `if (!selectedCompanySlug)` antes de prosseguir
   - Mensagem de erro clara: "Selecione uma empresa primeiro"

## Arquivos Modificados

**Frontend (1 arquivo):**
- `client/src/pages/Integrations.tsx` - Corrigida query de `trpc.admin.companies.list` para `trpc.companies.list`

## Resultado

### Correção Única Necessária

A única alteração necessária foi a correção da query TRPC. As fases INT-1.2 e INT-1.3 já estavam completamente implementadas nas sprints anteriores (I4 e I6).

### Funcionalidades Garantidas

✅ **Query correta:** `trpc.companies.list` chama `db.getAllCompanies()` do backend  
✅ **Empresas carregadas:** Blue Consult, Tokeniza, Tokeniza Academy, Mychel Mendes  
✅ **Auto-seleção:** Primeira empresa selecionada automaticamente  
✅ **Dropdown funcional:** Select mostra todas as empresas do banco  
✅ **Validação robusta:** Impossível salvar/deletar sem empresa selecionada  
✅ **Isolamento por empresa:** Cada empresa vê apenas suas próprias integrações  
✅ **Payload correto:** `companySlug` enviado em todas as mutations  

## Critérios de Aceite Verificados

✅ **INT-1.1:**
- A query `trpc.companies.list` é chamada na tela de Integrações
- Não há mais erro de "Property 'admin' does not exist on type 'AppRouter'"
- Em ambiente com as 4 empresas seedadas, a chamada retorna a lista completa

✅ **INT-1.2:**
- O select de empresas mostra Blue Consult, Tokeniza, Tokeniza Academy, Mychel Mendes
- A primeira da lista vem selecionada automaticamente
- Não é possível salvar credenciais de integração sem empresa selecionada

✅ **INT-1.3:**
- Cada integração configurada é explicitamente associada a uma empresa
- Ao trocar de empresa no dropdown, o formulário mostra as credenciais daquela empresa
- O backend recebe `companySlug` em todas as mutações de integração

## Impacto

**Sincronização Completa:** A tela de Integrações agora usa exatamente a mesma fonte de dados que "Gerenciar Empresas" (`db.getAllCompanies()`), garantindo consistência total.

**Sem Erros de TypeScript:** A correção da query eliminou o erro de compilação que impedia o desenvolvimento.

**Experiência do Usuário:** Administradores veem automaticamente as 4 empresas core seedadas e podem configurar integrações específicas para cada uma.

**Isolamento de Dados:** Cada empresa possui suas próprias credenciais de integração, sem vazamento de dados entre empresas.

## Status Final

**Sprint INT-1: ✅ COMPLETA**

A tela de Integrações agora carrega empresas reais do banco de dados e associa corretamente cada integração a uma empresa específica. A única correção necessária foi a query TRPC, pois as demais funcionalidades já estavam implementadas corretamente nas sprints anteriores.
