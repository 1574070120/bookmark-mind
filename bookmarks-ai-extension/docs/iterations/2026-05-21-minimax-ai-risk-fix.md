# 2026-05-21 MiniMax 支持与风险修复迭代

## 迭代目标

修复上一轮遗留的安全风险，并在当前 OpenAI-compatible 协议基础上支持 MiniMax AI 配置。

## 本次范围

- MiniMax 模型预设。
- AI 请求 URL 和请求体构建工具。
- AI 响应 JSON 解析增强。
- 死链检测保守化。
- 中文文档和回归测试。

## 不做范围

- 不实现 Anthropic/Gemini 原生协议。
- 不新增服务端。
- 不新增三方依赖。
- 不改整体 UI 视觉风格。

## 计划任务

- [x] 阅读上一轮文档和当前 AI/清理路径。
- [x] 补充 MiniMax、AI JSON 解析、死链检测红测。
- [x] 实现 MiniMax 预设和 AI 请求工具。
- [x] 实现保守死链检测。
- [x] 更新文档和 changelog。
- [x] 运行完整验证。

## 完成记录

- 新增 MiniMax 预设：`MiniMax-M2.7`、`MiniMax-M2.7-highspeed`，默认 API 地址为 `https://api.minimax.io/v1`。
- 移除当前 UI 中尚未原生适配的 Anthropic/Gemini 预设，避免用户误选后请求协议不匹配。
- 新增 `buildChatCompletionsUrl`，测试连接与实际分类复用同一 URL 构建规则。
- AI 响应解析增强，支持从推理文本或 Markdown JSON 代码块中提取分类 JSON。
- 死链检测改为保守策略，只将明确 `404`、`410` 标记为死链；网络错误、CORS 不可见、权限限制等不进入默认删除列表。

## 验证记录

- `npm run typecheck`：通过。
- `npm test`：通过，12 个测试全部通过。
- `npm run build`：通过，生成 `dist/` 扩展产物并修正 manifest。

## 剩余风险

- 尚未用真实 MiniMax API Key 在 Chrome 扩展环境中完成端到端调用。
- 死链检测保守化后会降低误删风险，但也可能漏报部分真实不可访问链接。
- Anthropic/Gemini 原生协议如需支持，需要新增供应商适配层。
