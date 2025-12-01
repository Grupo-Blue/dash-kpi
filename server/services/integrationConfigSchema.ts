/**
 * Integration Config Schema
 * 
 * Schemas estruturados para validação de configurações de integrações.
 * Remove o uso problemático de z.record(z.any()) que causa erro _zod.
 */

import { z } from "zod";

/**
 * Schema recursivo para valores JSON válidos
 * Permite strings, numbers, booleans, null, arrays e objetos aninhados
 */
export const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

/**
 * Schema para credentials (objeto com valores JSON)
 */
export const credentialsSchema = z.record(z.string(), jsonValueSchema);

/**
 * Schema para config de integração
 * Formato: { credentials: { ... }, ...outros campos opcionais }
 */
export const integrationConfigSchema = z.object({
  credentials: credentialsSchema,
}).passthrough(); // permite campos adicionais além de credentials

/**
 * Schema para config opcional (usado nas rotas)
 */
export const configSchema = integrationConfigSchema.optional();

/**
 * Tipo inferido do schema de config
 */
export type IntegrationConfig = z.infer<typeof integrationConfigSchema>;
