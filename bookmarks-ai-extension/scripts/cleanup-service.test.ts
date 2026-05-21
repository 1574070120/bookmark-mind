import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkDeadLinks,
  detectIssues,
  getDeletableBookmarkIds,
  getSelectableBookmarkIds,
} from '../src/services/cleanup-service.ts';
import type { ChromeBookmark } from '../src/types/index.ts';

test('duplicate detection preserves case-sensitive path differences', async () => {
  const bookmarks: ChromeBookmark[] = [
    { id: 'upper', title: 'Upper path', url: 'https://example.com/Foo' },
    { id: 'lower', title: 'Lower path', url: 'https://example.com/foo' },
  ];

  const result = await detectIssues(bookmarks, { checkDeadLinks: false });

  assert.equal(result.duplicates.length, 0);
});

test('duplicate cleanup selects related duplicates and preserves the first bookmark', async () => {
  const bookmarks: ChromeBookmark[] = [
    { id: 'keep', title: 'Original', url: 'https://example.com/docs' },
    { id: 'delete-1', title: 'Duplicate 1', url: 'HTTPS://EXAMPLE.COM/docs' },
    { id: 'delete-2', title: 'Duplicate 2', url: 'https://example.com:443/docs' },
  ];

  const result = await detectIssues(bookmarks, { checkDeadLinks: false });
  const duplicateIssue = result.duplicates[0];

  assert.deepEqual(getDeletableBookmarkIds(duplicateIssue), ['delete-1', 'delete-2']);
  assert.deepEqual(getSelectableBookmarkIds(result), ['delete-1', 'delete-2']);
});

test('dead link detection does not mark unknown network failures as deletable dead links', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };

  try {
    const issues = await checkDeadLinks([
      { id: 'uncertain', title: 'Uncertain', url: 'https://example.com' },
    ]);

    assert.equal(issues.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('dead link detection marks explicit 404 as a dead link', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 404 });

  try {
    const issues = await checkDeadLinks([
      { id: 'missing', title: 'Missing', url: 'https://example.com/missing' },
    ]);

    assert.equal(issues.length, 1);
    assert.equal(issues[0].reason, 'HTTP 404，页面不存在');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
