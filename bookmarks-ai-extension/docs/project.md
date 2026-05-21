# BookmarkMind 项目说明

## 项目目标

BookmarkMind 是一个 Chrome Manifest V3 扩展，用于在浏览器 popup 中读取当前用户书签，并提供两类能力：

- 使用用户配置的 AI API 对书签进行语义分类，预览后批量移动到新文件夹。
- 扫描问题书签，包括重复 URL、标题异常、URL 格式异常和可选死链检测。

## 业务范围

当前版本聚焦个人本地书签管理，不包含账号体系、云同步、团队协作、服务端存储或远程任务调度。

## 技术栈

- Chrome Extension Manifest V3
- React 18
- TypeScript
- Vite
- Tailwind CSS
- lucide-react 图标

## 核心模块

- `src/popup/`：扩展 popup 入口和交互界面。
- `src/hooks/`：书签读取、AI 配置和分类状态管理。
- `src/services/ai-service.ts`：AI 分类请求、响应解析和原始书签匹配。
- `src/services/cleanup-service.ts`：问题书签检测逻辑。
- `src/background/index.ts`：后台 service worker，保留消息式书签读取和整理能力。
- `public/manifest.json`：扩展权限、入口和图标配置。
- `scripts/fix-manifest.js`：构建后修正 Manifest 中 popup 与 background 产物路径。

## 运行方式

开发预览：

```bash
npm run dev
```

类型检查：

```bash
npm run typecheck
```

生产构建：

```bash
npm run build
```

构建完成后，将 `dist/` 作为未打包扩展加载到 Chrome。

## 当前约束

- 项目当前没有 Git 元数据，无法通过本地 Git diff 或提交记录追踪历史。
- 项目没有测试框架；本轮迭代优先补充不引入新依赖的最小 Node 验证脚本。
- AI 请求默认按 OpenAI 兼容 `/chat/completions` 协议实现，当前预设支持 OpenAI 兼容接口和 MiniMax；Anthropic/Gemini 原生协议尚未实现。
