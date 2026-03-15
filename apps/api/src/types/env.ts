import type { Context } from 'hono';

export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  KV: KVNamespace;
  ENVIRONMENT: string;
  JWT_SECRET: string;
}

export type Variables = {
  userId?: string;
  user?: { id: string; email: string; role: string };
};

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;
