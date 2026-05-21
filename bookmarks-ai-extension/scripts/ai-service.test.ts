import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildChatCompletionsUrl,
  parseCategorizeResponseContent,
} from '../src/services/ai-service.ts';

test('chat completions URL trims trailing slashes before appending the endpoint', () => {
  assert.equal(
    buildChatCompletionsUrl('https://api.minimax.io/v1/'),
    'https://api.minimax.io/v1/chat/completions'
  );
});

test('categorize response parser extracts JSON after model reasoning text', () => {
  const parsed = parseCategorizeResponseContent(`
思考过程：我先按技术和工具拆分。

{
  "categories": [
    {
      "name": "技术",
      "bookmarks": [
        {"title": "React", "url": "https://react.dev"}
      ]
    }
  ]
}
`);

  assert.equal(parsed.categories[0].name, '技术');
  assert.equal(parsed.categories[0].bookmarks[0].url, 'https://react.dev');
});
