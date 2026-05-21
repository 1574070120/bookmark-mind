export const CUSTOM_MODEL_OPTION_ID = 'custom';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

export const PRESET_MODELS: ModelOption[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'MiniMax-M2.7', name: 'MiniMax M2.7', provider: 'MiniMax' },
  { id: 'MiniMax-M2.7-highspeed', name: 'MiniMax M2.7 极速', provider: 'MiniMax' },
  { id: CUSTOM_MODEL_OPTION_ID, name: '自定义模型', provider: 'Custom' },
];

export function resolvePresetModelConfig(modelId: string): { model: string; baseUrl: string } | null {
  const preset = PRESET_MODELS.find((model) => model.id === modelId);
  if (!preset || preset.id === CUSTOM_MODEL_OPTION_ID) {
    return null;
  }

  if (preset.provider === 'MiniMax') {
    return { model: modelId, baseUrl: 'https://api.minimax.io/v1' };
  }

  return { model: modelId, baseUrl: 'https://api.openai.com/v1' };
}

export function getSelectedModelOptionId(modelId: string): string {
  const isPreset = PRESET_MODELS.some(
    (model) => model.id === modelId && model.id !== CUSTOM_MODEL_OPTION_ID
  );

  return isPreset ? modelId : CUSTOM_MODEL_OPTION_ID;
}
