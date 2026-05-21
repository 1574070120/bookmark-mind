# 2026-05-21 MiniMax 支持与风险修复说明

## 背景

上一轮代码审查后仍有几个可落地风险：死链检测结果不可解释、AI 供应商预设与实际 OpenAI-compatible 请求协议不一致、AI 返回中如果夹带推理文本可能导致 JSON 解析失败。本轮在修复这些风险后，扩展 AI 配置能力，支持用户配置 MiniMax。

## 目标

- 支持 MiniMax OpenAI-compatible Chat Completions 配置。
- 将模型预设收敛到当前实际支持的 OpenAI-compatible 协议，避免展示未实现原生协议的供应商。
- 死链检测只标记明确的 `404`、`410` 等不可用状态，不把 CORS、网络错误或不透明响应自动当作可删除死链。
- 增强 AI JSON 解析，允许响应前后夹带推理说明或 Markdown 代码块。
- 补充回归测试并更新中文文档。

## 非目标

- 不实现 Anthropic 或 Gemini 原生协议适配。
- 不接入 MiniMax CLI；扩展仍通过用户填写 API Key 调用 MiniMax HTTP API。
- 不增加服务端代理。
- 不增加三方测试依赖。

## 设计

### AI 配置

当前 `categorizeBookmarks` 使用 `/chat/completions` 形式调用 AI。MiniMax 官方 OpenAI-compatible 文档支持 `https://api.minimax.io/v1/chat/completions` 和 `MiniMax-M2.7` 等模型。因此本轮新增 MiniMax 预设：

- `MiniMax-M2.7`
- `MiniMax-M2.7-highspeed`

选择 MiniMax 预设时，自动填充：

- `baseUrl`: `https://api.minimax.io/v1`
- `model`: 对应 MiniMax 模型名

### 协议边界

当前 UI 只展示 OpenAI-compatible 可直接工作的供应商。Anthropic/Gemini 原生协议后续单独设计，避免当前用户误以为已经可用。

### 死链检测

死链扫描改为保守策略：

- 明确 `404`、`410`：标记为死链。
- `2xx`、`3xx`：视为可访问。
- `401`、`403`、`405`、`429`、`5xx`、网络错误、CORS 不可见、不透明响应：不自动加入删除列表。

### AI JSON 解析

AI 分类服务先解析 Markdown JSON 代码块；如果没有代码块，则从响应文本中扫描可解析 JSON 对象，避免 MiniMax 等推理模型在 JSON 外输出说明时解析失败。

## 验收标准

- MiniMax 预设选择后，配置为 `https://api.minimax.io/v1` 和 `MiniMax-M2.7`。
- AI 请求 MiniMax 时使用 `/chat/completions` 路径。
- 死链检测不会把网络错误或不可确认状态加入可删除列表。
- 带有推理文本和 JSON 的 AI 响应可以被解析。
- `npm test`、`npm run typecheck`、`npm run build` 通过。
