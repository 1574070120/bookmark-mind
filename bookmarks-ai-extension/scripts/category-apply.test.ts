import assert from 'node:assert/strict';
import test from 'node:test';
import { getMovableBookmarks } from '../src/popup/components/category-apply.ts';
import type { ChromeBookmark } from '../src/types/index.ts';

test('category apply skips AI bookmarks that cannot be matched to an original bookmark id', () => {
  const bookmarks: ChromeBookmark[] = [
    { id: '1', title: 'Matched', url: 'https://example.com' },
    { title: 'AI only', url: 'https://missing.example.com' },
  ];

  assert.deepEqual(getMovableBookmarks(bookmarks), [
    { id: '1', title: 'Matched', url: 'https://example.com' },
  ]);
});
