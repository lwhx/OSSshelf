import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { getDb, files, shares } from '../db';
import { authMiddleware } from '../middleware/auth';
import { ERROR_CODES, SHARE_DEFAULT_EXPIRY } from '@r2shelf/shared';
import type { Env, Variables } from '../types/env';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const createShareSchema = z.object({
  fileId: z.string().min(1, '文件ID不能为空'),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
  downloadLimit: z.number().int().min(1).optional(),
});

// ── Create share ──────────────────────────────────────────────────────────
app.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId')!;
  const body = await c.req.json();
  const result = createShareSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: result.error.errors[0].message } },
      400,
    );
  }

  const { fileId, password, expiresAt, downloadLimit } = result.data;
  const db = getDb(c.env.DB);

  const file = await db.select().from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId))).get();

  if (!file) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件不存在' } },
      404,
    );
  }

  const shareId = crypto.randomUUID();
  const now = new Date().toISOString();
  const expires = expiresAt || new Date(Date.now() + SHARE_DEFAULT_EXPIRY).toISOString();

  await db.insert(shares).values({
    id: shareId,
    fileId,
    userId,
    password: password || null,
    expiresAt: expires,
    downloadLimit: downloadLimit || null,
    downloadCount: 0,
    createdAt: now,
  });

  return c.json({
    success: true,
    data: { id: shareId, fileId, expiresAt: expires, downloadLimit, createdAt: now, shareUrl: `/api/share/${shareId}` },
  });
});

// ── List user's shares ────────────────────────────────────────────────────
app.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')!;
  const db = getDb(c.env.DB);

  const userShares = await db.select().from(shares).where(eq(shares.userId, userId)).all();

  // Enrich with file info
  const enriched = await Promise.all(
    userShares.map(async (share) => {
      const file = await db.select().from(files).where(eq(files.id, share.fileId)).get();
      return {
        ...share,
        file: file ? { id: file.id, name: file.name, size: file.size, mimeType: file.mimeType, isFolder: file.isFolder } : null,
      };
    }),
  );

  return c.json({ success: true, data: enriched });
});

// ── Delete share ──────────────────────────────────────────────────────────
app.delete('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')!;
  const shareId = c.req.param('id');
  const db = getDb(c.env.DB);

  const share = await db.select().from(shares)
    .where(and(eq(shares.id, shareId), eq(shares.userId, userId))).get();

  if (!share) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '分享不存在' } },
      404,
    );
  }

  await db.delete(shares).where(eq(shares.id, shareId));
  return c.json({ success: true, data: { message: '已删除分享' } });
});

// ── Public: get share info ────────────────────────────────────────────────
app.get('/:id', async (c) => {
  const shareId = c.req.param('id');
  const password = c.req.query('password');
  const db = getDb(c.env.DB);

  const share = await db.select().from(shares).where(eq(shares.id, shareId)).get();

  if (!share) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '分享链接不存在' } }, 404);
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return c.json({ success: false, error: { code: ERROR_CODES.SHARE_EXPIRED, message: '分享链接已过期' } }, 410);
  }
  if (share.password && share.password !== password) {
    return c.json({ success: false, error: { code: ERROR_CODES.SHARE_PASSWORD_REQUIRED, message: '需要密码访问' } }, 401);
  }

  const file = await db.select().from(files).where(eq(files.id, share.fileId)).get();
  if (!file) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件不存在' } }, 404);

  return c.json({
    success: true,
    data: {
      id: share.id,
      file: { id: file.id, name: file.name, size: file.size, mimeType: file.mimeType, isFolder: file.isFolder },
      expiresAt: share.expiresAt,
      downloadLimit: share.downloadLimit,
      downloadCount: share.downloadCount,
      hasPassword: !!share.password,
    },
  });
});

// ── Public: download via share ────────────────────────────────────────────
app.get('/:id/download', async (c) => {
  const shareId = c.req.param('id');
  const password = c.req.query('password');
  const db = getDb(c.env.DB);

  const share = await db.select().from(shares).where(eq(shares.id, shareId)).get();

  if (!share) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '分享链接不存在' } }, 404);
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return c.json({ success: false, error: { code: ERROR_CODES.SHARE_EXPIRED, message: '分享链接已过期' } }, 410);
  }
  if (share.password && share.password !== password) {
    return c.json({ success: false, error: { code: ERROR_CODES.SHARE_PASSWORD_INVALID, message: '密码错误' } }, 401);
  }
  if (share.downloadLimit && share.downloadCount >= share.downloadLimit) {
    return c.json({ success: false, error: { code: ERROR_CODES.SHARE_DOWNLOAD_LIMIT_EXCEEDED, message: '下载次数已达上限' } }, 403);
  }

  const file = await db.select().from(files).where(eq(files.id, share.fileId)).get();
  if (!file) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件不存在' } }, 404);
  if (file.isFolder) return c.json({ success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: '无法下载文件夹' } }, 400);

  const r2Object = await c.env.FILES.get(file.r2Key);
  if (!r2Object) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件内容不存在' } }, 404);

  await db.update(shares).set({ downloadCount: share.downloadCount + 1 }).where(eq(shares.id, shareId));

  return new Response(r2Object.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'Content-Length': file.size.toString(),
    },
  });
});

export default app;
