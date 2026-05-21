export interface ChromeBookmark {
  id?: string;
  title: string;
  url?: string;
  dateAdded?: number;
  parentId?: string;
  children?: ChromeBookmark[];
}

export interface Category {
  name: string;
  description?: string;
  bookmarks: ChromeBookmark[];
}

export type IssueType = 'dead-link' | 'duplicate' | 'empty-title' | 'invalid-url';

export interface BookmarkIssue {
  type: IssueType;
  bookmark: ChromeBookmark;
  reason: string;
  relatedBookmarks?: ChromeBookmark[];
}
