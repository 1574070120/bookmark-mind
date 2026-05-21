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
      <div className="flex h-full items-center justify-center p-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Sparkles className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-slate-900">没有书签可整理</h3>
          <p className="text-xs text-slate-500">你的书签栏是空的</p>
        </div>
      </div>
    );
  }

  if (organizeComplete) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-emerald-900">整理完成!</h3>
          <p className="mb-3 text-xs text-emerald-600">书签已按分类整理</p>
          <button
            onClick={onResetComplete}
            className="text-xs text-emerald-600 underline hover:text-emerald-700"
          >
            继续整理
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      {/* Main Action */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
          <Sparkles className="h-7 w-7 text-white" />
        </div>

        <h2 className="mb-1 text-base font-semibold text-slate-900">AI 书签整理</h2>
        <p className="mb-4 text-xs text-slate-500">{bookmarkCount} 个未分类书签</p>

        {!isAIConfigured && (
          <div className="mb-4 flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>请先配置 AI</span>
          </div>
        )}

        <button
          onClick={onOrganize}
          disabled={!isAIConfigured || isOrganizing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isOrganizing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>整理中...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>一键整理</span>
            </>
          )}
        </button>

        {isOrganizing && (
          <div className="mt-4 w-full max-w-[200px]">
            <div className="mb-1.5 flex justify-between text-xs text-indigo-600">
              <span>AI 分析中</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-indigo-100">
              <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
