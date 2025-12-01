/**
 * Integration Credentials Types
 * 
 * Define tipos específicos de credenciais para cada integração externa.
 * Cada tipo representa os campos necessários para autenticar e conectar
 * com o serviço correspondente.
 */

export type PipedriveCredentials = {
  apiToken: string;
};

export type NiboCredentials = {
  apiToken: string;
};

export type MetricoolCredentials = {
  apiKey: string;
  userId: string;
};

export type DiscordCredentials = {
  botToken: string;
  guildId: string;
};

export type CademiCredentials = {
  apiKey: string;
  baseUrl?: string;
};

export type MauticCredentials = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username?: string;   // se usar password grant
  password?: string;
  accessToken?: string;
};

export type TokenizaCredentials = {
  apiToken: string;
  baseUrl?: string;
};

export type TokenizaAcademyCredentials = {
  apiToken: string;
  baseUrl?: string;
};

export type YouTubeCredentials = {
  apiKey: string;
};

/**
 * Union type de todas as credenciais possíveis
 */
export type IntegrationCredentials =
  | PipedriveCredentials
  | NiboCredentials
  | MetricoolCredentials
  | DiscordCredentials
  | CademiCredentials
  | MauticCredentials
  | TokenizaCredentials
  | TokenizaAcademyCredentials
  | YouTubeCredentials;

/**
 * Tipo para o config completo de uma integração
 */
export type IntegrationConfig = {
  credentials?: IntegrationCredentials;
  [key: string]: any; // Permite campos adicionais específicos por integração
};
