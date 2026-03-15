import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { files, shares } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { ERROR_CODES, SHARE_DEFAULT_EXPIRY } from '@r2shelf/shared';
import type { Env } from '../types/env';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env }>();

const createShareSchema = z.object({
  fileId: z.string().min(1, '文件ID不能为空'),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
  downloadLimit: z.number().int().min(1).optional(),
});

app.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const result = createShareSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: result.error.errors[0].message,
      },
    }, 400);
  }
  
  const { fileId, password, expiresAt, downloadLimit } = result.data;
  
  const file = await c.env.DB.select().from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId!)))
    .get();
  
  if (!file) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: '文件不存在',
      },
    }, 404);
  }
  
  const shareId = uuidv4();
  const now = new Date().toISOString();
  const expires = expiresAt || new Date(Date.now() + SHARE_DEFAULT_EXPIRY).toISOString();
  
  await c.env.DB.insert(shares).values({
    id: shareId,
    fileId,
    userId: userId!,
    password: password || null,
    expiresAt: expires,
    downloadLimit: downloadLimit || null,
    downloadCount: 0,
    createdAt: now,
  });
  
  return c.json({
    success: true,
    data: {
      id: shareId,
      fileId,
      expiresAt: expires,
      downloadLimit,
      createdAt: now,
      shareUrl: `/api/share/${shareId}`,
    },
  });
});

app.get('/:id', async (c) => {
  const shareId = c.req.param('id');
  const password = c.req.query('password');
  
  const share = await c.env.DB.select().from(shares).where(eq(shares.id, shareId)).get();
  
  if (!share) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: '分享链接不存在',
      },
    }, 404);
  }
  
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.SHARE_EXPIRED,
        message: '分享链接已过期',
      },
    }, 410);
  }
  
  if (share.password && share.password !== password) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.SHARE_PASSWORD_REQUIRED,
        message: '需要密码访问',
      },
    }, 401);
  }
  
  const file = await c.env.DB.select().from(files).where(eq(files.id, share.fileId)).get();
  
  if (!file) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: '文件不存在',
      },
    }, 404);
  }
  
  return c.json({
    success: true,
    data: {
      id: share.id,
      file: {
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        isFolder: file.isFolder,
      },
      expiresAt: share.expiresAt,
      downloadLimit: share.downloadLimit,
      downloadCount: share.downloadCount,
      hasPassword: !!share.password,
    },
  });
});

app.get('/:id/download', async (c) => {
  const shareId = c.req.param('id');
  const password = c.req.query('password');
  
  const share = await c.env.DB.select().from(shares).where(eq(shares.id, shareId)).get();
  
  if (!share) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: '分享链接不存在',
      },
    }, 404);
  }
  
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.SHARE_EXPIRED,
        message: '分享链接已过期',
      },
    }, 410);
  }
  
  if (share.password && share.password !== password) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.SHARE_PASSWORD_INVALID,
        message: '密码错误',
      },
    }, 401);
  }
  
  if (share.downloadLimit && share.downloadCount >= share.downloadLimit) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.SHARE_DOWNLOAD_LIMIT_EXCEEDED,
        message: '下载次数已达上限',
      },
    }, 403);
  }
  
  const file = await c.env.DB.select().from(files).where(eq(files.id, share.fileId)).get();
  
  if (!file) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: '文件不存在',
      },
    }, 404);
  }
  
  if (file.isFolder) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '无法下载文件夹',
      },
    }, 400);
  }
  
  const r2Object = await c.env.FILES.get(file.r2Key);
  
  if (!r2Object) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: '文件内容不存在',
      },
    }, 404);
  }
  
  await c.env.DB.update(shares)
    .set({ downloadCount: share.downloadCount + 1 })
    .where(eq(shares.id, shareId));
  
  return new Response(r2Object.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'Content-Length': file.size.toString(),
    },
  });
});

export default app;
