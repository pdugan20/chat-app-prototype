import { MOCK_RESPONSES } from '../constants';
import { AIServiceManager } from '../manager';
import { AIService, AIStructuredResponse } from '../types';

const response: AIStructuredResponse = { type: 'text', content: 'live reply' };

const service = (
  configured: boolean,
  generate = jest.fn().mockResolvedValue(response)
): AIService => ({
  generateStructuredResponse: generate,
  isConfigured: () => configured,
  addMentionedSong: jest.fn(),
  getMentionedSongs: jest.fn().mockReturnValue(['existing song']),
  resetMentionedSongs: jest.fn(),
});

describe('AIServiceManager', () => {
  it('selects a configured proxy service', async () => {
    const live = service(true);
    const fallback = service(true);
    const manager = new AIServiceManager(live, fallback);

    expect(manager.isConfigured()).toBe(true);
    expect(manager.getCurrentProvider()).toBe('proxy');
    await expect(
      manager.generateStructuredResponse([{ role: 'user', content: 'hello' }])
    ).resolves.toEqual(response);
    expect(live.generateStructuredResponse).toHaveBeenCalledTimes(1);
    expect(fallback.generateStructuredResponse).not.toHaveBeenCalled();
  });

  it('selects the mock service when the proxy is not configured', async () => {
    const live = service(false);
    const fallback = service(true);
    const manager = new AIServiceManager(live, fallback);

    expect(manager.getCurrentProvider()).toBe('mock');
    await manager.generateStructuredResponse([
      { role: 'user', content: 'hello' },
    ]);
    expect(fallback.generateStructuredResponse).toHaveBeenCalledTimes(1);
    expect(live.generateStructuredResponse).not.toHaveBeenCalled();
  });

  it('returns the existing fallback when the live service rejects', async () => {
    const generate = jest.fn().mockRejectedValue(new Error('proxy offline'));
    const manager = new AIServiceManager(
      service(true, generate),
      service(true)
    );
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await expect(
      manager.generateStructuredResponse([{ role: 'user', content: 'hello' }])
    ).resolves.toEqual({
      type: 'text',
      content: MOCK_RESPONSES.fallback[0],
    });

    consoleError.mockRestore();
  });

  it('delegates song tracking to the selected service', () => {
    const live = service(true);
    const manager = new AIServiceManager(live, service(true));

    manager.addMentionedSong('Superstition');
    expect(live.addMentionedSong).toHaveBeenCalledWith('Superstition');
    expect(manager.getMentionedSongs()).toEqual(['existing song']);
    manager.resetMentionedSongs();
    expect(live.resetMentionedSongs).toHaveBeenCalledTimes(1);
  });
});
