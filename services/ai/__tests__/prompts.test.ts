import { createStructuredPrompt } from '../prompts';

describe('createStructuredPrompt', () => {
  it('keeps generated message text emoji-free', () => {
    expect(createStructuredPrompt('Ruth')).toContain(
      'Do not use emoji in message text.'
    );
  });
});
