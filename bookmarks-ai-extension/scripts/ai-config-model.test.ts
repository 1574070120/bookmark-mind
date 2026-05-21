import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CUSTOM_MODEL_OPTION_ID,
  getSelectedModelOptionId,
  resolvePresetModelConfig,
} from '../src/popup/components/model-options.ts';

test('custom model option remains selected after entering a custom model name', () => {
  assert.equal(getSelectedModelOptionId('deepseek-chat'), CUSTOM_MODEL_OPTION_ID);
});

test('preset model selection resolves the provider base URL and model id', () => {
  assert.deepEqual(resolvePresetModelConfig('gpt-4o-mini'), {
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
  });
});

test('minimax preset selection resolves OpenAI-compatible MiniMax endpoint', () => {
  assert.deepEqual(resolvePresetModelConfig('MiniMax-M2.7'), {
    model: 'MiniMax-M2.7',
    baseUrl: 'https://api.minimax.io/v1',
  });
});
