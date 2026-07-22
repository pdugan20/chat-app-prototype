import { ProxyService } from '../proxy';

const response = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response);

const fetchMockFor = (value: Response): typeof fetch =>
  jest.fn().mockResolvedValue(value) as unknown as typeof fetch;

describe('ProxyService', () => {
  it('is configured only with a non-empty proxy URL', () => {
    const fetchMock = jest.fn() as unknown as typeof fetch;

    expect(new ProxyService(undefined, fetchMock).isConfigured()).toBe(false);
    expect(new ProxyService('  ', fetchMock).isConfigured()).toBe(false);
    expect(
      new ProxyService('http://127.0.0.1:8787/', fetchMock).isConfigured()
    ).toBe(true);
  });

  it('posts the structured prompt and parses a text response', async () => {
    const fetchMock = fetchMockFor(
      response({ content: 'TEXT_RESPONSE\nHey there' })
    );
    const service = new ProxyService('http://127.0.0.1:8787/', fetchMock);

    const result = await service.generateStructuredResponse(
      [{ role: 'user', content: 'hello' }],
      'Ruth'
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = (fetchMock as jest.Mock).mock.calls[0];
    expect(url).toBe('http://127.0.0.1:8787/v1/generate');
    expect(init).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: expect.any(Object),
      })
    );
    expect(JSON.parse(init.body)).toEqual({
      systemPrompt: expect.stringContaining('You are Ruth'),
      messages: [{ role: 'user', content: 'hello' }],
    });
    expect(result).toEqual({ type: 'text', content: 'Hey there' });
  });

  it('parses and tracks a music response', async () => {
    const fetchMock = fetchMockFor(
      response({
        content:
          'MUSIC_RESPONSE\nTry this one\nMUSIC_QUERY:search:superstition stevie wonder',
      })
    );
    const service = new ProxyService('http://127.0.0.1:8787', fetchMock);

    const result = await service.generateStructuredResponse([
      { role: 'user', content: 'recommend a song' },
    ]);

    expect(result).toEqual({
      type: 'music',
      content: 'Try this one',
      musicQuery: 'search:superstition stevie wonder',
    });
    expect(service.getMentionedSongs()).toContain(
      'search:superstition stevie wonder'
    );
  });

  it('throws a safe proxy error for a non-success status', async () => {
    const service = new ProxyService(
      'http://127.0.0.1:8787',
      fetchMockFor(
        response({ error: 'AI provider request failed' }, false, 502)
      )
    );

    await expect(
      service.generateStructuredResponse([{ role: 'user', content: 'hello' }])
    ).rejects.toThrow('AI proxy returned 502: AI provider request failed');
  });

  it('throws when the proxy returns invalid JSON', async () => {
    const invalidResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockRejectedValue(new SyntaxError('invalid JSON')),
    } as unknown as Response;
    const service = new ProxyService(
      'http://127.0.0.1:8787',
      fetchMockFor(invalidResponse)
    );

    await expect(
      service.generateStructuredResponse([{ role: 'user', content: 'hello' }])
    ).rejects.toThrow('AI proxy returned invalid JSON');
  });

  it('throws when a successful response has no content', async () => {
    const service = new ProxyService(
      'http://127.0.0.1:8787',
      fetchMockFor(response({ content: '  ' }))
    );

    await expect(
      service.generateStructuredResponse([{ role: 'user', content: 'hello' }])
    ).rejects.toThrow('AI proxy returned an invalid response');
  });

  it('aborts requests that exceed the timeout', async () => {
    const fetchMock = jest.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new Error('request aborted'));
          });
        })
    ) as unknown as typeof fetch;
    const service = new ProxyService('http://127.0.0.1:8787', fetchMock, 10);

    await expect(
      service.generateStructuredResponse([{ role: 'user', content: 'hello' }])
    ).rejects.toThrow('request aborted');
  });
});
