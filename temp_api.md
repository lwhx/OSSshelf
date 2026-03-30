# OSSshelf API 鏂囨。

鏈枃妗ｅ熀浜庨」鐩疄闄呰矾鐢变唬鐮侊紝璇︾粏鎻忚堪 OSSshelf 鐨勬墍鏈?API 鎺ュ彛銆?
**褰撳墠鐗堟湰**: v3.4.0

---

## 馃搵 鐩綍

- [鍩虹淇℃伅](#鍩虹淇℃伅)
- [璁よ瘉鎺ュ彛](#璁よ瘉鎺ュ彛)
- [鏂囦欢鎺ュ彛](#鏂囦欢鎺ュ彛)
- [鍥炴敹绔欐帴鍙(#鍥炴敹绔欐帴鍙?
- [瀛樺偍妗舵帴鍙(#瀛樺偍妗舵帴鍙?
- [Telegram 鎺ュ彛](#telegram-鎺ュ彛)
- [瀛樺偍妗惰縼绉绘帴鍙(#瀛樺偍妗惰縼绉绘帴鍙?
- [棰勭鍚嶄笂浼犳帴鍙(#棰勭鍚嶄笂浼犳帴鍙?
- [鍒嗕韩鎺ュ彛](#鍒嗕韩鎺ュ彛)
- [鏂囦欢鐩撮摼鎺ュ彛](#鏂囦欢鐩撮摼鎺ュ彛)
- [鎵归噺鎿嶄綔鎺ュ彛](#鎵归噺鎿嶄綔鎺ュ彛)
- [鎼滅储鎺ュ彛](#鎼滅储鎺ュ彛)
- [鏉冮檺涓庢爣绛炬帴鍙(#鏉冮檺涓庢爣绛炬帴鍙?
- [涓婁紶浠诲姟鎺ュ彛](#涓婁紶浠诲姟鎺ュ彛)
- [绂荤嚎涓嬭浇鎺ュ彛](#绂荤嚎涓嬭浇鎺ュ彛)
- [棰勮鎺ュ彛](#棰勮鎺ュ彛)
- [鐗堟湰鎺у埗鎺ュ彛](#鐗堟湰鎺у埗鎺ュ彛)
- [绠＄悊鍛樻帴鍙(#绠＄悊鍛樻帴鍙?
- [瀹氭椂浠诲姟鎺ュ彛](#瀹氭椂浠诲姟鎺ュ彛)
- [WebDAV 鎺ュ彛](#webdav-鎺ュ彛)

---

## 鍩虹淇℃伅

### Base URL

```
https://your-api.workers.dev/api
```

### 璁よ瘉鏂瑰紡

- **Bearer Token (JWT)**: 澶у鏁?API 浣跨敤姝ゆ柟寮?- **Basic Auth**: WebDAV 鎺ュ彛浣跨敤姝ゆ柟寮?
### 鍝嶅簲鏍煎紡

JSON

### 缁熶竴鍝嶅簲鏍煎紡

**鎴愬姛鍝嶅簲**:

```json
{
  "success": true,
  "data": { ... }
}
```

**閿欒鍝嶅簲**:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "閿欒鎻忚堪"
  }
}
```

### 閿欒鐮侊紙v3.3.0 缁熶竴绠＄悊锛?
閿欒鐮佸畾涔変簬 `packages/shared/src/constants/errorCodes.ts`锛岄噰鐢ㄥ垎灞傚懡鍚嶅拰鏁板瓧缂栫爜锛?
#### 璁よ瘉鐩稿叧閿欒 (1xxx)

| 閿欒鐮?                      | 鏁板瓧鐮?| 鎻忚堪                     |
| ---------------------------- | ------ | ------------------------ |
| `AUTH_UNAUTHORIZED`          | 1001   | 鏈巿鏉冿紝Token 鏃犳晥鎴栬繃鏈?|
| `AUTH_TOKEN_EXPIRED`         | 1002   | Token 宸茶繃鏈?            |
| `AUTH_PERMISSION_DENIED`     | 1003   | 鏉冮檺涓嶈冻                 |
| `AUTH_LOGIN_LOCKED`          | 1004   | 鐧诲綍宸茶閿佸畾             |
| `AUTH_DEVICE_LIMIT_EXCEEDED` | 1005   | 璁惧鏁伴噺瓒呴檺             |
| `AUTH_INVALID_CREDENTIALS`   | 1006   | 鐢ㄦ埛鍚嶆垨瀵嗙爜閿欒         |

#### 鏂囦欢鐩稿叧閿欒 (2xxx)

| 閿欒鐮?                 | 鏁板瓧鐮?| 鎻忚堪             |
| ----------------------- | ------ | ---------------- |
| `FILE_NOT_FOUND`        | 2001   | 鏂囦欢涓嶅瓨鍦?      |
| `FILE_TOO_LARGE`        | 2002   | 鏂囦欢澶у皬瓒呰繃闄愬埗 |
| `FILE_TYPE_NOT_ALLOWED` | 2003   | 鏂囦欢绫诲瀷涓嶅厑璁?  |
| `FILE_ALREADY_EXISTS`   | 2004   | 鏂囦欢宸插瓨鍦?      |
| `FILE_INVALID_NAME`     | 2005   | 鏂囦欢鍚嶆棤鏁?      |
| `FOLDER_NOT_EMPTY`      | 2006   | 鏂囦欢澶归潪绌?      |

#### 瀛樺偍鐩稿叧閿欒 (3xxx)

| 閿欒鐮?                    | 鏁板瓧鐮?| 鎻忚堪         |
| -------------------------- | ------ | ------------ |
| `STORAGE_EXCEEDED`         | 3001   | 瀛樺偍绌洪棿涓嶈冻 |
| `STORAGE_BUCKET_ERROR`     | 3002   | 瀛樺偍妗堕敊璇?  |
| `STORAGE_BUCKET_NOT_FOUND` | 3003   | 瀛樺偍妗朵笉瀛樺湪 |
| `STORAGE_UPLOAD_FAILED`    | 3004   | 涓婁紶澶辫触     |

#### 鍒嗕韩鐩稿叧閿欒 (4xxx)

| 閿欒鐮?                         | 鏁板瓧鐮?| 鎻忚堪                 |
| ------------------------------- | ------ | -------------------- |
| `SHARE_EXPIRED`                 | 4001   | 鍒嗕韩閾炬帴宸茶繃鏈?      |
| `SHARE_PASSWORD_REQUIRED`       | 4002   | 鍒嗕韩闇€瑕佸瘑鐮?        |
| `SHARE_PASSWORD_INVALID`        | 4003   | 鍒嗕韩瀵嗙爜閿欒         |
| `SHARE_DOWNLOAD_LIMIT_EXCEEDED` | 4004   | 鍒嗕韩涓嬭浇娆℃暟宸茶揪涓婇檺 |
| `SHARE_NOT_FOUND`               | 4005   | 鍒嗕韩涓嶅瓨鍦?          |

#### 鐗堟湰鎺у埗鐩稿叧閿欒 (6xxx) - v3.3.0

| 閿欒鐮?                  | 鏁板瓧鐮?| 鎻忚堪         |
| ------------------------ | ------ | ------------ |
| `VERSION_NOT_FOUND`      | 6001   | 鐗堟湰涓嶅瓨鍦?  |
| `VERSION_RESTORE_FAILED` | 6002   | 鐗堟湰鎭㈠澶辫触 |
| `VERSION_LIMIT_EXCEEDED` | 6003   | 鐗堟湰鏁伴噺瓒呴檺 |

#### 绯荤粺鐩稿叧閿欒 (5xxx)

| 閿欒鐮?            | 鏁板瓧鐮?| 鎻忚堪           |
| ------------------ | ------ | -------------- |
| `VALIDATION_ERROR` | 5001   | 鍙傛暟楠岃瘉澶辫触   |
| `INTERNAL_ERROR`   | 5002   | 鏈嶅姟鍣ㄥ唴閮ㄩ敊璇?|
| `TASK_NOT_FOUND`   | 5003   | 浠诲姟涓嶅瓨鍦?    |
| `TASK_EXPIRED`     | 5004   | 涓婁紶浠诲姟宸茶繃鏈?|
| `INVALID_URL`      | 5005   | URL 鏃犳晥       |

#### 澧炲己閿欒鍝嶅簲鏍煎紡

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "codeNumber": 2002,
    "message": "鏂囦欢澶у皬瓒呰繃闄愬埗",
    "details": {
      "maxSize": 5368709120,
      "actualSize": 6442450944
    },
    "timestamp": "2024-03-24T12:00:00Z",
    "requestId": "req-abc123"
  }
}
```

---

## 璁よ瘉鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/auth.ts`

### 鑾峰彇娉ㄥ唽閰嶇疆

```http
GET /api/auth/registration-config
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "open": true,
    "requireInviteCode": false
  }
}
```

### 鐢ㄦ埛娉ㄥ唽

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "鐢ㄦ埛鍚?,
  "inviteCode": "閭€璇风爜锛堝彲閫夛級"
}
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "鐢ㄦ埛鍚?,
      "role": "user",
      "storageQuota": 10737418240,
      "storageUsed": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token",
    "deviceId": "device-uuid"
  }
}
```

### 鐢ㄦ埛鐧诲綍

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "deviceId": "鍙€夎澶嘔D",
  "deviceName": "鍙€夎澶囧悕绉?
}
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "deviceId": "device-uuid"
  }
}
```

### 鐢ㄦ埛鐧诲嚭

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### 鑾峰彇褰撳墠鐢ㄦ埛淇℃伅

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 鏇存柊鐢ㄦ埛淇℃伅

```http
PATCH /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鏂版樀绉?,
  "currentPassword": "褰撳墠瀵嗙爜",
  "newPassword": "鏂板瘑鐮?
}
```

### 娉ㄩ攢璐︽埛

```http
DELETE /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "褰撳墠瀵嗙爜纭"
}
```

### 鑾峰彇宸茬櫥褰曡澶?
```http
GET /api/auth/devices
Authorization: Bearer <token>
```

### 娉ㄩ攢璁惧

```http
DELETE /api/auth/devices/<deviceId>
Authorization: Bearer <token>
```

### 鑾峰彇鐢ㄦ埛缁熻淇℃伅

```http
GET /api/auth/stats
Authorization: Bearer <token>
```

---

## 鏂囦欢鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/files.ts`

### 鍒楀嚭鏂囦欢

```http
GET /api/files?parentId=<folderId>&search=<keyword>&sortBy=name&sortOrder=asc
Authorization: Bearer <token>
```

**鏌ヨ鍙傛暟**:

| 鍙傛暟        | 绫诲瀷   | 璇存槑                                               |
| ----------- | ------ | -------------------------------------------------- |
| `parentId`  | string | 鐖舵枃浠跺すID锛堝彲閫夛紝涓嶄紶鍒欏垪鍑烘牴鐩綍锛?              |
| `search`    | string | 鎼滅储鍏抽敭璇嶏紙鍙€夛級                                 |
| `sortBy`    | string | 鎺掑簭瀛楁锛歚name`, `size`, `createdAt`, `updatedAt` |
| `sortOrder` | string | 鎺掑簭鏂瑰悜锛歚asc` 鎴?`desc`                          |

### 鍒涘缓鏂囦欢澶?
```http
POST /api/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鏂板缓鏂囦欢澶?,
  "parentId": null,
  "bucketId": "bucket-id"
}
```

### 涓婁紶鏂囦欢锛堜唬鐞嗘ā寮忥級

```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <浜岃繘鍒舵枃浠?
parentId: <鐖舵枃浠跺すID>
bucketId: <瀛樺偍妗禝D>
```

### 鑾峰彇鏂囦欢淇℃伅

```http
GET /api/files/<fileId>
Authorization: Bearer <token>
```

### 鏇存柊鏂囦欢/鏂囦欢澶?
```http
PUT /api/files/<fileId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鏂板悕绉?,
  "parentId": "鏂扮埗鏂囦欢澶笽D"
}
```

### 鏇存柊鏂囦欢澶硅缃?
```http
PUT /api/files/<fileId>/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "allowedMimeTypes": ["image/*", "application/pdf"]
}
```

### 绉诲姩鏂囦欢

```http
POST /api/files/<fileId>/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetParentId": "鐩爣鏂囦欢澶笽D"
}
```

### 鍒犻櫎鏂囦欢/鏂囦欢澶癸紙绉昏嚦鍥炴敹绔欙級

```http
DELETE /api/files/<fileId>
Authorization: Bearer <token>
```

### 涓嬭浇鏂囦欢

```http
GET /api/files/<fileId>/download
Authorization: Bearer <token>
```

### 鏂囦欢棰勮

```http
GET /api/files/<fileId>/preview
Authorization: Bearer <token>
```

鎴栭€氳繃 URL 鍙傛暟浼犻€?token锛?
```http
GET /api/files/<fileId>/preview?token=<jwt-token>
```

---

## 鍥炴敹绔欐帴鍙?
### 鍒楀嚭鍥炴敹绔欐枃浠?
```http
GET /api/files/trash
Authorization: Bearer <token>
```

### 鎭㈠鏂囦欢

```http
POST /api/files/trash/<fileId>/restore
Authorization: Bearer <token>
```

### 姘镐箙鍒犻櫎

```http
DELETE /api/files/trash/<fileId>
Authorization: Bearer <token>
```

### 娓呯┖鍥炴敹绔?
```http
DELETE /api/files/trash
Authorization: Bearer <token>
```

---

## 瀛樺偍妗舵帴鍙?
璺敱鏂囦欢: `apps/api/src/routes/buckets.ts`

### 鍒楀嚭瀛樺偍妗?
```http
GET /api/buckets
Authorization: Bearer <token>
```

### 鑾峰彇瀛樺偍鎻愪緵鍟嗕俊鎭?
```http
GET /api/buckets/providers
Authorization: Bearer <token>
```

杩斿洖鏀寔鐨勫瓨鍌ㄦ彁渚涘晢鍒楄〃鍙婂叾榛樿閰嶇疆銆?
### 鍒涘缓瀛樺偍妗?
```http
POST /api/buckets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鎴戠殑 S3 瀛樺偍妗?,
  "provider": "s3",
  "bucketName": "my-bucket",
  "endpoint": "https://s3.amazonaws.com",
  "region": "us-east-1",
  "accessKeyId": "AKIA...",
  "secretAccessKey": "secret...",
  "pathStyle": false,
  "isDefault": true,
  "notes": "澶囨敞",
  "storageQuota": 107374182400
}
```

**鏀寔鐨?provider**: `r2`, `s3`, `oss`, `cos`, `obs`, `b2`, `minio`, `custom`, `telegram`

### 鑾峰彇鍗曚釜瀛樺偍妗?
```http
GET /api/buckets/<bucketId>
Authorization: Bearer <token>
```

### 鏇存柊瀛樺偍妗?
```http
PUT /api/buckets/<bucketId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鏇存柊鐨勫悕绉?,
  "isDefault": true
}
```

### 璁句负榛樿瀛樺偍妗?
```http
POST /api/buckets/<bucketId>/set-default
Authorization: Bearer <token>
```

### 鍚敤/绂佺敤瀛樺偍妗?
```http
POST /api/buckets/<bucketId>/toggle
Authorization: Bearer <token>
```

### 娴嬭瘯瀛樺偍妗惰繛鎺?
```http
POST /api/buckets/<bucketId>/test
Authorization: Bearer <token>
```

### 鍒犻櫎瀛樺偍妗?
```http
DELETE /api/buckets/<bucketId>
Authorization: Bearer <token>
```

---

## Telegram 鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/telegram.ts`

### 娴嬭瘯 Telegram Bot 杩炴帴

```http
POST /api/telegram/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "botToken": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
  "chatId": "-1001234567890",
  "apiBase": "https://api.telegram.org"
}
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "connected": true,
    "message": "杩炴帴鎴愬姛锛丅ot @botname 鈫?Chat Title",
    "botName": "botname",
    "chatTitle": "Chat Title"
  }
}
```

---

## 瀛樺偍妗惰縼绉绘帴鍙?
璺敱鏂囦欢: `apps/api/src/routes/migrate.ts`

### 鍚姩杩佺Щ浠诲姟

```http
POST /api/migrate/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceBucketId": "鏉ユ簮瀛樺偍妗禝D",
  "targetBucketId": "鐩爣瀛樺偍妗禝D",
  "fileIds": ["fileId1", "fileId2"],
  "targetFolderId": "鐩爣鏂囦欢澶笽D",
  "deleteSource": false
}
```

| 鍙傛暟             | 璇存槑                    |
| ---------------- | ----------------------- |
| `sourceBucketId` | 鏉ユ簮瀛樺偍妗禝D            |
| `targetBucketId` | 鐩爣瀛樺偍妗禝D            |
| `fileIds`        | 鍙€夛紝涓嶄紶鍒欒縼绉绘暣涓《  |
| `targetFolderId` | 鍙€夛紝涓嶄紶鍒欎繚鎸佸師浣嶇疆  |
| `deleteSource`   | 鍙€夛紝`true` = 绉诲姩妯″紡 |

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "migrationId": "uuid",
    "total": 100,
    "status": "running",
    "message": "杩佺Щ浠诲姟宸插惎鍔紝鍏?100 涓枃浠?
  }
}
```

### 鏌ヨ杩佺Щ杩涘害

```http
GET /api/migrate/<migrationId>
Authorization: Bearer <token>
```

### 鍙栨秷杩佺Щ

```http
POST /api/migrate/<migrationId>/cancel
Authorization: Bearer <token>
```

---

## 棰勭鍚嶄笂浼犳帴鍙?
璺敱鏂囦欢: `apps/api/src/routes/presign.ts`

### 鑾峰彇涓婁紶棰勭鍚?URL

```http
POST /api/presign/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "example.zip",
  "fileSize": 52428800,
  "mimeType": "application/zip",
  "parentId": null,
  "bucketId": null
}
```

**鍝嶅簲锛堝皬鏂囦欢锛?*:

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...",
    "fileId": "uuid",
    "r2Key": "files/userId/fileId/example.zip",
    "bucketId": "bucket-uuid",
    "expiresIn": 3600
  }
}
```

**鍝嶅簲锛堥渶瑕佷唬鐞嗭級**:

```json
{
  "success": true,
  "data": {
    "useProxy": true
  }
}
```

### 纭涓婁紶

```http
POST /api/presign/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "uuid",
  "fileName": "example.zip",
  "fileSize": 52428800,
  "mimeType": "application/zip",
  "parentId": null,
  "r2Key": "files/userId/fileId/example.zip",
  "bucketId": "bucket-uuid"
}
```

### 鍒嗙墖涓婁紶鍒濆鍖?
```http
POST /api/presign/multipart/init
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "large-file.iso",
  "fileSize": 5368709120,
  "mimeType": "application/octet-stream",
  "parentId": null,
  "bucketId": null
}
```

### 鑾峰彇鍒嗙墖涓婁紶 URL

```http
POST /api/presign/multipart/part
Authorization: Bearer <token>
Content-Type: application/json

{
  "r2Key": "files/userId/fileId/large-file.iso",
  "uploadId": "upload-id",
  "partNumber": 2,
  "bucketId": "bucket-uuid"
}
```

### 瀹屾垚鍒嗙墖涓婁紶

```http
POST /api/presign/multipart/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "uuid",
  "fileName": "large-file.iso",
  "fileSize": 5368709120,
  "mimeType": "application/octet-stream",
  "parentId": null,
  "r2Key": "files/userId/fileId/large-file.iso",
  "uploadId": "upload-id",
  "bucketId": "bucket-uuid",
  "parts": [
    { "partNumber": 1, "etag": "etag-1" },
    { "partNumber": 2, "etag": "etag-2" }
  ]
}
```

### 鍙栨秷鍒嗙墖涓婁紶

```http
POST /api/presign/multipart/abort
Authorization: Bearer <token>
Content-Type: application/json

{
  "r2Key": "files/userId/fileId/large-file.iso",
  "uploadId": "upload-id",
  "bucketId": "bucket-uuid"
}
```

### 鑾峰彇涓嬭浇棰勭鍚?URL

```http
GET /api/presign/download/<fileId>
Authorization: Bearer <token>
```

### 鑾峰彇棰勮棰勭鍚?URL

```http
GET /api/presign/preview/<fileId>
Authorization: Bearer <token>
```

---

## 鍒嗕韩鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/share.ts`

### 鍒涘缓涓嬭浇鍒嗕韩

```http
POST /api/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "file-id",
  "password": "璁块棶瀵嗙爜",
  "expiresAt": "2024-12-31T23:59:59Z",
  "downloadLimit": 10
}
```

### 鍒涘缓涓婁紶閾炬帴

```http
POST /api/share/upload-link
Authorization: Bearer <token>
Content-Type: application/json

{
  "folderId": "鏂囦欢澶笽D",
  "password": "璁块棶瀵嗙爜",
  "expiresAt": "2024-12-31T23:59:59Z",
  "maxUploadSize": 104857600,
  "allowedMimeTypes": ["image/*", "application/pdf"],
  "maxUploadCount": 10
}
```

### 鑾峰彇鍒嗕韩淇℃伅锛堝叕寮€锛?
```http
GET /api/share/<shareId>?password=<瀵嗙爜>
```

### 鍒嗕韩棰勮锛堝叕寮€锛屼粎鍥剧墖锛?
```http
GET /api/share/<shareId>/preview?password=<瀵嗙爜>
```

### 涓嬭浇鍒嗕韩鏂囦欢锛堝叕寮€锛?
```http
GET /api/share/<shareId>/download?password=<瀵嗙爜>
```

### 涓嬭浇鏂囦欢澶瑰垎浜殑 ZIP锛堝叕寮€锛?
```http
GET /api/share/<shareId>/zip?password=<瀵嗙爜>&fileIds=id1,id2
```

### 涓嬭浇鏂囦欢澶瑰垎浜腑鐨勫崟涓枃浠讹紙鍏紑锛?
```http
GET /api/share/<shareId>/file/<fileId>/download?password=<瀵嗙爜>
```

### 鑾峰彇涓婁紶閾炬帴淇℃伅锛堝叕寮€锛?
```http
GET /api/share/upload/<uploadToken>?password=<瀵嗙爜>
```

### 閫氳繃涓婁紶閾炬帴涓婁紶鏂囦欢锛堝叕寮€锛?
```http
POST /api/share/upload/<uploadToken>
Content-Type: multipart/form-data

file: <浜岃繘鍒舵枃浠?
password: <瀵嗙爜锛堝彲閫夛級>
```

### 鍒楀嚭鎴戠殑鍒嗕韩

```http
GET /api/share
Authorization: Bearer <token>
```

### 鍒犻櫎鍒嗕韩

```http
DELETE /api/share/<shareId>
Authorization: Bearer <token>
```

### 鍒嗕韩棰勮锛堝叕寮€锛屾敮鎸佸浘鐗?瑙嗛/闊抽/PDF/鏂囨湰锛?
```http
GET /api/share/<shareId>/preview?password=<瀵嗙爜>
```

杩斿洖鏂囦欢鍐呭锛岀敤浜庡湪绾块瑙堛€?
### 鍒嗕韩娴佸紡棰勮锛堝叕寮€锛岃棰?闊抽锛?
```http
GET /api/share/<shareId>/stream?password=<瀵嗙爜>
```

鏀寔 Range 璇锋眰锛岄€傜敤浜庤棰?闊抽娴佸紡鎾斁銆?
### 鍒嗕韩鏂囨湰鍐呭锛堝叕寮€锛?
```http
GET /api/share/<shareId>/raw?password=<瀵嗙爜>
```

杩斿洖鏂囨湰鏂囦欢鍐呭锛堥檺 10MB 浠ュ唴锛夈€?
### 鏂囦欢澶瑰垎浜瓙鏂囦欢棰勮锛堝叕寮€锛?
```http
GET /api/share/<shareId>/file/<fileId>/preview?password=<瀵嗙爜>
```

棰勮鏂囦欢澶瑰垎浜腑鐨勫崟涓枃浠躲€?
### 鏂囦欢澶瑰垎浜瓙鏂囦欢娴佸紡棰勮锛堝叕寮€锛?
```http
GET /api/share/<shareId>/file/<fileId>/stream?password=<瀵嗙爜>
```

娴佸紡棰勮鏂囦欢澶瑰垎浜腑鐨勮棰?闊抽鏂囦欢銆?
### 鏂囦欢澶瑰垎浜瓙鏂囦欢鏂囨湰鍐呭锛堝叕寮€锛?
```http
GET /api/share/<shareId>/file/<fileId>/raw?password=<瀵嗙爜>
```

鑾峰彇鏂囦欢澶瑰垎浜腑鏂囨湰鏂囦欢鐨勫唴瀹广€?
---

## 鏂囦欢鐩撮摼鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/directLink.ts`

鏂囦欢鐩撮摼鍏佽涓烘枃浠剁敓鎴愬叕寮€璁块棶閾炬帴锛屾棤闇€鐧诲綍鍗冲彲涓嬭浇鎴栭瑙堟枃浠躲€?
### 鍒涘缓鐩撮摼

```http
POST /api/direct
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "file-id",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**鍙傛暟璇存槑**:

| 鍙傛暟        | 璇存槑                        |
| ----------- | --------------------------- |
| `fileId`    | 鏂囦欢 ID锛堝繀濉級             |
| `expiresAt` | 杩囨湡鏃堕棿锛堝彲閫夛紝榛樿 7 澶╋級 |

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "token": "uuid-token",
    "fileId": "file-id",
    "fileName": "example.pdf",
    "directUrl": "https://your-domain.com/api/direct/uuid-token",
    "expiresAt": "2024-12-31T23:59:59Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 鑾峰彇鏂囦欢鐨勭洿閾句俊鎭?
```http
GET /api/direct/file/<fileId>
Authorization: Bearer <token>
```

杩斿洖鎸囧畾鏂囦欢鐨勭洿閾句俊鎭紝濡傛灉鏈垱寤虹洿閾惧垯杩斿洖 `null`銆?
### 閫氳繃鐩撮摼涓嬭浇鏂囦欢锛堝叕寮€锛?
```http
GET /api/direct/<token>
```

鏃犻渶璁よ瘉锛岀洿鎺ヤ笅杞芥枃浠躲€?
### 閫氳繃鐩撮摼棰勮鏂囦欢锛堝叕寮€锛?
```http
GET /api/direct/<token>/preview
```

鏃犻渶璁よ瘉锛屽湪绾块瑙堟枃浠讹紙鏀寔鍥剧墖銆佽棰戙€侀煶棰戙€丳DF銆佹枃鏈瓑锛夈€?
### 鑾峰彇鐩撮摼淇℃伅锛堝叕寮€锛?
```http
GET /api/direct/<token>/info
```

杩斿洖鐩撮摼瀵瑰簲鐨勬枃浠朵俊鎭紙鏂囦欢鍚嶃€佸ぇ灏忋€丮IME 绫诲瀷銆佽繃鏈熸椂闂达級銆?
**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "id": "file-id",
    "name": "example.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "directLinkExpiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### 鏇存柊鐩撮摼鏈夋晥鏈?
```http
PUT /api/direct/<fileId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### 鍒犻櫎鐩撮摼

```http
DELETE /api/direct/<fileId>
Authorization: Bearer <token>
```

---

## 鎵归噺鎿嶄綔鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/batch.ts`

### 鎵归噺鍒犻櫎锛堢Щ鑷冲洖鏀剁珯锛?
```http
POST /api/batch/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": ["id1", "id2", "id3"]
}
```

### 鎵归噺绉诲姩

```http
POST /api/batch/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": ["id1", "id2"],
  "targetParentId": "folder-id"
}
```

### 鎵归噺澶嶅埗

```http
POST /api/batch/copy
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": ["id1", "id2"],
  "targetParentId": "folder-id",
  "targetBucketId": "bucket-id"
}
```

### 鎵归噺閲嶅懡鍚?
```http
POST /api/batch/rename
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "fileId": "id1", "newName": "鏂板悕绉?" },
    { "fileId": "id2", "newName": "鏂板悕绉?" }
  ]
}
```

### 鎵归噺姘镐箙鍒犻櫎

```http
POST /api/batch/permanent-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": ["id1", "id2"]
}
```

### 鎵归噺鎭㈠

```http
POST /api/batch/restore
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": ["id1", "id2"]
}
```

---

## 鎼滅储鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/search.ts`

### 鎼滅储鏂囦欢

```http
GET /api/search?query=keyword&parentId=folderId&tags=tag1,tag2&mimeType=image/*&minSize=0&maxSize=10485760&createdAfter=2024-01-01T00:00:00Z&createdBefore=2024-12-31T23:59:59Z&isFolder=false&bucketId=bucket-id&sortBy=createdAt&sortOrder=desc&page=1&limit=50
Authorization: Bearer <token>
```

**鏌ヨ鍙傛暟**:

| 鍙傛暟                             | 璇存槑                                                 |
| -------------------------------- | ---------------------------------------------------- |
| `query`                          | 鎼滅储鍏抽敭璇?                                          |
| `parentId`                       | 鎼滅储鑼冨洿锛堟枃浠跺すID锛?                                |
| `tags`                           | 鏍囩杩囨护锛堥€楀彿鍒嗛殧锛?                                |
| `mimeType`                       | MIME绫诲瀷杩囨护锛堟敮鎸侀€氶厤绗﹀ `image/*`锛?              |
| `minSize` / `maxSize`            | 鏂囦欢澶у皬鑼冨洿锛堝瓧鑺傦級                                 |
| `createdAfter` / `createdBefore` | 鍒涘缓鏃堕棿鑼冨洿                                         |
| `updatedAfter` / `updatedBefore` | 鏇存柊鏃堕棿鑼冨洿                                         |
| `isFolder`                       | 鏄惁鍙悳绱㈡枃浠跺す                                     |
| `bucketId`                       | 瀛樺偍妗惰繃婊?                                          |
| `sortBy`                         | 鎺掑簭瀛楁锛坄name`, `size`, `createdAt`, `updatedAt`锛?|
| `sortOrder`                      | 鎺掑簭鏂瑰悜锛坄asc`, `desc`锛?                           |
| `page` / `limit`                 | 鍒嗛〉                                                 |

### 楂樼骇鎼滅储

```http
POST /api/search/advanced
Authorization: Bearer <token>
Content-Type: application/json

{
  "conditions": [
    { "field": "name", "operator": "contains", "value": "report" },
    { "field": "size", "operator": "gte", "value": 1048576 }
  ],
  "logic": "and",
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "page": 1,
  "limit": 50
}
```

**鏀寔鐨?field**: `name`, `mimeType`, `size`, `createdAt`, `updatedAt`, `tags`

**鏀寔鐨?operator**: `contains`, `equals`, `startsWith`, `endsWith`, `gt`, `gte`, `lt`, `lte`, `in`

### 鎼滅储寤鸿

```http
GET /api/search/suggestions?q=keyword&type=name
Authorization: Bearer <token>
```

**type**: `name`锛堟枃浠跺悕锛? `tags`锛堟爣绛撅級, `mime`锛圡IME绫诲瀷锛?
### 鏈€杩戞枃浠?
```http
GET /api/search/recent?limit=20
Authorization: Bearer <token>
```

---

## 鏉冮檺涓庢爣绛炬帴鍙?
璺敱鏂囦欢: `apps/api/src/routes/permissions.ts`

### 鎺堜簣鏉冮檺

```http
POST /api/permissions/grant
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "file-id",
  "userId": "user-id",
  "permission": "read"
}
```

**permission**: `read`锛堝彧璇伙級, `write`锛堣鍐欙級, `admin`锛堢鐞嗭級

### 鎾ら攢鏉冮檺

```http
POST /api/permissions/revoke
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "file-id",
  "userId": "user-id"
}
```

### 鑾峰彇鏂囦欢鏉冮檺鍒楄〃

```http
GET /api/permissions/file/<fileId>
Authorization: Bearer <token>
```

### 妫€鏌ユ潈闄?
```http
GET /api/permissions/check/<fileId>
Authorization: Bearer <token>
```

### 鎼滅储鐢ㄦ埛锛堢敤浜庢巿鏉冿級

```http
GET /api/permissions/users/search?q=email@example.com
Authorization: Bearer <token>
```

### 娣诲姞鏍囩

```http
POST /api/permissions/tags/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "file-id",
  "name": "閲嶈",
  "color": "#ef4444"
}
```

### 绉婚櫎鏍囩

```http
POST /api/permissions/tags/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileId": "file-id",
  "tagName": "閲嶈"
}
```

### 鑾峰彇鏂囦欢鏍囩

```http
GET /api/permissions/tags/file/<fileId>
Authorization: Bearer <token>
```

### 鑾峰彇鐢ㄦ埛鎵€鏈夋爣绛?
```http
GET /api/permissions/tags/user
Authorization: Bearer <token>
```

### 鎵归噺鑾峰彇鏍囩

```http
POST /api/permissions/tags/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": ["id1", "id2"]
}
```

---

## 涓婁紶浠诲姟鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/tasks.ts`

### 鍒涘缓涓婁紶浠诲姟

```http
POST /api/tasks/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "large-file.iso",
  "fileSize": 5368709120,
  "mimeType": "application/octet-stream",
  "parentId": null,
  "bucketId": null
}
```

### 鑾峰彇鍒嗙墖涓婁紶 URL锛圫3锛?
```http
POST /api/tasks/part
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": "uuid",
  "partNumber": 1
}
```

### 鏍囪鍒嗙墖瀹屾垚锛圫3锛?
```http
POST /api/tasks/part-done
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": "uuid",
  "partNumber": 1,
  "etag": "etag-value"
}
```

### 浠ｇ悊涓婁紶鍒嗙墖锛圫3锛?
```http
POST /api/tasks/part-proxy
Authorization: Bearer <token>
Content-Type: multipart/form-data

taskId: <taskId>
partNumber: <partNumber>
chunk: <浜岃繘鍒舵暟鎹?
```

### Telegram 鍒嗙墖涓婁紶

```http
POST /api/tasks/telegram-part
Authorization: Bearer <token>
Content-Type: multipart/form-data

taskId: <taskId>
partNumber: <partNumber>
chunk: <浜岃繘鍒舵暟鎹?
```

### 瀹屾垚涓婁紶浠诲姟

```http
POST /api/tasks/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": "uuid",
  "parts": [
    { "partNumber": 1, "etag": "etag-1" }
  ],
  "hash": "鍙€夌殑鏂囦欢鍝堝笇"
}
```

### 鍙栨秷涓婁紶浠诲姟

```http
POST /api/tasks/abort
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": "uuid"
}
```

### 鍒楀嚭涓婁紶浠诲姟

```http
GET /api/tasks/list
Authorization: Bearer <token>
```

### 鑾峰彇鍗曚釜浠诲姟

```http
GET /api/tasks/<taskId>
Authorization: Bearer <token>
```

### 鍒犻櫎浠诲姟

```http
DELETE /api/tasks/<taskId>
Authorization: Bearer <token>
```

### 鏆傚仠浠诲姟

```http
POST /api/tasks/<taskId>/pause
Authorization: Bearer <token>
```

### 鎭㈠浠诲姟

```http
POST /api/tasks/<taskId>/resume
Authorization: Bearer <token>
```

### 娓呯┖鍘嗗彶浠诲姟

```http
DELETE /api/tasks/clear
Authorization: Bearer <token>
```

### 娓呯┖宸插畬鎴愪换鍔?
```http
DELETE /api/tasks/clear-completed
Authorization: Bearer <token>
```

### 娓呯┖澶辫触浠诲姟

```http
DELETE /api/tasks/clear-failed
Authorization: Bearer <token>
```

### 娓呯┖鎵€鏈変换鍔?
```http
DELETE /api/tasks/clear-all
Authorization: Bearer <token>
```

---

## 绂荤嚎涓嬭浇鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/downloads.ts`

### 鍒涘缓涓嬭浇浠诲姟

```http
POST /api/downloads/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/file.zip",
  "fileName": "downloaded-file.zip",
  "parentId": null,
  "bucketId": null
}
```

### 鍒楀嚭涓嬭浇浠诲姟

```http
GET /api/downloads/list?status=completed&page=1&limit=20
Authorization: Bearer <token>
```

**status**: `pending`, `downloading`, `completed`, `failed`, `paused`

### 鑾峰彇鍗曚釜浠诲姟

```http
GET /api/downloads/<taskId>
Authorization: Bearer <token>
```

### 鏇存柊浠诲姟

```http
PATCH /api/downloads/<taskId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "new-name.zip",
  "parentId": "folder-id",
  "bucketId": "bucket-id"
}
```

### 鍒犻櫎浠诲姟

```http
DELETE /api/downloads/<taskId>
Authorization: Bearer <token>
```

### 閲嶈瘯澶辫触浠诲姟

```http
POST /api/downloads/<taskId>/retry
Authorization: Bearer <token>
```

### 鏆傚仠浠诲姟

```http
POST /api/downloads/<taskId>/pause
Authorization: Bearer <token>
```

### 鎭㈠浠诲姟

```http
POST /api/downloads/<taskId>/resume
Authorization: Bearer <token>
```

### 娓呯悊宸插畬鎴愪换鍔?
```http
DELETE /api/downloads/completed
Authorization: Bearer <token>
```

### 娓呯悊澶辫触浠诲姟

```http
DELETE /api/downloads/failed
Authorization: Bearer <token>
```

---

## 棰勮鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/preview.ts`

### 鏀寔鐨勯瑙堢被鍨?
| 绫诲瀷 | MIME 绫诲瀷 / 鎵╁睍鍚?| 棰勮鏂瑰紡 |
|------|-------------------|----------|
| 鍥剧墖 | image/* | 娴忚鍣ㄥ師鐢?`<img>` |
| 瑙嗛 | video/* | 娴忚鍣ㄥ師鐢?`<video>` |
| 闊抽 | audio/* | 娴忚鍣ㄥ師鐢?`<audio>` |
| PDF | application/pdf | pdf.js 鍒嗛〉娓叉煋 |
| Markdown | text/markdown, .md | react-markdown + GFM + 鏁板鍏紡 |
| 浠ｇ爜 | text/*, .js/.ts/.py 绛?| highlight.js 璇硶楂樹寒 |
| Word | application/msword, .docx | docx-preview 鏈湴娓叉煋 |
| Excel | application/vnd.ms-excel, .xlsx | xlsx 搴?+ 鏍峰紡淇濈暀 |
| PowerPoint | application/vnd.ms-powerpoint, .pptx | pptx-preview 鏈湴娓叉煋 |
| EPUB | application/epub+zip, .epub | epub.js 鐢靛瓙涔﹂槄璇诲櫒 |
| 瀛椾綋 | font/ttf, font/otf, font/woff, font/woff2 | FontFace API 瀛楃棰勮 |
| ZIP | application/zip | JSZip 鏂囦欢鍒楄〃棰勮 |
| CSV | text/csv, .csv | PapaParse 琛ㄦ牸瑙嗗浘 |

### 棰勮澶у皬闄愬埗

- **鏈€澶ч瑙堟枃浠跺ぇ灏?*: 30MB锛堝畾涔変簬 `apps/api/src/routes/preview.ts`锛?- 瓒呰繃闄愬埗鐨勬枃浠跺皢鎻愮ず涓嬭浇鏌ョ湅

### 鑾峰彇棰勮淇℃伅

```http
GET /api/preview/<fileId>/info
Authorization: Bearer <token>
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "id": "file-id",
    "name": "document.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "previewable": true,
    "previewType": "pdf",
    "language": null,
    "extension": ".pdf",
    "canPreview": true
  }
}
```

**previewType**: `image`, `video`, `audio`, `pdf`, `text`, `markdown`, `csv`, `code`, `word`, `excel`, `powerpoint`, `epub`, `font`, `archive`, `unknown`

### 鑾峰彇鍘熷鍐呭

```http
GET /api/preview/<fileId>/raw
Authorization: Bearer <token>
```

杩斿洖鏂囨湰鍐呭锛堥檺 10MB 浠ュ唴鏂囦欢锛夈€?
### 娴佸紡棰勮

```http
GET /api/preview/<fileId>/stream
Authorization: Bearer <token>
```

鏀寔 Range 璇锋眰锛岄€傜敤浜庤棰?闊抽娴佸紡鎾斁銆?
### 鑾峰彇缂╃暐鍥?
```http
GET /api/preview/<fileId>/thumbnail?width=256&height=256
Authorization: Bearer <token>
```

浠呮敮鎸佸浘鐗囨枃浠躲€?
### Office 鏂囨。棰勮

```http
GET /api/preview/<fileId>/office
Authorization: Bearer <token>
```

杩斿洖 Base64 缂栫爜鐨勬枃浠跺唴瀹癸紝鐢ㄤ簬鍓嶇 Office 棰勮缁勪欢銆?
---

## 鐗堟湰鎺у埗鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/versions.ts`

鐗堟湰鎺у埗鍔熻兘鍏佽绠＄悊鏂囦欢鐨勫巻鍙茬増鏈紝鏀寔鐗堟湰鍥炴粴鍜屽姣斻€?
### 鑾峰彇鏂囦欢鐗堟湰鍒楄〃

```http
GET /api/versions/file/<fileId>
Authorization: Bearer <token>
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "fileId": "file-id",
    "currentVersion": 3,
    "totalVersions": 3,
    "versions": [
      {
        "id": "version-id-1",
        "versionNumber": 1,
        "size": 1048576,
        "hash": "sha256-hash",
        "note": "鍒濆鐗堟湰",
        "tags": ["release"],
        "createdAt": "2024-03-20T10:00:00Z",
        "createdBy": {
          "id": "user-id",
          "name": "鐢ㄦ埛鍚?
        }
      },
      {
        "id": "version-id-2",
        "versionNumber": 2,
        "size": 2097152,
        "hash": "sha256-hash-2",
        "note": "鏇存柊鍐呭",
        "tags": [],
        "createdAt": "2024-03-22T14:30:00Z",
        "createdBy": {
          "id": "user-id",
          "name": "鐢ㄦ埛鍚?
        }
      }
    ]
  }
}
```

### 鑾峰彇鍗曚釜鐗堟湰淇℃伅

```http
GET /api/versions/<versionId>
Authorization: Bearer <token>
```

### 鍒涘缓鏂扮増鏈?
```http
POST /api/versions/create
Authorization: Bearer <token>
Content-Type: multipart/form-data

fileId: <fileId>
file: <浜岃繘鍒舵枃浠?
note: 鐗堟湰澶囨敞
tags: ["tag1", "tag2"]
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "id": "new-version-id",
    "fileId": "file-id",
    "versionNumber": 4,
    "size": 3145728,
    "hash": "sha256-hash-new",
    "note": "鐗堟湰澶囨敞",
    "tags": ["tag1", "tag2"],
    "createdAt": "2024-03-24T12:00:00Z"
  }
}
```

### 鐗堟湰鍥炴粴

```http
POST /api/versions/<versionId>/restore
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "鍥炴粴鍒扮増鏈?"
}
```

鍥炴粴鍚庝細鍒涘缓涓€涓柊鐗堟湰锛屽唴瀹逛笌鐩爣鐗堟湰鐩稿悓銆?
### 鐗堟湰瀵规瘮

```http
GET /api/versions/compare?fileId=<fileId>&v1=1&v2=3
Authorization: Bearer <token>
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "fileId": "file-id",
    "version1": {
      "versionNumber": 1,
      "size": 1048576,
      "hash": "sha256-hash-1",
      "createdAt": "2024-03-20T10:00:00Z"
    },
    "version2": {
      "versionNumber": 3,
      "size": 3145728,
      "hash": "sha256-hash-3",
      "createdAt": "2024-03-24T12:00:00Z"
    },
    "diff": {
      "sizeDiff": 2097152,
      "modified": true
    }
  }
}
```

### 涓嬭浇鎸囧畾鐗堟湰

```http
GET /api/versions/<versionId>/download
Authorization: Bearer <token>
```

### 鏇存柊鐗堟湰澶囨敞

```http
PATCH /api/versions/<versionId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "鏇存柊鍚庣殑澶囨敞",
  "tags": ["important", "release"]
}
```

### 鍒犻櫎鐗堟湰

```http
DELETE /api/versions/<versionId>
Authorization: Bearer <token>
```

> **娉ㄦ剰**: 鏃犳硶鍒犻櫎褰撳墠姝ｅ湪浣跨敤鐨勭増鏈紝闇€瑕佸厛鍥炴粴鍒板叾浠栫増鏈€?
### 鑾峰彇鐗堟湰缁熻

```http
GET /api/versions/stats
Authorization: Bearer <token>
```

**鍝嶅簲**:

```json
{
  "success": true,
  "data": {
    "totalVersions": 150,
    "totalSize": 524288000,
    "filesWithVersions": 45,
    "oldestVersion": "2024-01-01T00:00:00Z",
    "newestVersion": "2024-03-24T12:00:00Z"
  }
}
```

---

## 绠＄悊鍛樻帴鍙?
璺敱鏂囦欢: `apps/api/src/routes/admin.ts`

鎵€鏈夌鐞嗗憳鎺ュ彛闇€瑕?`admin` 瑙掕壊銆?
### 鑾峰彇鐢ㄦ埛鍒楄〃

```http
GET /api/admin/users
Authorization: Bearer <token>
```

### 鑾峰彇鍗曚釜鐢ㄦ埛

```http
GET /api/admin/users/<userId>
Authorization: Bearer <token>
```

### 鏇存柊鐢ㄦ埛

```http
PATCH /api/admin/users/<userId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "鏂板悕绉?,
  "role": "user",
  "storageQuota": 21474836480,
  "newPassword": "new-password"
}
```

### 鍒犻櫎鐢ㄦ埛

```http
DELETE /api/admin/users/<userId>
Authorization: Bearer <token>
```

### 鑾峰彇娉ㄥ唽閰嶇疆

```http
GET /api/admin/registration
Authorization: Bearer <token>
```

### 鏇存柊娉ㄥ唽閰嶇疆

```http
PUT /api/admin/registration
Authorization: Bearer <token>
Content-Type: application/json

{
  "open": false,
  "requireInviteCode": true
}
```

### 鍒涘缓閭€璇风爜

```http
POST /api/admin/registration/codes
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 5
}
```

### 鍒犻櫎閭€璇风爜

```http
DELETE /api/admin/registration/codes/<code>
Authorization: Bearer <token>
```

### 鑾峰彇绯荤粺缁熻

```http
GET /api/admin/stats
Authorization: Bearer <token>
```

### 鑾峰彇瀹¤鏃ュ織

```http
GET /api/admin/audit-logs?page=1&limit=50&userId=user-id&action=user.login
Authorization: Bearer <token>
```

---

## 瀹氭椂浠诲姟鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/cron.ts`

杩欎簺鎺ュ彛閫氬父鐢?Cloudflare Cron Triggers 璋冪敤銆?
### 鍥炴敹绔欐竻鐞?
```http
POST /cron/trash-cleanup
```

娓呯悊瓒呰繃淇濈暀鏈熺殑鍥炴敹绔欐枃浠躲€?
### 浼氳瘽娓呯悊

```http
POST /cron/session-cleanup
```

娓呯悊杩囨湡鐨?WebDAV 浼氳瘽銆佷笂浼犱换鍔″拰鐧诲綍璁板綍銆?
### 鍒嗕韩娓呯悊

```http
POST /cron/share-cleanup
```

娓呯悊杩囨湡鐨勫垎浜摼鎺ャ€?
### 鍏ㄩ噺娓呯悊

```http
POST /cron/all
```

鎵ц鎵€鏈夋竻鐞嗕换鍔°€?
---

## WebDAV 鎺ュ彛

璺敱鏂囦欢: `apps/api/src/routes/webdav.ts`

WebDAV 鍗忚绔偣: `/dav`

### 杩炴帴閰嶇疆

| 閰嶇疆椤?    | 鍊?                           |
| ---------- | ----------------------------- |
| 鏈嶅姟鍣ㄥ湴鍧€ | `https://your-domain.com/dav` |
| 鐢ㄦ埛鍚?    | 娉ㄥ唽閭                      |
| 瀵嗙爜       | 璐︽埛瀵嗙爜                      |
| 璁よ瘉鏂瑰紡   | Basic Auth                    |

### 鏀寔鐨勬搷浣?
| 鎿嶄綔        | 鏂规硶      | 鎻忚堪                          |
| ----------- | --------- | ----------------------------- |
| 鍒楀嚭鐩綍    | PROPFIND  | Depth: 0 (褰撳墠), 1 (鍖呭惈瀛愰」) |
| 涓嬭浇鏂囦欢    | GET       | -                             |
| 鏌ョ湅鏂囦欢澶? | HEAD      | -                             |
| 涓婁紶鏂囦欢    | PUT       | 鑷姩鍒涘缓鐖剁洰褰?               |
| 鍒涘缓鐩綍    | MKCOL     | -                             |
| 鍒犻櫎        | DELETE    | 姘镐箙鍒犻櫎                      |
| 绉诲姩/閲嶅懡鍚?| MOVE      | 闇€瑕?Destination 澶?          |
| 澶嶅埗        | COPY      | 闇€瑕?Destination 澶?          |
| 閿佸畾璧勬簮    | LOCK      | 鏀寔 Windows 璧勬簮绠＄悊鍣?      |
| 瑙ｉ攣璧勬簮    | UNLOCK    | 鏀寔 Windows 璧勬簮绠＄悊鍣?      |
| 灞炴€т慨鏀?   | PROPPATCH | 鍙灞炴€э紝杩斿洖 403            |

### Windows 璧勬簮绠＄悊鍣ㄥ吋瀹规€т紭鍖?
- **401 鍝嶅簲蹇呴』鎼哄甫 DAV 澶?*锛歐indows Mini-Redirector 浠ユ鍒ゆ柇鏈嶅姟鍣ㄦ槸鍚︽敮鎸?WebDAV
- **PROPFIND 鍝嶅簲璺緞绮剧‘鍖归厤**锛氭牴鑺傜偣 `<href>` 蹇呴』涓庤姹傝矾寰勫畬鍏ㄤ竴鑷?- **瀹炵幇 LOCK/UNLOCK**锛歐indows 鍦ㄥ啓鎿嶄綔鍓嶄細鍙戦€?LOCK 璇锋眰锛岀己灏戞鍔熻兘浼氬鑷村崱姝?- **璺緞瑙勮寖鍖?*锛氳嚜鍔ㄥ鐞嗚矾寰勬湯灏炬枩鏉狅紝纭繚璺緞涓€鑷存€?
### PROPFIND 绀轰緥

```http
PROPFIND /dav/ HTTP/1.1
Host: your-domain.com
Authorization: Basic base64(email:password)
Depth: 1
```

### PUT 涓婁紶绀轰緥

```http
PUT /dav/folder/file.txt HTTP/1.1
Host: your-domain.com
Authorization: Basic base64(email:password)
Content-Type: text/plain

鏂囦欢鍐呭...
```

### MKCOL 鍒涘缓鐩綍绀轰緥

```http
MKCOL /dav/new-folder/ HTTP/1.1
Host: your-domain.com
Authorization: Basic base64(email:password)
```

### MOVE 绉诲姩绀轰緥

```http
MOVE /dav/old-name.txt HTTP/1.1
Host: your-domain.com
Authorization: Basic base64(email:password)
Destination: https://your-domain.com/dav/new-name.txt
```

### COPY 澶嶅埗绀轰緥

```http
COPY /dav/file.txt HTTP/1.1
Host: your-domain.com
Authorization: Basic base64(email:password)
Destination: https://your-domain.com/dav/copy-of-file.txt
```
