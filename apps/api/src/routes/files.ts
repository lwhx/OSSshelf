import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, isNull, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { files, users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { ERROR_CODES, MAX_FILE_SIZE, UPLOAD_CHUNK_SIZE } from '@r2shelf/shared';
import type { AppContext } from '../types/env';
import { z } from 'zod';

const app = new Hono<{ Bindings: AppContext['Bindings']; Variables: AppContext['Variables'] }>();

const createFolderSchema = z.object({
  name: z.string().min(1, '文件夹名称不能为空').max(255, '名称过长'),
  parentId: z.string().nullable().optional(),
});

const updateFileSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255, '名称过长').optional(),
  parentId: z.string().nullable().optional(),
});

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const userId = c.get('userId');
  const parentId = c.req.query('parentId') || null;
  const search = c.req.query('search') || '';
  const sortBy = c.req.query('sortBy') || 'createdAt';
  const sortOrder = c.req.query('sortOrder') || 'desc';
  
  let query = c.env.DB.select().from(files).where(eq(files.userId, userId!));
  
  if (parentId) {
    query = query.where(eq(files.parentId, parentId));
  } else {
    query = query.where(isNull(files.parentId));
  }
  
  if (search) {
    query = query.where(like(files.name, `%${search}%`));
  }
  
  const items = await query.all();
  
  const sortedItems = items.sort((a, b) => {
    const aVal = a[sortBy as keyof typeof a];
    const bVal = b[sortBy as keyof typeof b];
    if (sortOrder === 'asc') {
      return aVal! > bVal! ? 1 : -1;
    }
    return aVal! < bVal! ? 1 : -1;
  });
  
  return c.json({
    success: true,
    data: sortedItems.map(item => ({
      id: item.id,
      userId: item.userId,
      parentId: item.parentId,
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      r2Key: item.r2Key,
      mimeType: item.mimeType,
      hash: item.hash,
      isFolder: item.isFolder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  });
});

app.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const result = createFolderSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: result.error.errors[0].message,
      },
    }, 400);
  }
  
  const { name, parentId } = result.data;
  
  const existingFolder = await c.env.DB.select().from(files)
    .where(and(
      eq(files.userId, userId!),
      eq(files.name, name),
      parentId ? eq(files.parentId, parentId) : isNull(files.parentId),
      eq(files.isFolder, true)
    ))
    .get();
  
  if (existingFolder) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '同名文件夹已存在',
      },
    }, 400);
  }
  
  const folderId = uuidv4();
  const now = new Date().toISOString();
  const path = parentId ? `${parentId}/${name}` : `/${name}`;
  
  await c.env.DB.insert(files).values({
    id: folderId,
    userId: userId!,
    parentId: parentId || null,
    name,
    path,
    type: 'folder',
    size: 0,
    r2Key: `folders/${folderId}`,
    mimeType: null,
    hash: null,
    isFolder: true,
    createdAt: now,
    updatedAt: now,
  });
  
  return c.json({
    success: true,
    data: {
      id: folderId,
      userId: userId!,
      parentId: parentId || null,
      name,
      path,
      type: 'folder',
      size: 0,
      r2Key: `folders/${folderId}`,
      mimeType: null,
      hash: null,
      isFolder: true,
      createdAt: now,
      updatedAt: now,
    },
  });
});

app.get('/:id', async (c) => {
  const userId = c.get('userId');
  const fileId = c.req.param('id');
  
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
  
  return c.json({
    success: true,
    data: {
      id: file.id,
      userId: file.userId,
      parentId: file.parentId,
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size,
      r2Key: file.r2Key,
      mimeType: file.mimeType,
      hash: file.hash,
      isFolder: file.isFolder,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    },
  });
});

