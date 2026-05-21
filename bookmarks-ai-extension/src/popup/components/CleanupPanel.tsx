import { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Link2Off,
  Copy,
  FileText,
  Globe,
  Loader2,
  Check,
  RefreshCw,
  Settings,
} from 'lucide-react';
import type { BookmarkIssue, ChromeBookmark } from '../../types';
import { detectIssues, getSelectableBookmarkIds, getTotalIssueCount } from '../../services';
import type { CleanupResult } from '../../services/cleanup-service';
import { isIssueSelected, toggleIssueSelection } from './cleanup-selection';

interface CleanupPanelProps {
  bookmarks: ChromeBookmark[];
  onRefresh: () => void;
}

const ISSUE_CONFIG: Record<string, {
  icon: typeof Link2Off;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  'dead-link': {
    icon: Link2Off,
    label: '死链',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  'duplicate': {
    icon: Copy,
    label: '重复',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  'empty-title': {
    icon: FileText,
    label: '空标题',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  'invalid-url': {
    icon: Globe,
    label: '无效URL',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
};

export default function CleanupPanel({ bookmarks, onRefresh }: CleanupPanelProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState({ stage: '', current: 0, total: 0 });
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const [options, setOptions] = useState({
    checkDeadLinks: true,
    maxDeadLinkCheck: 50,
  });

  const handleScan = async () => {
    setIsScanning(true);
    setDeleteComplete(false);
    setResult(null);
    setSelectedIssues(new Set());

    try {
      const scanResult = await detectIssues(bookmarks, {
        checkDeadLinks: options.checkDeadLinks,
        maxDeadLinkCheck: options.maxDeadLinkCheck,
        onProgress: (stage, current, total) => {
          setProgress({ stage, current, total });
        },
      });
      setResult(scanResult);

      setSelectedIssues(new Set(getSelectableBookmarkIds(scanResult)));
    } catch (error) {
      console.error('扫描失败:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleIssue = (issue: BookmarkIssue) => {
    setSelectedIssues(toggleIssueSelection(issue, selectedIssues));
  };

  const handleSelectAll = () => {
    if (!result) return;
    const allIds = new Set(getSelectableBookmarkIds(result));
    const selectedAll = [...allIds].every((id) => selectedIssues.has(id));
    if (selectedAll) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(allIds);
    }
  };

  const handleDelete = async () => {
    if (selectedIssues.size === 0) return;

    setIsDeleting(true);
    try {
      for (const id of selectedIssues) {
        try {
          await chrome.bookmarks.remove(id);
        } catch (e) {
          console.error(`删除书签失败: ${id}`, e);
        }
      }
      setDeleteComplete(true);
      onRefresh();
      setTimeout(() => {
        setResult(null);
        setSelectedIssues(new Set());
      }, 1500);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalIssues = result ? getTotalIssueCount(result) : 0;
  const selectedCount = selectedIssues.size;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-rose-500" />
          <h2 className="text-base font-semibold text-slate-900">清理书签</h2>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.checkDeadLinks}
              onChange={(e) => setOptions({ ...options, checkDeadLinks: e.target.checked })}
              className="h-4 w-4 rounded text-indigo-600"
            />
            <span className="text-slate-600">检测死链</span>
          </label>
          {options.checkDeadLinks && (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
              <Settings className="h-3 w-3" />
              <span>最多检测</span>
              <input
                type="number"
                value={options.maxDeadLinkCheck}
                onChange={(e) =>
                  setOptions({ ...options, maxDeadLinkCheck: parseInt(e.target.value) || 50 })
                }
                className="w-14 rounded-md border border-slate-200 bg-white px-2 py-1 text-center text-slate-700 outline-none"
                min={10}
                max={200}
              />
              <span>个</span>
            </div>
          )}
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning || bookmarks.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {progress.stage} ({progress.current}/{progress.total})
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5" />
              开始扫描
            </>
          )}
        </button>
      </div>

      {deleteComplete ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">清理完成!</h3>
          <p className="text-sm text-slate-500">已删除 {selectedCount} 个问题书签</p>
        </div>
      ) : result && totalIssues > 0 ? (
        <>
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">发现 {totalIssues} 个问题</p>
                <p className="text-xs text-slate-400">
                  已选择 {selectedCount} 个待删除
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {result && getSelectableBookmarkIds(result).every((id) => selectedIssues.has(id))
                    ? '取消全选'
                    : '全选'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selectedCount === 0 || isDeleting}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  删除
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {([
              { key: 'dead-link', issues: result.deadLinks },
              { key: 'duplicate', issues: result.duplicates },
              { key: 'empty-title', issues: result.emptyTitles },
              { key: 'invalid-url', issues: result.invalidUrls },
            ] as const).map(({ key, issues }) => {
              if (issues.length === 0) return null;
              const config = ISSUE_CONFIG[key];

              return (
                <div key={key}>
                  <div className="mb-2 flex items-center gap-2">
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                    <span className="font-medium text-slate-700">{config.label}</span>
                    <span className="text-sm text-slate-400">({issues.length})</span>
                  </div>
                  <div className="space-y-1">
                    {issues.map((issue: BookmarkIssue, index: number) => (
                      <IssueItem
                        key={`${issue.bookmark.id || index}`}
                        issue={issue}
                        isSelected={isIssueSelected(issue, selectedIssues)}
                        onToggle={() => toggleIssue(issue)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : result && totalIssues === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">书签很健康!</h3>
          <p className="text-sm text-slate-500">没有发现需要清理的书签</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <AlertTriangle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">点击开始扫描</h3>
          <p className="text-sm text-slate-500">
            检测死链、重复、空标题等问题书签
          </p>
        </div>
      )}
    </div>
  );
}

interface IssueItemProps {
  issue: BookmarkIssue;
  isSelected: boolean;
  onToggle: () => void;
}

function IssueItem({ issue, isSelected, onToggle }: IssueItemProps) {
  const config = ISSUE_CONFIG[issue.type];

  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors ${
        isSelected
          ? `${config.bgColor} ${config.borderColor}`
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      onClick={onToggle}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        onClick={(event) => event.stopPropagation()}
        className="h-4 w-4 flex-shrink-0 rounded text-indigo-600"
      />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">
          {issue.bookmark.title || '无标题'}
        </p>
        {issue.bookmark.url && (
          <p className="truncate text-xs text-slate-500">{issue.bookmark.url}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">{issue.reason}</p>
      </div>
      {issue.relatedBookmarks && issue.relatedBookmarks.length > 0 && (
        <span className="flex-shrink-0 text-xs text-slate-400">
          +{issue.relatedBookmarks.length}
        </span>
      )}
    </div>
  );
}
