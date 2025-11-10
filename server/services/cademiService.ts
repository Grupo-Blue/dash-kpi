/**
 * Cademi API Service
 * 
 * Integração com a plataforma de cursos Cademi (Tokeniza Academy)
 * Documentação: https://ajuda.cademi.com.br/configuracoes/api
 */

const CADEMI_BASE_URL = 'https://portal.escoladecripto.com.br/api/v1';
const CADEMI_API_KEY = process.env.CADEMI_API_KEY;

interface CademiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  profiler: {
    start: number;
    finish: number;
    process: number;
  };
}

interface CademiUser {
  id: number;
  nome: string;
  email: string;
  doc: string | null;
  celular: string | null;
  login_auto: string;
  gratis: boolean;
  criado_em: string; // ISO-8601
  ultimo_acesso_em: string | null; // ISO-8601
}

interface CademiPaginator {
  perPage: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

interface CademiUsersResponse {
  paginator: CademiPaginator;
  usuario: CademiUser[];
}

interface CademiUserAccess {
  produto: {
    id: number;
    ordem: number;
    nome: string;
    oferta_url: string | null;
  };
  duracao: string | null;
  duracao_tipo: string;
  comecou_em: string;
  encerra_em: string | null;
  encerrado: boolean;
}

interface CademiUserAccessResponse {
  usuario: CademiUser;
  acesso: CademiUserAccess[];
}

interface CademiProgressResponse {
  progresso: {
    total: string; // "41.7%"
    assistidas: number;
    completas: number;
    aulas: Array<{
      item_id: number;
      count: number;
      acesso_em: string;
      aula: {
        id: number;
        ordem: number;
        nome: string;
      };
    }>;
  };
}

export interface CademiProduct {
  id: number;
  ordem: number;
  nome: string;
  oferta_url: string | null;
}

interface CademiProductsResponse {
  paginator: CademiPaginator;
  produto: CademiProduct[];
}

/**
 * Faz requisição à API da Cademi
 */
async function cademiRequest<T>(endpoint: string): Promise<T> {
  if (!CADEMI_API_KEY) {
    throw new Error('CADEMI_API_KEY not configured');
  }

  const url = `${CADEMI_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': CADEMI_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Cademi] HTTP ${response.status}: ${text}`);
      throw new Error(`Cademi API error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[Cademi] Non-JSON response:', text.substring(0, 200));
      throw new Error('Cademi API returned non-JSON response');
    }

    const data: CademiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(`Cademi API error: ${data.code}`);
    }

    return data.data;
  } catch (error) {
    console.error('[Cademi] Request failed:', error);
    throw error;
  }
}

/**
 * Lista todos os usuários (com paginação)
 */
export async function getAllUsers(cursor?: string): Promise<CademiUsersResponse> {
  const endpoint = cursor ? `/usuario?cursor=${encodeURIComponent(cursor)}` : '/usuario';
  return cademiRequest<CademiUsersResponse>(endpoint);
}

/**
 * Busca usuário específico por ID, email ou documento
 */
export async function getUser(userIdentifier: string | number): Promise<{ usuario: CademiUser }> {
  return cademiRequest<{ usuario: CademiUser }>(`/usuario/${userIdentifier}`);
}

/**
 * Lista acessos de um usuário
 */
export async function getUserAccess(userIdentifier: string | number): Promise<CademiUserAccessResponse> {
  return cademiRequest<CademiUserAccessResponse>(`/usuario/acesso/${userIdentifier}`);
}

/**
 * Busca progresso de um usuário em um produto específico
 */
export async function getUserProgress(
  userIdentifier: string | number,
  productId: number
): Promise<CademiProgressResponse> {
  return cademiRequest<CademiProgressResponse>(`/usuario/progresso_por_produto/${userIdentifier}/${productId}`);
}

/**
 * Lista todos os produtos/cursos
 */
export async function getAllProducts(): Promise<CademiProductsResponse> {
  return cademiRequest<CademiProductsResponse>('/produto');
}

/**
 * Coleta todos os usuários (todas as páginas)
 */
export async function fetchAllUsers(): Promise<CademiUser[]> {
  const allUsers: CademiUser[] = [];
  let cursor: string | null = null;
  let pageCount = 0;
  const MAX_PAGES = 100; // Limite de segurança

  try {
    do {
      const response = await getAllUsers(cursor || undefined);
      allUsers.push(...response.usuario);
      
      cursor = response.paginator.next_page_url 
        ? new URL(response.paginator.next_page_url).searchParams.get('cursor')
        : null;
      
      pageCount++;
      
      // Rate limit: 2 req/s
      if (cursor && pageCount < MAX_PAGES) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    } while (cursor && pageCount < MAX_PAGES);

    console.log(`[Cademi] Fetched ${allUsers.length} users in ${pageCount} pages`);
    return allUsers;
  } catch (error) {
    console.error('[Cademi] Failed to fetch all users:', error);
    throw error;
  }
}

// Export class for compatibility
export class CademiService {
  static async getAllUsers() {
    return fetchAllUsers();
  }

  static async getAllProducts() {
    return getAllProducts();
  }
}
