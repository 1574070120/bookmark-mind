import { FolderTree, Trash2, Settings, Sparkles } from 'lucide-react';

export type ShellTab = 'organize' | 'cleanup' | 'settings';

export interface ShellNavItem {
  id: ShellTab;
  label: string;
  icon: typeof Sparkles;
}

export const SHELL_NAV_ITEMS: ShellNavItem[] = [
  { id: 'organize', label: '智能分类', icon: Sparkles },
  { id: 'cleanup', label: '清理书签', icon: Trash2 },
  { id: 'settings', label: 'AI 配置', icon: Settings },
];

export function getShellTitle(tab: ShellTab): string {
  const item = SHELL_NAV_ITEMS.find((navItem) => navItem.id === tab);
  return item?.label ?? 'BookmarkMind';
}

export function getShellSubtitle(tab: ShellTab): string {
  if (tab === 'organize') return 'AI 书签整理';
  if (tab === 'cleanup') return '检测和删除问题书签';
  return '配置模型与 API';
}
