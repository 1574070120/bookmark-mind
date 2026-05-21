// Background Service Worker for BookmarkMind

// 监听来自 popup 或 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_BOOKMARKS') {
    handleGetBookmarks()
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true; // 异步响应
  }

  if (message.type === 'ORGANIZE_BOOKMARKS') {
    handleOrganizeBookmarks(message.categories)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }
});

async function handleGetBookmarks() {
  const tree = await chrome.bookmarks.getTree();
  return flattenBookmarks(tree);
}

function flattenBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[]): chrome.bookmarks.BookmarkTreeNode[] {
  const result: chrome.bookmarks.BookmarkTreeNode[] = [];

  for (const node of nodes) {
    if (node.url) {
      result.push({
        id: node.id,
        title: node.title,
        url: node.url,
        dateAdded: node.dateAdded,
        parentId: node.parentId,
      });
    }
    if (node.children) {
      result.push(...flattenBookmarks(node.children));
    }
  }

  return result;
}

async function handleOrganizeBookmarks(categories: Array<{
  name: string;
  bookmarks: Array<{ id?: string; title: string; url: string }>;
}>) {
  const results: Array<{ folderId: string; movedCount: number }> = [];

  for (const category of categories) {
    // 创建文件夹
    const folder = await chrome.bookmarks.create({
      title: category.name,
    });

    let movedCount = 0;

    // 移动书签到文件夹
    for (const bookmark of category.bookmarks) {
      if (bookmark.id) {
        try {
          await chrome.bookmarks.move(bookmark.id, { parentId: folder.id });
          movedCount++;
        } catch (error) {
          console.error(`移动书签失败: ${bookmark.title}`, error);
        }
      }
    }

    results.push({ folderId: folder.id, movedCount });
  }

  return results;
}

// 扩展安装时执行
chrome.runtime.onInstalled.addListener(() => {
  console.log('BookmarkMind 已安装');
});
