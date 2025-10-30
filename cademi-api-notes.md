# Cademi API - Notas de Implementação

## Configuração
- **Base URL:** https://escoladecripto.cademi.com.br/api/v1
- **Authorization Header:** a9045cd7-340c-4f78-b7da-e90c311ea04b
- **Rate Limit:** 2 requisições/segundo, 120/minuto
- **Formato de datas:** ISO-8601

## Endpoints Disponíveis

### Usuários (Alunos)
- **GET /usuario** - Lista todos os usuários (paginado, 150 por página)
- **GET /usuario/{usuario_email_id_doc}** - Busca usuário específico
- **GET /usuario/acesso/{usuario_email_id_doc}** - Lista acessos do usuário
- **GET /usuario/progresso_por_produto/{usuario_email_id_doc}/{produto_id}** - Progresso em curso específico

### Produtos (Cursos)
- Endpoint: /produto

### Aulas
- Endpoint: /aula

### Tags
- Endpoint: /tag

### Entregas
- Endpoint: /entrega

## Métricas a Implementar (baseado nos prints do dashboard)

### 1. Total de Alunos
- Endpoint: GET /usuario
- Usar paginação para contar total
- Calcular variação comparando com período anterior

### 2. Novos Alunos por Mês
- Endpoint: GET /usuario
- Filtrar por campo `criado_em` (ISO-8601)
- Agrupar por mês

### 3. Certificados Emitidos
- Verificar se há endpoint específico ou calcular via progresso completo

### 4. Interações
- Verificar endpoint de entregas ou comentários

### 5. Acessos (últimos 30 dias)
- Campo `ultimo_acesso_em` dos usuários
- Distribuição: Hoje, Ontem, 2-7 dias, 7-14 dias, 14-30 dias

### 6. Ranking de Pontos
- Verificar se API tem sistema de pontos/gamificação

### 7. Ranking de Engajamento
- Usar progresso por produto
- Contar aulas assistidas por aluno

### 8. Nunca Acessou
- Filtrar usuários onde `ultimo_acesso_em` é null

## Resposta Padrão da API

```json
{
  "success": true,
  "code": 200,
  "data": {
    "paginator": {
      "perPage": 150,
      "next_page_url": "...",
      "prev_page_url": null
    },
    "usuario": [
      {
        "id": 1126594,
        "nome": "Nome do Aluno",
        "email": "email@example.com",
        "doc": "123.123.123-12",
        "celular": null,
        "login_auto": "http://...",
        "gratis": false,
        "criado_em": "2022-01-12T15:50:47-03:00",
        "ultimo_acesso_em": "2022-01-15T10:30:00-03:00"
      }
    ]
  },
  "profiler": {
    "start": 1646263257.919774,
    "finish": 1646263257.937168,
    "process": 0.017393827438354492
  }
}
```

## Códigos de Erro
- **200** - Sucesso
- **403** - Sem header de segurança
- **405** - Token inválido
- **409** - Erro de regra de negócio
