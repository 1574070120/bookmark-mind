import { useState } from 'react';
import { Loader2, CircleDot, Settings, Sparkles, Trash2 } from 'lucide-react';
import AIConfigPanel from './components/AIConfigPanel';
import BookmarkList from './components/BookmarkList';
import CleanupPanel from './components/CleanupPanel';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAIConfig } from '../hooks/useAIConfig';
import { categorizeBookmarks } from '../services/ai-service';

type Tab = 'organize' | 'cleanup' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('organize');
  const { bookmarks, isLoading: bookmarksLoading, refresh } = useBookmarks();
  const { config, updateConfig, isConfigured } = useAIConfig();
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizeComplete, setOrganizeComplete] = useState(false);

  const handleOrganize = async () => {
    if (!isConfigured || bookmarks.length === 0) return;

    setIsOrganizing(true);
    setOrganizeComplete(false);
    try {
      const categories = await categorizeBookmarks(bookmarks, config);

      for (const category of categories) {
        const folder = await chrome.bookmarks.create({ title: category.name });
        for (const bookmark of category.bookmarks) {
          if (bookmark.id) {
            try {
              await chrome.bookmarks.move(bookmark.id, { parentId: folder.id });
            } catch (e) {
              console.error(`移动书签失败: ${bookmark.title}`, e);
            }
          }
        }
      }

      setOrganizeComplete(true);
      refresh();
    } catch (error) {
      console.error('整理失败:', error);
    } finally {
      setIsOrganizing(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
            <CircleDot className="h-4 w-4" />
          </div>
          <span className="font-semibold text-slate-900">BookmarkMind</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-xs text-slate-500">{isConfigured ? 'Ready' : 'Setup'}</span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="flex border-b border-slate-200 bg-white">
        <TabButton
          active={activeTab === 'organize'}
          onClick={() => setActiveTab('organize')}
          icon={<Sparkles className="h-4 w-4" />}
          label="整理"
        />
        <TabButton
          active={activeTab === 'cleanup'}
          onClick={() => setActiveTab('cleanup')}
          icon={<Trash2 className="h-4 w-4" />}
          label="清理"
        />
        <TabButton
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
          icon={<Settings className="h-4 w-4" />}
          label="设置"
        />
      </nav>

      {/* Content */}
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
        ) : (
          <BookmarkList
            bookmarks={bookmarks}
            onOrganize={handleOrganize}
            isOrganizing={isOrganizing}
            organizeComplete={organizeComplete}
            isAIConfigured={isConfigured}
            onResetComplete={() => setOrganizeComplete(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-2">
        <p className="text-center text-xs text-slate-400">
          {bookmarksLoading ? '加载中...' : `${bookmarks.length} 个书签`}
        </p>
      </footer>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default App;
