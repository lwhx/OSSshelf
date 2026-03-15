export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

export const DEFAULT_STORAGE_QUOTA = 10 * 1024 * 1024 * 1024;

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  text: ['text/plain', 'text/html', 'text/css', 'text/javascript', 'text/markdown'],
  code: ['application/json', 'application/xml', 'application/x-yaml'],
};

export const FILE_TYPE_ICONS: Record<string, string> = {
  'image/': 'image',
  'video/': 'video',
  'audio/': 'audio',
  'application/pdf': 'pdf',
  'application/zip': 'archive',
  'application/x-': 'code',
  'text/': 'text',
};

export const JWT_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export const WEBDAV_SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;

export const SHARE_DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export const UPLOAD_CHUNK_SIZE = 10 * 1024 * 1024;

export const THUMBNAIL_SIZES = {
  small: 128,
  medium: 256,
  large: 512,
};

export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  FILES: {
    LIST: '/api/files',
    CREATE: '/api/files',
    GET: (id: string) => `/api/files/${id}`,
    UPDATE: (id: string) => `/api/files/${id}`,
    DELETE: (id: string) => `/api/files/${id}`,
    UPLOAD: '/api/files/upload',
    DOWNLOAD: (id: string) => `/api/files/${id}/download`,
    PREVIEW: (id: string) => `/api/files/${id}/preview`,
  },
  SHARE: {
    CREATE: '/api/share',
    GET: (id: string) => `/api/share/${id}`,
    DOWNLOAD: (id: string) => `/api/share/${id}/download`,
  },
  WEBDAV: '/dav',
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  STORAGE_EXCEEDED: 'STORAGE_EXCEEDED',
  SHARE_EXPIRED: 'SHARE_EXPIRED',
  SHARE_PASSWORD_REQUIRED: 'SHARE_PASSWORD_REQUIRED',
  SHARE_PASSWORD_INVALID: 'SHARE_PASSWORD_INVALID',
  SHARE_DOWNLOAD_LIMIT_EXCEEDED: 'SHARE_DOWNLOAD_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
