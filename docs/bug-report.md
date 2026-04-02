# OSSShelf Bug 清单（v3.2.0 - v4.0.0）

> 按严重程度排序：🔴 高危 → 🟠 中危 → 🟡 低危  
> 本次为全量审查，覆盖 auth / files / share / permissions / versions / notes / notifications / groups / admin / analytics / v1 全部路由。

---

## 🔴 高危

### BUG-01｜文件上传/创建：未校验 `parentId` 的写入权限

**版本：** v3.2.0  
**文件：** `apps/api/src/routes/files.ts` — `POST /upload`、`POST /create`

上传文件和直接创建文件时，只对 `parentId` 做了 MIME 类型限制检查，没有调用 `checkFilePermission` 验证当前用户是否对 `parentId` 拥有 `write` 权限。任何登录用户都可以向他人的目录写文件。

---

### BUG-02｜笔记接口：未校验用户对目标文件的访问权限

**版本：** v3.5.0  
**文件：** `apps/api/src/routes/notes.ts` — `GET /:fileId`、`POST /:fileId`

读取笔记和创建笔记时，只验证文件是否存在，未调用 `checkFilePermission`。任何登录用户都可以读取或向私有文件写入笔记。

---

### BUG-03｜`/me` 接口未返回 `emailVerified` 字段（同 login 接口）

**版本：** v4.0.0  
**文件：** `apps/api/src/routes/auth.ts` — `GET /me`、`POST /login`

`/me` 和 `/login` 的返回体均无 `emailVerified` 字段。前端 store 通过 `initialize()` 刷新后 `user.emailVerified` 始终为 `undefined`，导致验证完成后横幅和设置页仍显示未验证。

**修复：** 两个接口的返回 user 对象中均加入 `emailVerified: user.emailVerified`。

---

### BUG-04｜`confirm-change-email`：新邮箱未重置 `emailVerified`

**版本：** v4.0.0  
**文件：** `apps/api/src/routes/auth.ts` — `GET /confirm-change-email`

更换邮箱确认后，只更新了 `email` 字段，`emailVerified` 保持旧值 `true`，新邮箱实际未经验证。

**修复：** `set({ email: tokenRecord.email!, emailVerified: false, updatedAt: now })`

---

### BUG-05｜通知路由顺序错误：`/read-all` 和 `/read`（清除已读）永远无法命中

**版本：** v3.8.0  
**文件：** `apps/api/src/routes/notifications.ts`

Hono 顺序匹配：

- `PUT /read-all` 在 `PUT /:id/read` 之后注册，`read-all` 被当作 `:id`，**全部标记已读**功能完全失效。
- `DELETE /read` 在 `DELETE /:id` 之后注册，`read` 被当作 `:id`，**清除已读通知**功能完全失效。

**修复：** 将两个静态路由移到对应参数路由之前。

---

### BUG-06｜文件夹移动后子文件 `path` 未同步更新

**版本：** v3.1.0  
**文件：** `apps/api/src/routes/files.ts` — `POST /:id/move`

移动文件夹时只更新了自身的 `parentId` 和 `path`，子文件的 `path` 字段仍保留旧的父目录 ID 前缀。后续所有依赖 `path.startsWith` 的逻辑均会失效，包括：

- 回收站恢复（`trash/:id/restore`）
- 永久删除（`trash/:id`）
- 权限批量继承（`permissions/grant` 对文件夹授权时）

---

## 🟠 中危

### BUG-07｜`PUT /:id/content` 编辑文件内容后未递增 `currentVersion`

**版本：** v3.5.0  
**文件：** `apps/api/src/routes/files.ts` — `PUT /:id/content`

每次编辑使用 `currentVersion + 1` 生成新的 r2Key（如 `v2_filename`），但 DB 更新时没有 `set({ currentVersion: currentVersion + 1 })`。结果：

1. `currentVersion` 永远停在初始值，每次写入都覆盖同一个 r2Key（版本号形同虚设）。
2. 旧存储对象不会被清理（存储泄漏）。

**修复：** DB `update` 加入 `currentVersion: currentVersion + 1`。

---

### BUG-08｜重发/重置/更换邮件前未作废旧 Token

**版本：** v4.0.0  
**文件：** `apps/api/src/routes/auth.ts` — `resend-verification`、`forgot-password`、`change-email`

每次请求都会 insert 新 Token，旧同类型 Token 仍然有效。`reset_password` 和 `change_email` 类型存在安全隐患（旧链接可继续使用）。

**修复：** insert 前将该用户同类型未使用的 Token 全部标记 `usedAt`：

```sql
UPDATE email_tokens SET used_at = now WHERE user_id = ? AND type = ? AND used_at IS NULL
```

---

### BUG-09｜`forgot-password` 缺少限流

**版本：** v4.0.0  
**文件：** `apps/api/src/routes/auth.ts` — `POST /forgot-password`

`resend-verification` 有 KV 1分钟限流，`forgot-password` 没有，可被用来对任意邮箱地址发动邮件轰炸。

**修复：** 加 KV 限流 key `rate:forgot:<email>`，TTL 60s，逻辑同 `resend-verification`。

---

### BUG-10｜版本下载接口不支持原生 R2（`env.FILES`）

**版本：** v3.3.0  
**文件：** `apps/api/src/routes/versions.ts` — `GET /:fileId/versions/:version/download`

