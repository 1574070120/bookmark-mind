import { useState } from 'react';
import { Key, Globe, Brain, AlertCircle, CheckCircle, TestTube } from 'lucide-react';
import type { AIConfig } from '../../types/ai-config';
import {
  CUSTOM_MODEL_OPTION_ID,
  PRESET_MODELS,
  resolvePresetModelConfig,
  getSelectedModelOptionId,
} from './model-options';
import { buildChatCompletionsUrl } from '../../services/ai-service';

interface AIConfigPanelProps {
  config: AIConfig;
  onUpdate: (config: AIConfig) => void;
}

export default function AIConfigPanel({ config, onUpdate }: AIConfigPanelProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const selectedModelOptionId = getSelectedModelOptionId(config.model);

  const handlePresetSelect = (modelId: string) => {
    if (modelId === CUSTOM_MODEL_OPTION_ID) {
      return;
    }

    const presetConfig = resolvePresetModelConfig(modelId);
    if (presetConfig) {
      onUpdate({
        ...config,
        model: presetConfig.model,
        baseUrl: presetConfig.baseUrl,
      });
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestMessage('');

    try {
      const response = await fetch(buildChatCompletionsUrl(config.baseUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        setTestResult('success');
        setTestMessage('连接成功！API 配置正确。');
      } else {
        const error = await response.json().catch(() => ({}));
        setTestResult('error');
        setTestMessage(`连接失败: ${error.error?.message || response.statusText}`);
      }
    } catch (error) {
      setTestResult('error');
      setTestMessage(`连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm leading-6 text-slate-600">
            配置 AI API 后可使用智能分类。当前支持 OpenAI 兼容接口和 MiniMax。
          </p>
        </div>

        <div className="grid gap-4">
          {/* API Key */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Key className="h-4 w-4" />
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => onUpdate({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Base URL */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Globe className="h-4 w-4" />
              API 地址
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => onUpdate({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-xs text-slate-500">
              MiniMax 默认使用 https://api.minimax.io/v1
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Brain className="h-4 w-4" />
              选择模型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handlePresetSelect(model.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    selectedModelOptionId === model.id
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-medium">{model.name}</span>
                  <span className="block text-xs text-slate-400">{model.provider}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Input (for custom) */}
          {selectedModelOptionId === CUSTOM_MODEL_OPTION_ID && (
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-sm font-medium text-slate-700">自定义模型名称</label>
              <input
                type="text"
                value={config.model === CUSTOM_MODEL_OPTION_ID ? '' : config.model}
                onChange={(e) => onUpdate({ ...config, model: e.target.value })}
                placeholder="输入模型名称"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}

          {/* System Prompt */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-sm font-medium text-slate-700">系统提示词（可选）</label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => onUpdate({ ...config, systemPrompt: e.target.value })}
              placeholder="自定义 AI 行为..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-xs text-slate-500">
              留空将使用默认提示词
            </p>
          </div>

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={!config.apiKey || isTesting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TestTube className="h-4 w-4" />
            {isTesting ? '测试中...' : '测试连接'}
          </button>

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-center gap-2 rounded-2xl border p-3 text-sm ${
                testResult === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {testResult === 'success' ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{testMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
