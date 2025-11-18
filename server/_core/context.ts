import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Authentication temporarily disabled - always return mock admin user
  const user: User = {
    id: 1,
    openId: 'mock-admin',
    name: 'Admin',
    email: 'admin@grupoblue.com.br',
    loginMethod: 'local',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    password: null,
  };

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
