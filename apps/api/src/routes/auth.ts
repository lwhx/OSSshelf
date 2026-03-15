import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb, users } from '../db';
import { authMiddleware } from '../middleware/auth';
import { signJWT, hashPassword, verifyPassword } from '../lib/crypto';
import { JWT_EXPIRY, ERROR_CODES } from '@r2shelf/shared';
import type { Env, Variables } from '../types/env';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
});

app.post('/register', async (c) => {
  const body = await c.req.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: result.error.errors[0].message } },
      400,
    );
  }

  const { email, password, name } = result.data;
  const db = getDb(c.env.DB);

  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: '该邮箱已被注册' } },
      400,
    );
  }

  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    name: name || null,
    role: 'user',
    storageQuota: 10737418240,
    storageUsed: 0,
    createdAt: now,
    updatedAt: now,
  });

  const token = await signJWT({ userId, email, role: 'user' }, c.env.JWT_SECRET);

  await c.env.KV.put(`session:${token}`, JSON.stringify({ userId, email }), {
    expirationTtl: Math.floor(JWT_EXPIRY / 1000),
  });

  return c.json({
    success: true,
    data: {
      user: { id: userId, email, name: name || null, role: 'user', storageQuota: 10737418240, storageUsed: 0, createdAt: now, updatedAt: now },
      token,
    },
  });
});

app.post('/login', async (c) => {
  const body = await c.req.json();
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: result.error.errors[0].message } },
      400,
    );
  }

  const { email, password } = result.data;
  const db = getDb(c.env.DB);

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.UNAUTHORIZED, message: '邮箱或密码错误' } },
      401,
    );
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.UNAUTHORIZED, message: '邮箱或密码错误' } },
      401,
    );
  }

  const token = await signJWT({ userId: user.id, email: user.email, role: user.role }, c.env.JWT_SECRET);

  await c.env.KV.put(`session:${token}`, JSON.stringify({ userId: user.id, email: user.email }), {
    expirationTtl: Math.floor(JWT_EXPIRY / 1000),
  });

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        storageQuota: user.storageQuota, storageUsed: user.storageUsed,
        createdAt: user.createdAt, updatedAt: user.updatedAt,
      },
      token,
    },
  });
});

app.post('/logout', authMiddleware, async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.slice(7);
  if (token) {
    await c.env.KV.delete(`session:${token}`);
  }
  return c.json({ success: true, data: { message: '已退出登录' } });
});

app.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const db = getDb(c.env.DB);

  const user = await db.select().from(users).where(eq(users.id, userId!)).get();
  if (!user) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '用户不存在' } },
      404,
    );
  }

  return c.json({
    success: true,
    data: {
      id: user.id, email: user.email, name: user.name, role: user.role,
      storageQuota: user.storageQuota, storageUsed: user.storageUsed,
      createdAt: user.createdAt, updatedAt: user.updatedAt,
    },
  });
});

export default app;