app.put('/:id', async (c) => {
  const userId = c.get('userId');
  const fileId = c.req.param('id');
  const body = await c.req.json();
  const result = updateFileSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: result.error.errors[0].message,
      },
    }, 400);
  }
  
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
  
  const { name, parentId } = result.data;
  const now = new Date().toISOString();
  
  const updateData: Record<string, unknown> = { updatedAt: now };
  
  if (name) {
    updateData.name = name;
    updateData.path = parentId ? `${parentId}/${name}` : `/${name}`;
  }
  
  if (parentId !== undefined) {
    updateData.parentId = parentId || null;
    updateData.path = parentId ? `${parentId}/${file.name}` : `/${file.name}`;
  }
  
  await c.env.DB.update(files).set(updateData).where(eq(files.id, fileId));
  
  return c.json({
    success: true,
    data: { message: '更新成功' },
  });
});

app.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const fileId = c.req.param('id');
  
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
  
  if (!file.isFolder) {
    await c.env.FILES.delete(file.r2Key);
    
    const user = await c.env.DB.select().from(users).where(eq(users.id, userId!)).get();
    if (user) {
      await c.env.DB.update(users)
        .set({ storageUsed: Math.max(0, user.storageUsed - file.size), updatedAt: new Date().toISOString() })
        .where(eq(users.id, userId!));
    }
  }
  
  await c.env.DB.delete(files).where(eq(files.id, fileId));
  
  return c.json({
    success: true,
    data: { message: '删除成功' },
  });
});

app.post('/upload', async (c) => {
  const userId = c.get('userId');
  const contentType = c.req.header('Content-Type') || '';
  
  if (!contentType.includes('multipart/form-data')) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '请使用 multipart/form-data 格式上传',
      },
    }, 400);
  }
  
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const parentId = formData.get('parentId') as string | null;
  
  if (!file) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '请选择要上传的文件',
      },
    }, 400);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.FILE_TOO_LARGE,
        message: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB）`,
      },
    }, 400);
  }
  
  const user = await c.env.DB.select().from(users).where(eq(users.id, userId!)).get();
  
  if (user && user.storageUsed + file.size > user.storageQuota) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.STORAGE_EXCEEDED,
        message: '存储空间不足',
      },
    }, 400);
  }
  
  const fileId = uuidv4();
  const now = new Date().toISOString();
  const r2Key = `files/${userId}/${fileId}/${file.name}`;
  const path = parentId ? `${parentId}/${file.name}` : `/${file.name}`;
  
  await c.env.FILES.put(r2Key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      userId: userId!,
      originalName: file.name,
    },
  });
  
  await c.env.DB.insert(files).values({
    id: fileId,
    userId: userId!,
    parentId: parentId || null,
    name: file.name,
    path,
    type: 'file',
    size: file.size,
    r2Key,
    mimeType: file.type,
    hash: null,
    isFolder: false,
    createdAt: now,
    updatedAt: now,
  });
  
  if (user) {
    await c.env.DB.update(users)
      .set({ storageUsed: user.storageUsed + file.size, updatedAt: now })
      .where(eq(users.id, userId!));
  }
  
  return c.json({
    success: true,
    data: {
      id: fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      path,
      createdAt: now,
    },
  });
});

app.get('/:id/download', async (c) => {
  const userId = c.get('userId');
  const fileId = c.req.param('id');
  
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
  
  return new Response(r2Object.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'Content-Length': file.size.toString(),
    },
  });
});

app.get('/:id/preview', async (c) => {
  const userId = c.get('userId');
  const fileId = c.req.param('id');
  
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
  
  if (file.isFolder) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '无法预览文件夹',
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
  
  const isPreviewable = file.mimeType?.startsWith('image/') || 
                         file.mimeType?.startsWith('video/') || 
                         file.mimeType?.startsWith('audio/') ||
                         file.mimeType === 'application/pdf' ||
                         file.mimeType?.startsWith('text/');
  
  if (!isPreviewable) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '该文件类型不支持预览',
      },
    }, 400);
  }
  
  return new Response(r2Object.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Length': file.size.toString(),
    },
  });
});

export default app;
