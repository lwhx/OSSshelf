import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').default('user').notNull(),
  storageQuota: integer('storage_quota').default(10737418240).notNull(),
  storageUsed: integer('storage_used').default(0).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  name: text('name').notNull(),
  path: text('path').notNull(),
  type: text('type'),
  size: integer('size').default(0).notNull(),
  r2Key: text('r2_key').notNull(),
  mimeType: text('mime_type'),
  hash: text('hash'),
  isFolder: integer('is_folder', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const shares = sqliteTable('shares', {
  id: text('id').primaryKey(),
  fileId: text('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  password: text('password'),
  expiresAt: text('expires_at'),
  downloadLimit: integer('download_limit'),
  downloadCount: integer('download_count').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

export const webdavSessions = sqliteTable('webdav_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});
