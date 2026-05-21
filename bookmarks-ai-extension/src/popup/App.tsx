import { useState } from 'react';
import { Loader2, PanelLeftClose, PanelLeftOpen, CircleDot } from 'lucide-react';
import AIConfigPanel from './components/AIConfigPanel';
import BookmarkList from './components/BookmarkList';
import CategoryPreview from './components/CategoryPreview';
import CleanupPanel from './components/CleanupPanel';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAIConfig } from '../hooks/useAIConfig';
import { useCategories } from '../hooks/useCategories';
import { categorizeBookmarks } from '../services/ai-service';
import {
  SHELL_NAV_ITEMS,
  getShellSubtitle,
  getShellTitle,
  type ShellTab,
} from './ui-shell';

function App() {
  const [activeTab, setActiveTab] = useState<ShellTab>('organize');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { bookmarks, isLoading: bookmarksLoading, refresh } = useBookmarks();
  const { config, updateConfig, isConfigured } = useAIConfig();
  const { categories, setCategories, clearCategories } = useCategories();
  const [isCategorizing, setIsCategorizing] = useState(false);

  const handleOrganize = async () => {
    if (!isConfigured || bookmarks.length === 0) return;

    setIsCategorizing(true);
    try {
      const result = await categorizeBookmarks(bookmarks, config);
      setCategories(result);
    } catch (error) {
      console.error('分类失败:', error);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleClearCategories = () => {
    clearCategories();
    setActiveTab('organize');
  };

  return (
    <div className={`min-h-[640px] bg-slate-100 text-slate-900 ${sidebarCollapsed ? 'w-[760px]' : 'w-[980px]'}`}>
      <div className="flex min-h-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
        <aside className={`flex shrink-0 flex-col border-r border-slate-200 bg-slate-50 ${sidebarCollapsed ? 'w-[92px]' : 'w-[250px]'}`}>
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-4">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
                <CircleDot className="h-5 w-5" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-sm font-semibold leading-5">BookmarkMind</h1>
                  <p className="text-xs text-slate-500">{getShellSubtitle(activeTab)}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <div className="px-3 py-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              {!sidebarCollapsed ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">状态</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                    <span className={`h-2.5 w-2.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{isConfigured ? 'AI 已配置' : '等待配置'}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {bookmarksLoading ? '正在加载书签…' : `${bookmarks.length} 个书签`}
                  </p>
                </>
              ) : (
                <div className="flex justify-center">
                  <span className={`h-2.5 w-2.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2">
            {SHELL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                    active
                      ? 'border border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="min-w-0 text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 px-4 py-3">
            {!sidebarCollapsed ? (
              <p className="text-xs text-slate-400">
                适配桌面侧边栏布局
              </p>
            ) : null}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-slate-50">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{getShellTitle(activeTab)}</h2>
              <p className="text-xs text-slate-500">{getShellSubtitle(activeTab)}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${isConfigured ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                <span className={`h-2 w-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isConfigured ? 'Ready' : 'Need setup'}
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            {activeTab === 'settings' ? (
              <AIConfigPanel config={config} onUpdate={updateConfig} />
            ) : activeTab === 'cleanup' ? (
              bookmarksLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <CleanupPanel bookmarks={bookmarks} onRefresh={refresh} />
              )
            ) : bookmarksLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : categories.length > 0 ? (
              <CategoryPreview categories={categories} onClear={handleClearCategories} />
            ) : (
              <BookmarkList
                bookmarks={bookmarks}
                onOrganize={handleOrganize}
                isOrganizing={isCategorizing}
                isAIConfigured={isConfigured}
              />
            )}
          </main>
        </section>
      </div>
    </div>
  );
}

export default App;
