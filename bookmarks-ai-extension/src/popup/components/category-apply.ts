import type { ChromeBookmark } from '../../types';

export interface MovableBookmark extends ChromeBookmark {
  id: string;
}

export function getMovableBookmarks(bookmarks: ChromeBookmark[]): MovableBookmark[] {
  return bookmarks.filter((bookmark): bookmark is MovableBookmark => Boolean(bookmark.id));
}
