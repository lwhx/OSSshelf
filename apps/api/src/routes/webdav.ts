import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, isNull } from 'drizzle-orm';
import { files, users, webdavSessions } from '../db/schema';
import { WEBDAV_SESSION_EXPIRY, ERROR_CODES } from '@r2shelf/shared';
import type { Env } from '../types/env';
import { compare } from 'bcryptjs';

const app = new Hono<{ Bindings: Env }>();

async function webdavAuth(c: typeof app extends Hono<{ Bindings: Env }> ? Hono<{ Bindings: Env }> : never): Promise<{ userId: string; email: string } | null> {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }
  
  const credentials = atob(authHeader.slice(6));
  const [email, password] = credentials.split(':');
  
  if (!email || !password) {
    return null;
  }
  
  const user = await c.env.DB.select().from(users).where(eq(users.email, email)).get();
  
  if (!user) {
    return null;
  }
  
  const isValid = await compare(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }
  
  return { userId: user.id, email: user.email };
}

function generateWebDAVXML(files: typeof files extends { $inferSelect: infer T } ? T[] : never[], basePath: string): string {
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<multistatus xmlns="DAV:">`;
  
  for (const file of files) {
    const href = `${basePath}${file.path}`;
    const isDirectory = file.isFolder;
    
    xml += `
  <response>
    <href>${escapeXml(href)}</href>
    <propstat>
      <prop>
        <displayname>${escapeXml(file.name)}</displayname>
        <getcontentlength>${file.size}</getcontentlength>
        <getlastmodified>${file.updatedAt}</getlastmodified>
        <creationdate>${file.createdAt}</creationdate>
        <resourcetype>${isDirectory ? '<collection/>' : ''}</resourcetype>
        <getcontenttype>${file.mimeType || 'application/octet-stream'}</getcontenttype>
      </prop>
      <status>HTTP/1.1 200 OK</status>
    </propstat>
  </response>`;
  }
  
  xml += `
</multistatus>`;
  
  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

app.use('*', async (c, next) => {
  const authResult = await webdavAuth(c);
  
  if (!authResult) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="R2Shelf WebDAV"',
      },
    });
  }
  
  c.set('userId', authResult.userId);
  await next();
});

app.route('/*', async (c) => {
  const method = c.req.method;
  const userId = c.get('userId');
  const path = c.req.path.replace('/dav', '') || '/';
  
  switch (method) {
    case 'PROPFIND':
      return handlePropfind(c, userId!, path);
    case 'GET':
    case 'HEAD':
      return handleGet(c, userId!, path);
    case 'PUT':
      return handlePut(c, userId!, path);
    case 'MKCOL':
      return handleMkcol(c, userId!, path);
    case 'DELETE':
      return handleDelete(c, userId!, path);
    case 'MOVE':
      return handleMove(c, userId!, path);
    case 'COPY':
      return handleCopy(c, userId!, path);
    default:
      return c.json({ error: 'Method not allowed' }, 405);
  }
});

async function handlePropfind(c: typeof app extends Hono<{ Bindings: Env }> ? Hono<{ Bindings: Env }> : never, userId: string, path: string) {
  const depth = c.req.header('Depth') || '1';
  
  const pathParts = path.split('/').filter(Boolean);
  const currentPath = path === '/' ? '/' : path;
  
  let parentCondition;
  if (path === '/') {
    parentCondition = isNull(files.parentId);
  } else {
    const parentFolder = await c.env.DB.select().from(files)
      .where(and(eq(files.userId, userId), eq(files.path, currentPath)))
      .get();
    
    if (!parentFolder) {
      return new Response('Not Found', { status: 404 });
    }
    parentCondition = eq(files.parentId, parentFolder.id);
  }
  
  const items = await c.env.DB.select().from(files)
    .where(and(eq(files.userId, userId), parentCondition))
    .all();
  
  if (depth === '0') {
    const currentFolder = await c.env.DB.select().from(files)
      .where(and(eq(files.userId, userId), eq(files.path, currentPath)))
      .get();
    
    if (currentFolder) {
      items.unshift(currentFolder);
    }
  }
  
  const xml = generateWebDAVXML(items, '/dav');
  
  return new Response(xml, {
    status: 207,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

async function handleGet(c: typeof app extends Hono<{ Bindings: Env }> ? Hono<{ Bindings: Env }> : never, userId: string, path: string) {
  const file = await c.env.DB.select().from(files)
    .where(and(eq(files.userId, userId), eq(files.path, path)))
    .get();
  
  if (!file) {
    return new Response('Not Found', { status: 404 });
  }
  
  if (file.isFolder) {
    return new Response('Cannot GET a collection', { status: 400 });
  }
  
  const r2Object = await c.env.FILES.get(file.r2Key);
  
  if (!r2Object) {
    return new Response('Not Found', { status: 404 });
  }
  
  return new Response(r2Object.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Length': file.size.toString(),
    },
  });
}

async function handlePut(c: typeof app extends Hono<{ Bindings: Env }> ? Hono<{ Bindings: Env }> : never, userId: string, path: string) {
  const body = await c.req.arrayBuffer();
  const fileName = path.split('/').pop() || 'untitled';
  const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
  
  let parentId: string | null = null;
  
  if (parentPath !== '/') {
    const parentFolder = await c.env.DB.select().from(files)
      .where(and(eq(files.userId, userId), eq(files.path, parentPath)))
      .get();
    
    if (!parentFolder) {
      return new Response('Parent folder not found', { status: 409 });
    }
    parentId = parentFolder.id;
  }
  
  const existingFile = await c.env.DB.select().from(files)
    .where(and(eq(files.userId, userId), eq(files.path, path)))
    .get();
  
  const fileId = existingFile?.id || uuidv4();
  const now = new Date().toISOString();
  const r2Key = `files/${userId}/${fileId}/${fileName}`;
  
  await c.env.FILES.put(r2Key, body, {
    httpMetadata: {
      contentType: c.req.header('Content-Type') || 'application/octet-stream',
    },
  });
  
  if (existingFile) {
    await c.env.DB.update(files)
      .set({
        size: body.byteLength,
        mimeType: c.req.header('Content-Type') || 'application/octet-stream',
        updatedAt: now,
      })
      .where(eq(files.id, fileId));
  } else {
    await c.env.DB.insert(files).values({
      id: fileId,
      userId,
      parentId,
      name: fileName,
      path,
      type: 'file',
      size: body.byteLength,
      r2Key,
      mimeType: c.req.header('Content-Type') || 'application/octet-stream',
      hash: null,
      isFolder: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return new Response(null, { status: 201 });
}

async function handleMkcol(c: typeof app extends Hono<{ Bindings: Env }> ? Hono<{ Bindings: Env }> : never, userId: string, path: string) {
  const folderName = path.split('/').pop() || 'untitled';
  const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
  
  let parentId: string | null = null;
  
  if (parentPath !== '/') {
    const parentFolder = await c.env.DB.select().from(files)
      .where(and(eq(files.userId, userId), eq(files.path, parentPath)))
      .get();
    
    if (!parentFolder) {
      return new Response('Parent folder not found', { status: 409 });
    }
    parentId = parentFolder.id;
  }
  
  const existingFolder = await c.env.DB.select().from(files)
    .where(and(eq(files.userId, userId), eq(files.path, path)))
    .get();
  
  if (existingFolder) {
    return new Response('Already exists', { status: 405 });
  }
  
  const folderId = uuidv4();
  const now = new Date().toISOString();
  
  await c.env.DB.insert(files).values({
    id: folderId,
    userId,
    parentId,
    name: folderName,
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
  
  return new Response(null, { status: 201 });
}

async function handleDelete(c: typeof app extends Hono<{ Bindings: Env }> ? Hono<{ Bindings: Env }> : never, userId: string, path: string) {
  const file = await c.env.DB.select().from(files)
    .where(and(eq(files.userId, userId), eq(files.path, path)))
    .get();
  
  if (!file) {
    return new Response('Not Found', { status: 404 });
  }
  
  if (!file.isFolder) {
    await c.env.FILES.delete(file.r2Key);
  }
  
  await c.env.DB.delete(files).where(eq(files.id, file.id));
  
  return new Response(null, { status: 204 });
}

async function handleMove(c: typeof app extends Hono<{ Bindings: Env }> ? Hono<{ Bindings: Env }> : never, userId: string, path: string) {
  const destination = c.req.header('Destination');
  
  if (!destination) {
    return new Response('Destination header required', { status: 400 });
  }
  
  const destPath = destination.replace(/.*\/dav/, '');
  
  const file = await c.env.DB.select().from(files)
    .where(and(eq(files.userId, userId), eq(files.path, path)))
    .get();
  
  if (!file) {
    return new Response('Not Found', { status: 404 });
  }
  
  const newName = destPath.split('/').pop() || file.name;
  
  await c.env.DB.update(files)
    .set({
      name: newName,
      path: destPath,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(files.id, file.id));
  
  return new Response(null, { status: 201 });
}

async function handleCopy(c: typeof app extends Hono<{ Bindings: Env }> ? Hono<{ Bindings: Env }> : never, userId: string, path: string) {
  const destination = c.req.header('Destination');
  
  if (!destination) {
    return new Response('Destination header required', { status: 400 });
  }
  
  const destPath = destination.replace(/.*\/dav/, '');
  
  const file = await c.env.DB.select().from(files)
    .where(and(eq(files.userId, userId), eq(files.path, path)))
    .get();
  
  if (!file) {
    return new Response('Not Found', { status: 404 });
  }
  
  const newName = destPath.split('/').pop() || file.name;
  const newId = uuidv4();
  const now = new Date().toISOString();
  
  if (!file.isFolder) {
    const r2Object = await c.env.FILES.get(file.r2Key);
    
    if (r2Object) {
      const newR2Key = `files/${userId}/${newId}/${newName}`;
      await c.env.FILES.put(newR2Key, r2Object.body, {
        httpMetadata: {
          contentType: file.mimeType || 'application/octet-stream',
        },
      });
      
      await c.env.DB.insert(files).values({
        id: newId,
        userId,
        parentId: file.parentId,
        name: newName,
        path: destPath,
        type: 'file',
        size: file.size,
        r2Key: newR2Key,
        mimeType: file.mimeType,
        hash: file.hash,
        isFolder: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  
  return new Response(null, { status: 201 });
}

export default app;
