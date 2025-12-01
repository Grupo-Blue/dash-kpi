export const ENV = {
  // Core
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Integrations
  pipedriveApiToken: process.env.PIPEDRIVE_API_TOKEN ?? "",
  discordBotToken: process.env.DISCORD_BOT_TOKEN ?? "",
  discordGuildId: process.env.DISCORD_GUILD_ID ?? "",
  metricoolApiToken: process.env.METRICOOL_API_TOKEN ?? "",
  metricoolUserId: process.env.METRICOOL_USER_ID ?? "",
  youtubeApiKey: process.env.YOUTUBE_API_KEY ?? "",
  cademiApiKey: process.env.CADEMI_API_KEY ?? "",
  niboApiToken: process.env.NIBO_API_TOKEN ?? "",
  mauticBaseUrl: process.env.MAUTIC_BASE_URL ?? "https://mautic.grupoblue.com.br",
  mauticClientId: process.env.MAUTIC_CLIENT_ID ?? "",
  mauticClientSecret: process.env.MAUTIC_CLIENT_SECRET ?? "",
};

/**
 * Validate required environment variables
 * Throws error if critical variables are missing
 */
export function validateEnv() {
  // Only core variables are required
  // All external integrations are now optional and can be configured via admin panel
  const required = [
    'JWT_SECRET',
    'DATABASE_URL',
  ];
  
  // Optional variables (OAuth Manus, external integrations)
  // 'VITE_APP_ID',
  // 'OAUTH_SERVER_URL',
  // 'OWNER_OPEN_ID',
  // 'PIPEDRIVE_API_TOKEN',
  // 'DISCORD_BOT_TOKEN',
  // 'DISCORD_GUILD_ID',
  // 'METRICOOL_API_TOKEN',
  // 'METRICOOL_USER_ID',
  // 'CADEMI_API_KEY',
  // 'NIBO_API_TOKEN',
  // 'MAUTIC_CLIENT_ID',
  // 'MAUTIC_CLIENT_SECRET',
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
