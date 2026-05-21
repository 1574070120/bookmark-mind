import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import type { ChromeBookmark } from '../../types/bookmark';

interface BookmarkListProps {
  bookmarks: ChromeBookmark[];
  onOrganize: () => void;
  isOrganizing: boolean;
  isAIConfigured: boolean;
}

export default function BookmarkList({
  bookmarks,
  onOrganize,
  isOrganizing,
  isAIConfigured,
}: BookmarkListProps) {
  const bookmarkCount = bookmarks.length;

  if (bookmarkCount === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">没有书签可整理</h3>
        <p className="text-sm text-gray-500">
          你的 Chrome 书签栏是空的，先添加一些书签吧
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Summary */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">书签整理</h2>
            <p className="text-sm text-gray-500">
              共发现 {bookmarkCount} 个未分类书签
            </p>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{bookmarkCount}</div>
        </div>

        {!isAIConfigured && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 mb-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>请先在「AI 配置」中设置 API Key</span>
          </div>
        )}

        <button
          onClick={onOrganize}
          disabled={!isAIConfigured || isOrganizing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
        >
          {isOrganizing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI 正在分析中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>AI 智能分类</span>
            </>
          )}
        </button>

        {/* Progress Bar */}
        {isOrganizing && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-indigo-600 mb-1">
              <span>正在分析书签...</span>
              <span>请稍候</span>
            </div>
            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Bookmark Preview */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">待整理的书签</h3>
        <ul className="space-y-1">
          {bookmarks.slice(0, 20).map((bookmark, index) => (
            <li
              key={bookmark.id || index}
              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100"
            >
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-400">🔗</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {bookmark.title || '无标题'}
                </p>
                <p className="text-xs text-gray-400 truncate">{bookmark.url}</p>
              </div>
            </li>
          ))}
          {bookmarks.length > 20 && (
            <li className="text-sm text-gray-400 text-center py-2">
              还有 {bookmarks.length - 20} 个书签...
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
