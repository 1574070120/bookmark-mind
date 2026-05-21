import type { BookmarkIssue } from '../../types';
import { getDeletableBookmarkIds } from '../../services/cleanup-service.ts';

export function isIssueSelected(issue: BookmarkIssue, selectedIds: Set<string>): boolean {
  const deletableIds = getDeletableBookmarkIds(issue);
  return deletableIds.length > 0 && deletableIds.every((id) => selectedIds.has(id));
}

export function toggleIssueSelection(issue: BookmarkIssue, selectedIds: Set<string>): Set<string> {
  const nextSelectedIds = new Set(selectedIds);
  const deletableIds = getDeletableBookmarkIds(issue);

  if (deletableIds.length === 0) {
    return nextSelectedIds;
  }

  const shouldClear = deletableIds.every((id) => nextSelectedIds.has(id));

  for (const id of deletableIds) {
    if (shouldClear) {
      nextSelectedIds.delete(id);
    } else {
      nextSelectedIds.add(id);
    }
  }

  return nextSelectedIds;
}
