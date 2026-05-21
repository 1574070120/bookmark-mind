import { useState, useEffect } from 'react';
import type { ChromeBookmark } from '../types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<ChromeBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tree = await chrome.bookmarks.getTree();
      const flatBookmarks: ChromeBookmark[] = [];

      const flattenBookmarks = (nodes: ChromeBookmark[]) => {
        for (const node of nodes) {
          if (node.url) {
            flatBookmarks.push({
              id: node.id,
              title: node.title,
              url: node.url,
              dateAdded: node.dateAdded,
              parentId: node.parentId,
            });
          }
          if (node.children) {
            flattenBookmarks(node.children);
          }
        }
      };

      flattenBookmarks(tree);
      setBookmarks(flatBookmarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载书签失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  return { bookmarks, isLoading, error, refresh: loadBookmarks };
}
