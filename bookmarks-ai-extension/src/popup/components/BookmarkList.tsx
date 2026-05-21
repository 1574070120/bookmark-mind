import { Sparkles, AlertCircle, Loader2, Check } from 'lucide-react';
import type { ChromeBookmark } from '../../types/bookmark';

interface BookmarkListProps {
  bookmarks: ChromeBookmark[];
  onOrganize: () => void;
  isOrganizing: boolean;
  organizeComplete: boolean;
  isAIConfigured: boolean;
  onResetComplete: () => void;
}

export default function BookmarkList({
  bookmarks,
  onOrganize,
  isOrganizing,
  organizeComplete,
  isAIConfigured,
  onResetComplete,
}: BookmarkListProps) {
  const bookmarkCount = bookmarks.length;

  if (bookmarkCount === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-sm rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Sparkles className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">没有书签可整理</h3>
          <p className="text-sm leading-6 text-slate-500">
            你的 Chrome 书签栏是空的，先添加一些书签吧
          </p>
        </div>
      </div>
    );
  }

  if (organizeComplete) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-sm rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <Check className="h-7 w-7 text-emerald-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-emerald-900">整理完成!</h3>
          <p className="text-sm leading-6 text-emerald-600">
            书签已按 AI 分类整理到新文件夹
          </p>
          <button
            onClick={onResetComplete}
            className="mt-4 text-sm text-emerald-600 underline hover:text-emerald-700"
          >
            继续整理更多书签
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-4">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>

        <h2 className="mb-2 text-xl font-semibold text-slate-900">AI 书签整理</h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          共 {bookmarkCount} 个未分类书签
        </p>

        {!isAIConfigured && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>请先在「设置」中配置 AI</span>
          </div>
        )}

        <button
          onClick={onOrganize}
          disabled={!isAIConfigured || isOrganizing}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-medium text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isOrganizing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>AI 整理中...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>一键整理</span>
            </>
          )}
        </button>

        {isOrganizing && (
          <div className="mt-6 w-64">
            <div className="mb-2 flex items-center justify-between text-xs text-indigo-600">
              <span>AI 正在分析和分类...</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
              <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
