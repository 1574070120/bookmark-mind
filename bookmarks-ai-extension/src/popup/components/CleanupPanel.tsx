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
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-800">清理书签</h2>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.checkDeadLinks}
              onChange={(e) => setOptions({ ...options, checkDeadLinks: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-gray-600">检测死链</span>
          </label>
          {options.checkDeadLinks && (
            <div className="flex items-center gap-1 text-gray-500">
              <Settings className="w-3 h-3" />
              <span>最多检测</span>
              <input
                type="number"
                value={options.maxDeadLinkCheck}
                onChange={(e) =>
                  setOptions({ ...options, maxDeadLinkCheck: parseInt(e.target.value) || 50 })
                }
                className="w-14 px-2 py-1 border border-gray-300 rounded text-center"
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
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {progress.stage} ({progress.current}/{progress.total})
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              开始扫描
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {deleteComplete ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">清理完成!</h3>
          <p className="text-sm text-gray-500">已删除 {selectedCount} 个问题书签</p>
        </div>
      ) : result && totalIssues > 0 ? (
        <>
          {/* Summary */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">发现 {totalIssues} 个问题</p>
                <p className="text-xs text-gray-400">
                  已选择 {selectedCount} 个待删除
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  {result && getSelectableBookmarkIds(result).every((id) => selectedIssues.has(id))
                    ? '取消全选'
                    : '全选'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selectedCount === 0 || isDeleting}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  删除
                </button>
              </div>
            </div>
          </div>

          {/* Issue List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  <div className="flex items-center gap-2 mb-2">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <span className="font-medium text-gray-700">{config.label}</span>
                    <span className="text-sm text-gray-400">({issues.length})</span>
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">书签很健康!</h3>
          <p className="text-sm text-gray-500">没有发现需要清理的书签</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">点击开始扫描</h3>
          <p className="text-sm text-gray-500">
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
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? `${config.bgColor} ${config.borderColor}`
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        onClick={(event) => event.stopPropagation()}
        className="w-4 h-4 text-indigo-600 rounded flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {issue.bookmark.title || '无标题'}
        </p>
        {issue.bookmark.url && (
          <p className="text-xs text-gray-400 truncate">{issue.bookmark.url}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{issue.reason}</p>
      </div>
      {issue.relatedBookmarks && issue.relatedBookmarks.length > 0 && (
        <span className="text-xs text-gray-400 flex-shrink-0">
          +{issue.relatedBookmarks.length}
        </span>
      )}
    </div>
  );
}
