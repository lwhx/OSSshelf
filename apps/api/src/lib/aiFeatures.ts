/**
 * aiFeatures.ts
 * AI 功能模块
 *
 * 功能:
 * - 文件摘要生成
 * - 图片标签生成
 * - 智能重命名建议
 * - 文本内容提取
 */

import type { Env } from '../types/env';
import { getDb, files } from '../db';
import { eq } from 'drizzle-orm';
import { getFileContent } from './utils';

const SUMMARY_MODEL = '@cf/meta/llama-3.1-8b-instruct' as const;
const IMAGE_MODEL = '@cf/llava-hf/llava-1.5-7b-hf' as const;
const IMAGE_TAG_MODEL = '@cf/microsoft/resnet-50' as const;

export interface SummaryResult {
  summary: string;
  cached: boolean;
}

export interface ImageTagResult {
  tags: string[];
  caption?: string;
}

export interface RenameSuggestion {
  suggestions: string[];
}

const EDITABLE_MIME_TYPES = [
  'text/',
  'application/json',
  'application/xml',
  'application/javascript',
  'application/typescript',
];

export async function generateFileSummary(
  env: Env,
  fileId: string,
  content?: string
): Promise<SummaryResult> {
  if (!env.AI) {
    throw new Error('AI service not configured');
  }

  const db = getDb(env.DB);
  const file = await db.select().from(files).where(eq(files.id, fileId)).get();

  if (!file) {
    throw new Error('File not found');
  }

  const cacheKey = `ai:summary:${fileId}:${file.hash || file.updatedAt}`;
  const cached = await env.KV.get(cacheKey);

  if (cached) {
    return { summary: cached, cached: true };
  }

  let textContent = content;
  if (!textContent) {
    textContent = await extractTextFromFile(env, file);
  }

  if (!textContent || textContent.length < 50) {
    return { summary: '', cached: false };
  }

  const truncatedContent = textContent.slice(0, 4096);

  try {
    const response = await (env.AI as any).run(SUMMARY_MODEL, {
      messages: [
        {
          role: 'system',
          content:
            '你是文件助手。请用简洁的中文（不超过3句话）概括文件内容。如果内容是代码，请说明代码的主要功能。',
        },
        {
          role: 'user',
          content: truncatedContent,
        },
      ],
      max_tokens: 200,
    });

    const summary = (response as { response?: string }).response?.trim() || '';

    await env.KV.put(cacheKey, summary, { expirationTtl: 86400 });

    await db
      .update(files)
      .set({
        aiSummary: summary,
        aiSummaryAt: new Date().toISOString(),
      })
      .where(eq(files.id, fileId));

    return { summary, cached: false };
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw error;
  }
}

export async function generateImageTags(
  env: Env,
  fileId: string,
  imageBuffer?: ArrayBuffer
): Promise<ImageTagResult> {
  if (!env.AI) {
    throw new Error('AI service not configured');
  }

  const db = getDb(env.DB);
  const file = await db.select().from(files).where(eq(files.id, fileId)).get();

  if (!file) {
    throw new Error('File not found');
  }

  let imageData = imageBuffer;
  if (!imageData) {
    imageData = await fetchFileContentAsBuffer(env, file) ?? undefined;
  }

  if (!imageData) {
    return { tags: [], caption: undefined };
  }

  const uint8Array = new Uint8Array(imageData);

  try {
    const tagResult = await (env.AI as any).run(IMAGE_TAG_MODEL, {
      image: Array.from(uint8Array),
    });

    const tags = parseImageTags(tagResult);

    let caption = '';
    try {
      const captionResult = await (env.AI as any).run(IMAGE_MODEL, {
        image: Array.from(uint8Array),
        prompt:
          '用中文简要描述这张图片的主要内容，用于文件管理系统的搜索标签。不超过20个字。',
      });
      caption =
        (captionResult as { description?: string }).description?.trim() || '';
    } catch (e) {
      console.warn('Failed to generate image caption:', e);
    }

    await db
      .update(files)
      .set({
        aiTags: JSON.stringify(tags),
        aiTagsAt: new Date().toISOString(),
        aiSummary: caption || undefined,
        aiSummaryAt: caption ? new Date().toISOString() : undefined,
      })
      .where(eq(files.id, fileId));

    return { tags, caption };
  } catch (error) {
    console.error('Failed to generate image tags:', error);
    throw error;
  }
}

export async function suggestFileName(
  env: Env,
  fileId: string,
  content?: string
): Promise<RenameSuggestion> {
  if (!env.AI) {
    throw new Error('AI service not configured');
  }

  const db = getDb(env.DB);
  const file = await db.select().from(files).where(eq(files.id, fileId)).get();

  if (!file) {
    throw new Error('File not found');
  }

  let textContent = content;
  if (!textContent) {
    textContent = await extractTextFromFile(env, file);
  }

  const ext = file.name.split('.').pop() || '';

  try {
    const response = await (env.AI as any).run(SUMMARY_MODEL, {
      messages: [
        {
          role: 'system',
          content: `你是文件命名助手。根据文件内容，建议3个简洁、有意义的中文文件名。
规则：
1. 每个文件名不超过20个字
2. 保留文件扩展名 .${ext}
3. 每行一个文件名，不要编号
4. 文件名要能反映文件的主要内容`,
        },
        {
          role: 'user',
          content: `原文件名：${file.name}\n文件内容：${textContent?.slice(0, 2000) || '（无内容）'}`,
        },
      ],
      max_tokens: 100,
    });

    const responseText = (response as { response?: string }).response || '';
    const suggestions = responseText
      .split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && s.includes('.'))
      .slice(0, 3);

    return { suggestions };
  } catch (error) {
    console.error('Failed to suggest file name:', error);
    throw error;
  }
}

async function extractTextFromFile(
  env: Env,
  file: typeof files.$inferSelect
): Promise<string> {
  const isEditable = EDITABLE_MIME_TYPES.some((type) =>
    file.mimeType?.startsWith(type)
  );

  if (!isEditable) {
    return '';
  }

  try {
    const content = await fetchFileContentAsBuffer(env, file);
    if (!content) return '';

    const decoder = new TextDecoder('utf-8');
    return decoder.decode(content).slice(0, 4096);
  } catch {
    return '';
  }
}

async function fetchFileContentAsBuffer(
  env: Env,
  file: typeof files.$inferSelect
): Promise<ArrayBuffer | null> {
  if (!file.bucketId || !file.r2Key) {
    return null;
  }

  try {
    const content = await getFileContent(env, file.bucketId, file.r2Key);
    return content;
  } catch (error) {
    console.error('Failed to fetch file content:', error);
    return null;
  }
}

function parseImageTags(result: unknown): string[] {
  if (!result) return [];

  const tags: string[] = [];

  if (Array.isArray(result)) {
    for (const item of result) {
      if (item && typeof item === 'object' && 'label' in item && typeof item.label === 'string') {
        tags.push(item.label.trim());
      }
    }
  } else if (typeof result === 'object' && result !== null) {
    const obj = result as Record<string, unknown>;
    if (typeof obj.label === 'string') {
      tags.push(...obj.label.split(',').map((t: string) => t.trim()));
    }
  }

  return [...new Set(tags)].slice(0, 5);
}
