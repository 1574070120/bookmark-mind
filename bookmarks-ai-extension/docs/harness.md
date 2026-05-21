# 工程 Harness

## 必跑验证

类型检查：

```bash
npm run typecheck
```

生产构建：

```bash
npm run build
```

清理逻辑回归：

```bash
npm run test:cleanup
```

全量轻量回归：

```bash
npm test
```

## 构建说明

`npm run build` 会执行：

1. `tsc`
2. `vite build`
3. `npm run fix:manifest`

`scripts/fix-manifest.js` 会把 Vite 生成的 hashed background 入口写回 `dist/manifest.json`，并修正 popup 路径。

## 当前护栏缺口

- 尚未接入通用单元测试框架。
- 尚未接入 lint 和格式化检查。
- Chrome 扩展真实运行仍需要在浏览器中加载 `dist/` 人工验证权限、popup 交互和书签移动结果。

## 本轮新增验证策略

为避免引入新依赖，本轮先使用 Node 内置 `assert` 和 `node --test` 编写清理逻辑回归测试。测试覆盖 URL 规范化、重复书签判定、无效 URL 判定和死链检测筛选边界。

当前已覆盖：

- 重复 URL 检测不会把大小写敏感路径误判为同一地址。
- 重复书签清理默认保留第一条，只选择可删除的重复项。
- 清理列表中重复组的勾选和取消勾选不会把保留项加入删除集合。
- 自定义模型输入后仍保持自定义选项选中。
- MiniMax 预设会写入 `https://api.minimax.io/v1` 和对应 MiniMax 模型。
- AI 响应前后夹带说明文本时，仍能提取其中的 JSON 分类结果。
- 分类应用会跳过没有 Chrome 书签 `id` 的 AI-only 匹配结果。
- 死链检测不会把网络错误或不可确认状态加入待删除列表，只标记明确 `404`、`410`。
