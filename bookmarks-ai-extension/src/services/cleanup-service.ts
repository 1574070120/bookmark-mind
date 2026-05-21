import type { ChromeBookmark, BookmarkIssue } from '../types';

export interface CleanupResult {
  deadLinks: BookmarkIssue[];
  duplicates: BookmarkIssue[];
  emptyTitles: BookmarkIssue[];
  invalidUrls: BookmarkIssue[];
}

interface UrlStatusResult {
  status: 'alive' | 'dead' | 'unknown';
  httpStatus?: number;
}

export function getDeletableBookmarkIds(issue: BookmarkIssue): string[] {
  if (issue.type === 'duplicate') {
    return issue.relatedBookmarks?.flatMap((bookmark) => (bookmark.id ? [bookmark.id] : [])) ?? [];
  }

  return issue.bookmark.id ? [issue.bookmark.id] : [];
}

export function getSelectableBookmarkIds(result: CleanupResult): string[] {
  const issues = [
    ...result.deadLinks,
    ...result.duplicates,
    ...result.emptyTitles,
    ...result.invalidUrls,
  ];

  return [...new Set(issues.flatMap(getDeletableBookmarkIds))];
}

// 并发验证 URL 状态
async function checkUrlStatus(url: string, timeout = 5000): Promise<UrlStatusResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if ([404, 410].includes(response.status)) {
      return { status: 'dead', httpStatus: response.status };
    }

    if (response.ok || response.status >= 300) {
      return { status: 'alive', httpStatus: response.status };
    }

    return { status: 'unknown', httpStatus: response.status };
  } catch {
    return { status: 'unknown' };
  }
}

// 检测重复书签（基于 URL）
function findDuplicates(bookmarks: ChromeBookmark[]): BookmarkIssue[] {
  const urlMap = new Map<string, ChromeBookmark[]>();
  const issues: BookmarkIssue[] = [];

  for (const bookmark of bookmarks) {
    if (!bookmark.url) continue;
    const normalizedUrl = normalizeUrl(bookmark.url);
    const existing = urlMap.get(normalizedUrl) || [];
    existing.push(bookmark);
    urlMap.set(normalizedUrl, existing);
  }

  for (const [url, items] of urlMap) {
    if (items.length > 1) {
      issues.push({
        type: 'duplicate',
        bookmark: items[0],
        relatedBookmarks: items.slice(1),
        reason: `与 ${items.length - 1} 个书签重复`,
      });
    }
  }

  return issues;
}

// 检测空标题书签
function findEmptyTitles(bookmarks: ChromeBookmark[]): BookmarkIssue[] {
  const issues: BookmarkIssue[] = [];

  for (const bookmark of bookmarks) {
    const title = (bookmark.title || '').trim();
    // 空标题、太短、或者常见默认标题
    if (!title || title.length < 3 || isDefaultTitle(title)) {
      issues.push({
        type: 'empty-title',
        bookmark,
        reason: title ? '标题太短' : '标题为空',
      });
    }
  }

  return issues;
}

// 检测无效 URL
function findInvalidUrls(bookmarks: ChromeBookmark[]): BookmarkIssue[] {
  const issues: BookmarkIssue[] = [];

  for (const bookmark of bookmarks) {
    if (!bookmark.url) continue;
    if (!isValidUrl(bookmark.url)) {
      issues.push({
        type: 'invalid-url',
        bookmark,
        reason: 'URL 格式无效',
      });
    }
  }

  return issues;
}

// 批量检测死链
export async function checkDeadLinks(
  bookmarks: ChromeBookmark[],
  onProgress?: (current: number, total: number) => void
): Promise<BookmarkIssue[]> {
  const issues: BookmarkIssue[] = [];
  const batchSize = 10;
  const timeout = 5000;

  for (let i = 0; i < bookmarks.length; i += batchSize) {
    const batch = bookmarks.slice(i, i + batchSize);

    const results = await Promise.all(
      batch.map(async (bookmark) => {
        if (!bookmark.url) return null;

        const result = await checkUrlStatus(bookmark.url, timeout);
        if (result.status === 'dead') {
          return { bookmark, reason: `HTTP ${result.httpStatus}，页面不存在` };
        }
        return null;
      })
    );

    for (const result of results) {
      if (result) {
        issues.push({
          type: 'dead-link',
          ...result,
        });
      }
    }

    onProgress?.(Math.min(i + batchSize, bookmarks.length), bookmarks.length);
  }

  return issues;
}

// 执行完整清理检测
export async function detectIssues(
  bookmarks: ChromeBookmark[],
  options: {
    checkDeadLinks?: boolean;
    maxDeadLinkCheck?: number; // 限制死链检测数量
    onProgress?: (stage: string, current: number, total: number) => void;
  } = {}
): Promise<CleanupResult> {
  const { checkDeadLinks: doCheckDeadLinks = true, maxDeadLinkCheck = 50, onProgress } = options;

  const result: CleanupResult = {
    deadLinks: [],
    duplicates: [],
    emptyTitles: [],
    invalidUrls: [],
  };

  // 1. 检测无效 URL
  onProgress?.('检测无效URL', 0, bookmarks.length);
  result.invalidUrls = findInvalidUrls(bookmarks);
  onProgress?.('检测无效URL', bookmarks.length, bookmarks.length);

  // 2. 检测重复
  onProgress?.('检测重复书签', 0, bookmarks.length);
  result.duplicates = findDuplicates(bookmarks);
  onProgress?.('检测重复书签', bookmarks.length, bookmarks.length);

  // 3. 检测空标题
  onProgress?.('检测空标题', 0, bookmarks.length);
  result.emptyTitles = findEmptyTitles(bookmarks);
  onProgress?.('检测空标题', bookmarks.length, bookmarks.length);

  // 4. 检测死链（可选，且限制数量）
  if (doCheckDeadLinks) {
    const validBookmarks = bookmarks.filter(
      (b) => b.url && isValidUrl(b.url)
    );
    const toCheck = validBookmarks.slice(0, maxDeadLinkCheck);

    result.deadLinks = await checkDeadLinks(toCheck, (current, total) => {
      onProgress?.('检测死链', current, total);
    });
  }

  return result;
}

// 获取总问题数量
export function getTotalIssueCount(result: CleanupResult): number {
  return (
    result.deadLinks.length +
    result.duplicates.length +
    result.emptyTitles.length +
    result.invalidUrls.length
  );
}

// 工具函数
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.hash = '';
    return parsed.href;
  } catch {
    return url.trim();
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isDefaultTitle(title: string): boolean {
  const defaults = ['新标签页', 'New Tab', 'about:blank', '无标题'];
  return defaults.some((d) => title.includes(d));
}
