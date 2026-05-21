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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">整理完成!</h3>
        <p className="text-sm text-gray-500">书签已按分类整理到新文件夹</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">分类预览</h2>
            <p className="text-sm text-gray-500">
              AI 将为你创建 {categories.length} 个分类
            </p>
          </div>
          <button
            onClick={onClear}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            title="取消"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            {selectedCategories.size === categories.length ? '取消全选' : '全选'}
          </button>
          <button
            onClick={handleApply}
            disabled={selectedCategories.size === 0 || isApplying}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                应用中...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                应用分类
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.name}>
              <div
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedCategories.has(category.name)
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleCategory(category.name)}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category.name)}
                  onChange={() => toggleCategory(category.name)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <Folder className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.bookmarks.length} 个书签</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(category.name);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedFolders.has(category.name) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              {expandedFolders.has(category.name) && (
                <ul className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                  {category.bookmarks.map((bookmark, index) => (
                    <li
                      key={bookmark.id || index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-600 truncate">{bookmark.title}</span>
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
