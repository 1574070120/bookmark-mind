# BookmarkMind - AI 书签整理

一个使用 AI 智能整理 Chrome 书签的 Chrome 扩展（Manifest V3）。

## 功能特性

### 1. AI 智能分类
- 自动分析书签内容，根据语义将书签分类到不同文件夹
- 支持预览分类结果，可选择性应用部分分类
- 支持 OpenAI、MiniMax 等兼容 `/chat/completions` 接口的 AI 模型

### 2. 书签清理
- 检测死链（需联网验证）
- 检测重复书签（基于 URL 去重）
- 检测空标题书签
- 检测无效 URL 格式
- 支持批量选择和删除问题书签

## 安装使用

### 环境要求
- Chrome 浏览器（版本 88+）
- Node.js 18+

### 开发预览

```bash
cd bookmarks-ai-extension
npm install
npm run dev
```

在 Chrome 中打开 `chrome://extensions/`，开启「开发者模式」，点击「加载已解压的扩展程序」，选择 `dist/` 目录。

### 生产构建

```bash
npm run build
```

构建完成后，将 `dist/` 目录作为未打包扩展加载到 Chrome。

## 配置 AI

1. 点击扩展图标打开 popup
2. 切换到「设置」标签
3. 选择预设模型（GPT-4o、MiniMax 等）或配置自定义模型
4. 填入 API Key 和 Base URL
5. 保存配置

## 技术栈

- **Chrome Extension** Manifest V3
- **React** 18
- **TypeScript** 5
- **Vite** 5
- **Tailwind CSS** 3
- **lucide-react** 图标库

## 项目结构

```
bookmarks-ai-extension/
├── public/
│   └── manifest.json          # 扩展配置文件
├── scripts/
│   └── fix-manifest.js       # 构建后修正 manifest 路径
├── src/
│   ├── background/
│   │   └── index.ts          # Service Worker
│   ├── hooks/
│   │   ├── useAIConfig.ts    # AI 配置管理
│   │   ├── useBookmarks.ts   # 书签读取
│   │   └── useCategories.ts  # 分类状态管理
│   ├── popup/
│   │   ├── App.tsx           # 主应用组件
│   │   ├── main.tsx          # 入口文件
│   │   ├── ui-shell.ts       # 侧边栏导航
│   │   └── components/
│   │       ├── AIConfigPanel.tsx      # AI 配置面板
│   │       ├── BookmarkList.tsx       # 书签列表/整理页
│   │       ├── CategoryPreview.tsx    # 分类预览
│   │       ├── CleanupPanel.tsx      # 清理功能面板
│   │       └── model-options.ts      # 预设模型配置
│   ├── services/
│   │   ├── ai-service.ts      # AI 请求和响应解析
│   │   └── cleanup-service.ts  # 问题书签检测
│   ├── styles/
│   │   └── globals.css        # 全局样式
│   └── types/
│       ├── ai-config.ts
│       ├── bookmark.ts
│       └── index.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## API 配置

默认支持的模型：

| 模型 | 提供商 | Base URL |
|------|--------|----------|
| GPT-4o | OpenAI | `https://api.openai.com/v1` |
| GPT-4o Mini | OpenAI | `https://api.openai.com/v1` |
| GPT-4 Turbo | OpenAI | `https://api.openai.com/v1` |
| MiniMax M2.7 | MiniMax | `https://api.minimaxi.com/v1` |
| MiniMax M2.7 极速 | MiniMax | `https://api.minimaxi.com/v1` |

也支持配置自定义模型。

## License

MIT
