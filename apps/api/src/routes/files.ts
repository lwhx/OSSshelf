import { Hono } from 'hono';
import { eq, and, isNull, like } from 'drizzle-orm';
import { getDb, files, users } from '../db';
import { authMiddleware } from '../middleware/auth';
import { ERROR_CODES, MAX_FILE_SIZE } from '@r2shelf/shared';
import type { Env, Variables } from '../types/env';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const createFolderSchema = z.object({
  name: z.string().min(1, '文件夹名称不能为空').max(255, '名称过长'),
  parentId: z.string().nullable().optional(),
});

const updateFileSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255, '名称过长').optional(),
  parentId: z.string().nullable().optional(),
});

app.use('*', authMiddleware);

// ── Upload must be registered BEFORE /:id ─────────────────────────────────
app.post('/upload', async (c) => {
  const userId = c.get('userId')!;
  const contentType = c.req.header('Content-Type') || '';

  if (!contentType.includes('multipart/form-data')) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: '请使用 multipart/form-data 格式上传' } },
      400,
    );
  }

  const formData = await c.req.formData();
  const uploadFile = formData.get('file') as File | null;
  const parentId = formData.get('parentId') as string | null;

  if (!uploadFile) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: '请选择要上传的文件' } },
      400,
    );
  }

  if (uploadFile.size > MAX_FILE_SIZE) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.FILE_TOO_LARGE, message: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB）` } },
      400,
    );
  }

  const db = getDb(c.env.DB);
  const user = await db.select().from(users).where(eq(users.id, userId)).get();

  if (user && user.storageUsed + uploadFile.size > user.storageQuota) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.STORAGE_EXCEEDED, message: '存储空间不足' } },
      400,
    );
  }

  const fileId = crypto.randomUUID();
  const now = new Date().toISOString();
  const r2Key = `files/${userId}/${fileId}/${uploadFile.name}`;
  const path = parentId ? `${parentId}/${uploadFile.name}` : `/${uploadFile.name}`;

  await c.env.FILES.put(r2Key, uploadFile.stream(), {
    httpMetadata: { contentType: uploadFile.type },
    customMetadata: { userId, originalName: uploadFile.name },
  });

  await db.insert(files).values({
    id: fileId,
    userId,
    parentId: parentId || null,
    name: uploadFile.name,
    path,
    type: 'file',
    size: uploadFile.size,
    r2Key,
    mimeType: uploadFile.type || null,
    hash: null,
    isFolder: false,
    createdAt: now,
    updatedAt: now,
  });

  if (user) {
    await db.update(users)
      .set({ storageUsed: user.storageUsed + uploadFile.size, updatedAt: now })
      .where(eq(users.id, userId));
  }

  return c.json({
    success: true,
    data: { id: fileId, name: uploadFile.name, size: uploadFile.size, mimeType: uploadFile.type, path, createdAt: now },
  });
});

// ── List files ────────────────────────────────────────────────────────────
app.get('/', async (c) => {
  const userId = c.get('userId')!;
  const parentId = c.req.query('parentId') || null;
  const search = c.req.query('search') || '';
  const sortBy = (c.req.query('sortBy') || 'createdAt') as keyof typeof files.$inferSelect;
  const sortOrder = c.req.query('sortOrder') || 'desc';

  const db = getDb(c.env.DB);

  const conditions = [eq(files.userId, userId)];
  if (parentId) {
    conditions.push(eq(files.parentId, parentId));
  } else {
    conditions.push(isNull(files.parentId));
  }
  if (search) {
    conditions.push(like(files.name, `%${search}%`));
  }

  const items = await db.select().from(files).where(and(...conditions)).all();

  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortBy] ?? '';
    const bVal = b[sortBy] ?? '';
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  return c.json({ success: true, data: sorted });
});

// ── Create folder ─────────────────────────────────────────────────────────
app.post('/', async (c) => {
  const userId = c.get('userId')!;
  const body = await c.req.json();
  const result = createFolderSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: result.error.errors[0].message } },
      400,
    );
  }

  const { name, parentId } = result.data;
  const db = getDb(c.env.DB);

  const existing = await db.select().from(files)
    .where(and(
      eq(files.userId, userId),
      eq(files.name, name),
      parentId ? eq(files.parentId, parentId) : isNull(files.parentId),
      eq(files.isFolder, true),
    )).get();

  if (existing) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: '同名文件夹已存在' } },
      400,
    );
  }

  const folderId = crypto.randomUUID();
  const now = new Date().toISOString();
  const path = parentId ? `${parentId}/${name}` : `/${name}`;

  const newFolder = {
    id: folderId, userId, parentId: parentId || null, name, path,
    type: 'folder', size: 0, r2Key: `folders/${folderId}`,
    mimeType: null, hash: null, isFolder: true, createdAt: now, updatedAt: now,
  };

  await db.insert(files).values(newFolder);

  return c.json({ success: true, data: newFolder });
});

// ── Get single file ───────────────────────────────────────────────────────
app.get('/:id', async (c) => {
  const userId = c.get('userId')!;
  const fileId = c.req.param('id');
  const db = getDb(c.env.DB);

  const file = await db.select().from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId))).get();

  if (!file) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件不存在' } },
      404,
    );
  }

  return c.json({ success: true, data: file });
});

// ── Update file/folder ────────────────────────────────────────────────────
app.put('/:id', async (c) => {
  const userId = c.get('userId')!;
  const fileId = c.req.param('id');
  const body = await c.req.json();
  const result = updateFileSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: result.error.errors[0].message } },
      400,
    );
  }

  const db = getDb(c.env.DB);
  const file = await db.select().from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId))).get();

  if (!file) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件不存在' } },
      404,
    );
  }

  const { name, parentId } = result.data;
  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = { updatedAt: now };

  if (name) {
    updateData.name = name;
    updateData.path = parentId !== undefined
      ? (parentId ? `${parentId}/${name}` : `/${name}`)
      : (file.parentId ? `${file.parentId}/${name}` : `/${name}`);
  }

  if (parentId !== undefined) {
    updateData.parentId = parentId || null;
    const effectiveName = (name as string | undefined) || file.name;
    updateData.path = parentId ? `${parentId}/${effectiveName}` : `/${effectiveName}`;
  }

  await db.update(files).set(updateData).where(eq(files.id, fileId));

  return c.json({ success: true, data: { message: '更新成功' } });
});

// ── Delete file/folder ────────────────────────────────────────────────────
app.delete('/:id', async (c) => {
  const userId = c.get('userId')!;
  const fileId = c.req.param('id');
  const db = getDb(c.env.DB);

  const file = await db.select().from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId))).get();

  if (!file) {
    return c.json(
      { success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件不存在' } },
      404,
    );
  }

  if (!file.isFolder) {
    await c.env.FILES.delete(file.r2Key);
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (user) {
      await db.update(users)
        .set({ storageUsed: Math.max(0, user.storageUsed - file.size), updatedAt: new Date().toISOString() })
        .where(eq(users.id, userId));
    }
  }

  await db.delete(files).where(eq(files.id, fileId));

  return c.json({ success: true, data: { message: '删除成功' } });
});

// ── Download ──────────────────────────────────────────────────────────────
app.get('/:id/download', async (c) => {
  const userId = c.get('userId')!;
  const fileId = c.req.param('id');
  const db = getDb(c.env.DB);

  const file = await db.select().from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId))).get();

  if (!file) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件不存在' } }, 404);
  if (file.isFolder) return c.json({ success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: '无法下载文件夹' } }, 400);

  const r2Object = await c.env.FILES.get(file.r2Key);
  if (!r2Object) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件内容不存在' } }, 404);

  return new Response(r2Object.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'Content-Length': file.size.toString(),
    },
  });
});

// ── Preview ───────────────────────────────────────────────────────────────
app.get('/:id/preview', async (c) => {
  const userId = c.get('userId')!;
  const fileId = c.req.param('id');
  const db = getDb(c.env.DB);

  const file = await db.select().from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId))).get();

  if (!file) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件不存在' } }, 404);
  if (file.isFolder) return c.json({ success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: '无法预览文件夹' } }, 400);

  const previewable =
    file.mimeType?.startsWith('image/') ||
    file.mimeType?.startsWith('video/') ||
    file.mimeType?.startsWith('audio/') ||
    file.mimeType === 'application/pdf' ||
    file.mimeType?.startsWith('text/');

  if (!previewable) {
    return c.json({ success: false, error: { code: ERROR_CODES.VALIDATION_ERROR, message: '该文件类型不支持预览' } }, 400);
  }

  const r2Object = await c.env.FILES.get(file.r2Key);
  if (!r2Object) return c.json({ success: false, error: { code: ERROR_CODES.NOT_FOUND, message: '文件内容不存在' } }, 404);

  return new Response(r2Object.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Length': file.size.toString(),
    },
  });
});

export default app;
