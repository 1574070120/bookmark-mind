import { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, Check, X, Loader2 } from 'lucide-react';
import type { Category } from '../../types/bookmark';
import { getMovableBookmarks } from './category-apply';

interface CategoryPreviewProps {
  categories: Category[];
  onClear: () => void;
}

export default function CategoryPreview({ categories, onClear }: CategoryPreviewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.name))
  );
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleCategory = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map((c) => c.name)));
    }
  };

  const handleApply = async () => {
    if (selectedCategories.size === 0) return;

    setIsApplying(true);
    try {
      const categoriesToApply = categories.filter((c) => selectedCategories.has(c.name));

      // Create folders and move bookmarks
      for (const category of categoriesToApply) {
        // Create folder
        const folder = await chrome.bookmarks.create({
          title: category.name,
        });

        // Move bookmarks to folder
        for (const bookmark of getMovableBookmarks(category.bookmarks)) {
          try {
            await chrome.bookmarks.move(bookmark.id, { parentId: folder.id });
          } catch (e) {
            console.error(`移动书签失败: ${bookmark.title}`, e);
          }
        }
      }

      setApplied(true);
      setTimeout(() => {
        onClear();
      }, 1500);
    } catch (error) {
      console.error('应用分类失败:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (applied) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">整理完成!</h3>
        <p className="text-sm text-slate-500">书签已按分类整理到新文件夹</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">分类预览</h2>
            <p className="text-sm text-slate-500">
              AI 将为你创建 {categories.length} 个分类
            </p>
          </div>
          <button
            onClick={onClear}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100"
            title="取消"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            {selectedCategories.size === categories.length ? '取消全选' : '全选'}
          </button>
          <button
            onClick={handleApply}
            disabled={selectedCategories.size === 0 || isApplying}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                应用中...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                应用分类
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.name}>
              <div
                className={`flex cursor-pointer items-center gap-2 rounded-2xl border p-3 transition-colors ${
                  selectedCategories.has(category.name)
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => toggleCategory(category.name)}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category.name)}
                  onChange={() => toggleCategory(category.name)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <Folder className="h-5 w-5 flex-shrink-0 text-indigo-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.bookmarks.length} 个书签</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(category.name);
                  }}
                  className="rounded-lg p-1 transition-colors hover:bg-slate-100"
                >
                  {expandedFolders.has(category.name) ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>

              {expandedFolders.has(category.name) && (
                <ul className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 pl-2">
                  {category.bookmarks.map((bookmark, index) => (
                    <li
                      key={bookmark.id || index}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"
                    >
                      <span className="truncate text-sm text-slate-600">{bookmark.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
