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
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          配置你的 AI API 以启用智能书签分类功能。当前支持 OpenAI 兼容接口和 MiniMax。
        </p>
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Key className="w-4 h-4" />
          API Key
        </label>
        <input
          type="password"
          value={config.apiKey}
          onChange={(e) => onUpdate({ ...config, apiKey: e.target.value })}
          placeholder="sk-..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Base URL */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Globe className="w-4 h-4" />
          API 地址
        </label>
        <input
          type="text"
          value={config.baseUrl}
          onChange={(e) => onUpdate({ ...config, baseUrl: e.target.value })}
          placeholder="https://api.openai.com/v1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        <p className="text-xs text-gray-500">
          MiniMax 默认使用 https://api.minimax.io/v1
        </p>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Brain className="w-4 h-4" />
          选择模型
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => handlePresetSelect(model.id)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                selectedModelOptionId === model.id
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="block font-medium">{model.name}</span>
              <span className="block text-xs opacity-75">{model.provider}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Model Input (for custom) */}
      {selectedModelOptionId === CUSTOM_MODEL_OPTION_ID && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">自定义模型名称</label>
          <input
            type="text"
            value={config.model === CUSTOM_MODEL_OPTION_ID ? '' : config.model}
            onChange={(e) => onUpdate({ ...config, model: e.target.value })}
            placeholder="输入模型名称"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
      )}

      {/* System Prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">系统提示词（可选）</label>
        <textarea
          value={config.systemPrompt}
          onChange={(e) => onUpdate({ ...config, systemPrompt: e.target.value })}
          placeholder="自定义 AI 行为..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
        />
        <p className="text-xs text-gray-500">
          留空将使用默认提示词
        </p>
      </div>

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={!config.apiKey || isTesting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 transition-colors"
      >
        <TestTube className="w-4 h-4" />
        {isTesting ? '测试中...' : '测试连接'}
      </button>

      {/* Test Result */}
      {testResult && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            testResult === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {testResult === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{testMessage}</span>
        </div>
      )}
    </div>
  );
}
