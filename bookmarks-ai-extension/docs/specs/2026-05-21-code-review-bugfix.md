# 2026-05-21 代码审查与缺陷修复说明

## 背景

用户要求先学习当前项目，然后进行代码审查、修复 bug，并提出后续可扩展需求建议。

## 目标

- 梳理当前项目结构、运行方式和核心模块职责。
- 找出有证据的代码缺陷，优先修复会导致误删、误报或核心流程失败的问题。
- 补充最小可运行验证，保证缺陷修复可回归。
- 输出后续扩展需求建议。

## 非目标

- 不重构整体 UI。
- 不引入新的三方测试框架。
- 不实现完整多 AI 供应商协议适配。
- 不修改 Chrome 扩展权限模型，除非修复当前缺陷必须调整。

## 重点审查范围

- `src/services/cleanup-service.ts`
- `src/services/ai-service.ts`
- `src/popup/components/CleanupPanel.tsx`
- `src/popup/components/CategoryPreview.tsx`
- `scripts/fix-manifest.js`

## 验收标准

- `npm run test:cleanup` 可以覆盖本轮修复的清理逻辑。
- `npm run typecheck` 通过。
- `npm run build` 通过，并生成可加载扩展产物。
- 迭代文档记录实际修复、验证结果和剩余风险。
