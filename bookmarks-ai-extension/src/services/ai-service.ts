import type { AIConfig, Category, ChromeBookmark } from '../types/index.ts';
import { DEFAULT_SYSTEM_PROMPT } from '../types/index.ts';

interface CategorizeRequest {
  bookmarks: ChromeBookmark[];
  systemPrompt: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface CategorizeResponse {
  categories: {
    name: string;
    description?: string;
    bookmarks: Array<{ title: string; url: string }>;
  }[];
}

export function buildChatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
}

export function parseCategorizeResponseContent(content: string): CategorizeResponse {
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }

  const trimmedContent = content.trim();
  try {
    return JSON.parse(trimmedContent);
  } catch {
    const parsed = parseFirstJsonObject(trimmedContent);
    if (parsed) {
      return parsed;
    }

    throw new Error('AI 响应不是有效 JSON');
  }
}

function parseFirstJsonObject(content: string): CategorizeResponse | null {
  for (let start = content.indexOf('{'); start >= 0; start = content.indexOf('{', start + 1)) {
    for (let end = content.lastIndexOf('}'); end > start; end = content.lastIndexOf('}', end - 1)) {
      try {
        return JSON.parse(content.slice(start, end + 1));
      } catch {
        // 继续尝试下一个候选 JSON 对象。
      }
    }
  }

  return null;
}

export async function categorizeBookmarks(
  bookmarks: ChromeBookmark[],
  config: AIConfig
): Promise<Category[]> {
  const { apiKey, baseUrl, model, systemPrompt } = config;

  if (!apiKey || !baseUrl || !model) {
    throw new Error('请先配置 AI API');
  }

  // 准备书签数据（限制数量避免 token 过多）
  const bookmarkData = bookmarks.slice(0, 100).map((b) => ({
    title: b.title,
    url: b.url,
  }));

  const prompt = `请分析以下书签并进行分类：

${JSON.stringify(bookmarkData, null, 2)}

请按照要求的 JSON 格式返回分类结果。`;

  try {
    const response = await fetch(buildChatCompletionsUrl(baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI 未返回有效响应');
    }

    const parsed = parseCategorizeResponseContent(content);

    // 将 AI 返回的书签与原始书签匹配
    const categories: Category[] = parsed.categories.map((cat) => ({
      name: cat.name,
      description: cat.description,
      bookmarks: cat.bookmarks.map((b) => {
        // 尝试匹配原始书签
        const matched = bookmarks.find(
          (orig) =>
            orig.url === b.url ||
            orig.title === b.title ||
            (b.url && orig.url && orig.url.includes(b.url))
        );
        return matched || { ...b };
      }),
    }));

    return categories;
  } catch (error) {
    console.error('AI 分类失败:', error);
    throw error;
  }
}
