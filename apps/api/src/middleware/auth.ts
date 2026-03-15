import type { Next } from 'hono';
import { verify } from 'jsonwebtoken';
import { ERROR_CODES } from '@r2shelf/shared';
import type { AppContext } from '../types/env';

export async function authMiddleware(c: AppContext, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: '未提供认证令牌',
      },
    }, 401);
  }
  
  const token = authHeader.slice(7);
  
  try {
    const decoded = verify(token, c.env.JWT_SECRET) as { userId: string; email: string; role: string };
    
    const sessionKey = `session:${token}`;
    const session = await c.env.KV.get(sessionKey);
    
    if (!session) {
      return c.json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: '会话已过期，请重新登录',
        },
      }, 401);
    }
    
    c.set('userId', decoded.userId);
    c.set('user', {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });
    
    await next();
  } catch {
    return c.json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: '令牌无效或已过期',
      },
    }, 401);
  }
}

export async function optionalAuth(c: AppContext, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    
    try {
      const decoded = verify(token, c.env.JWT_SECRET) as { userId: string; email: string; role: string };
      c.set('userId', decoded.userId);
      c.set('user', {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
    } catch {
      // Token invalid, continue without auth
    }
  }
  
  await next();
}
