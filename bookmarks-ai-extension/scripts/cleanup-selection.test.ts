import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isIssueSelected,
  toggleIssueSelection,
} from '../src/popup/components/cleanup-selection.ts';
import type { BookmarkIssue } from '../src/types/index.ts';

const duplicateIssue: BookmarkIssue = {
  type: 'duplicate',
  bookmark: { id: 'keep', title: 'Original', url: 'https://example.com' },
  relatedBookmarks: [
    { id: 'delete-1', title: 'Duplicate 1', url: 'https://example.com' },
    { id: 'delete-2', title: 'Duplicate 2', url: 'https://example.com' },
  ],
  reason: '与 2 个书签重复',
};

test('duplicate issue is selected when all deletable duplicate ids are selected', () => {
  assert.equal(isIssueSelected(duplicateIssue, new Set(['delete-1', 'delete-2'])), true);
  assert.equal(isIssueSelected(duplicateIssue, new Set(['keep'])), false);
});

test('toggling duplicate issue selects and clears only duplicate ids', () => {
  const selected = toggleIssueSelection(duplicateIssue, new Set<string>());
  assert.deepEqual([...selected].sort(), ['delete-1', 'delete-2']);

  const cleared = toggleIssueSelection(duplicateIssue, selected);
  assert.deepEqual([...cleared], []);
});