接口要求文件必须有 `bucketId`（S3），否则直接 `throwAppError('BUCKET_NOT_FOUND')`。使用原生 R2（`env.FILES`）存储的用户无法下载任何历史版本。

---

### BUG-11｜`isStarred` 为文件全局字段，非用户维度收藏

**版本：** v3.8.0  
**文件：** `apps/api/src/routes/files.ts`

`is_starred` 存在 `files` 表，是全局状态。任何对文件有 `read` 权限的用户都可以调用 `POST/DELETE /:id/star` 修改该文件的收藏状态，影响文件所有者的收藏视图。

**修复方向：** 新增 `user_stars(user_id, file_id)` 关联表。

---

### BUG-12｜文件移动：未校验 `targetParentId` 的写入权限

**版本：** v3.1.0  
**文件：** `apps/api/src/routes/files.ts` — `POST /:id/move`

移动文件时只校验了文件自身归属（`eq(files.userId, userId)`），未对 `targetParentId` 做 `checkFilePermission(write)` 校验。用户可将自己的文件移动到他人目录下。

---

### BUG-13｜`tags/batch`：未校验用户对文件的访问权限

**版本：** v3.6.0  
**文件：** `apps/api/src/routes/permissions.ts` — `POST /tags/batch`

接口接收任意 `fileIds` 数组，直接查询对应标签返回，没有权限校验。任何登录用户可查询任意文件 ID 的标签信息。

---

### BUG-14｜`tags/remove`：删除标签未过滤 `userId`，可删除他人的标签

**版本：** v3.6.0  
**文件：** `apps/api/src/routes/permissions.ts` — `POST /tags/remove`

删除操作：

```ts
await db.delete(fileTags).where(and(eq(fileTags.fileId, fileId), eq(fileTags.name, tagName)));
```

没有 `eq(fileTags.userId, userId)` 过滤。任何对文件有 `write` 权限的用户都可以删除其他用户给该文件打的标签。

**修复：** 加入 `eq(fileTags.userId, userId)` 条件。

---

### BUG-15｜上传链接 `uploadCount` 非原子更新，存在竞态条件

**版本：** v3.1.0  
**文件：** `apps/api/src/routes/share.ts` — `POST /upload/:token`

```ts
.set({ uploadCount: share.uploadCount + 1 })  // JS 读后写，非原子
```

`downloadCount` 用的是 `sql\`${shares.downloadCount} + 1\``是原子的，但`uploadCount` 没有。并发上传时计数会丢失。

**修复：** 改为 `sql\`${shares.uploadCount} + 1\``。

---

## 🟡 低危

### BUG-16｜`noteCount` 减法 SQL 语法在 SQLite 中无效

**版本：** v3.5.0  
**文件：** `apps/api/src/routes/notes.ts` — `DELETE /:fileId/:noteId`

```ts
sql`MAX(0, ${files.noteCount} - ${deletedCount})`;
```

SQLite `MAX()` 是聚合函数，不能在 `UPDATE SET` 中作为标量函数使用，会导致运行时错误。

**修复：**

```ts
sql`CASE WHEN ${files.noteCount} > ${deletedCount} THEN ${files.noteCount} - ${deletedCount} ELSE 0 END`;
```

---

### BUG-17｜`email_tokens` 过期记录无定时清理

**版本：** v4.0.0  
**文件：** `apps/api/src/routes/cron.ts`

cron 清理了回收站、分享、直链、上传任务，但没有清理 `email_tokens` 表中过期或已使用的 Token，长期运行后表无限膨胀。

**修复：** 在任意 cron 任务中加入：

```sql
DELETE FROM email_tokens WHERE expires_at < now OR used_at IS NOT NULL
```

---

### BUG-18｜版本 diff 接口权限校验不走权限系统

**版本：** v3.3.0  
**文件：** `apps/api/src/routes/versions.ts` — `GET /:fileId/versions/diff`

diff 接口用 `file.userId !== userId` 直接拒绝，未调用 `checkFilePermission`。被授权访问该文件的协作用户无法使用版本对比，与 `GET /versions` 的行为不一致。

---

### BUG-19｜`v1/me` 的 `storageUsed` 包含已删除文件

**版本：** v3.6.0  
**文件：** `apps/api/src/routes/v1/me.ts`

```ts
.from(files).where(eq(files.userId, userId))  // 未过滤 deletedAt
```

计算存储用量时没有加 `isNull(files.deletedAt)`，已移入回收站的文件仍被计入，导致统计偏高。

---

### BUG-20｜`checkFilePermission` 的 fallback 路径（无 `env`）不检查权限过期

**版本：** v3.6.0  
**文件：** `apps/api/src/routes/permissions.ts` — `checkFilePermission`

当调用方不传 `env` 时（如 `versions.ts` 中的调用），函数走 fallback 直接查 DB，没有检查 `expiresAt`。已过期的权限记录仍会被认为有效。

---

### BUG-21｜笔记删除：`noteCount` 子笔记计数时序问题

**版本：** v3.5.0  
**文件：** `apps/api/src/routes/notes.ts` — `DELETE /:fileId/:noteId`

先软删子笔记，再查 `deletedAt = now` 的子笔记数计算 `deletedCount`，由于时间精度或并发问题可能查到数量不准，导致 `noteCount` 偏差。

**修复：** 先 count 再删，或在删除前记录数量。
