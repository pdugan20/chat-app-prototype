const MAX_BODY_BYTES = 64 * 1024;

class ClientError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const sendJson = (response, status, body) => {
  const content = JSON.stringify(body);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(content),
  });
  response.end(content);
};

const readBody = (request, maxBytes) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;

    request.on('data', chunk => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > maxBytes) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(new ClientError(413, 'Request body is too large'));
        return;
      }
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    request.on('error', reject);
  });

const validateBody = body => {
  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body) ||
    typeof body.systemPrompt !== 'string' ||
    !body.systemPrompt.trim()
  ) {
    throw new ClientError(400, 'systemPrompt must be non-empty text');
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new ClientError(400, 'messages must be non-empty');
  }

  for (const message of body.messages) {
    if (
      typeof message !== 'object' ||
      message === null ||
      !['user', 'assistant'].includes(message.role)
    ) {
      throw new ClientError(400, 'message roles must be user or assistant');
    }
    if (typeof message.content !== 'string' || !message.content.trim()) {
      throw new ClientError(400, 'message content must be non-empty text');
    }
  }

  return {
    systemPrompt: body.systemPrompt,
    messages: body.messages.map(({ role, content }) => ({ role, content })),
  };
};

const readAndValidateRequest = async request => {
  const contentType = request.headers['content-type']?.split(';')[0].trim();
  if (contentType !== 'application/json') {
    throw new ClientError(400, 'Content-Type must be application/json');
  }

  const content = await readBody(request, MAX_BODY_BYTES);
  let body;
  try {
    body = JSON.parse(content);
  } catch {
    throw new ClientError(400, 'Request body is invalid JSON');
  }
  return validateBody(body);
};

export function createHandler({ generate, provider, logger = console }) {
  return async function handler(request, response) {
    const path = new URL(request.url, 'http://127.0.0.1').pathname;
    if (path !== '/health' && path !== '/v1/generate') {
      return sendJson(response, 404, { error: 'Not found' });
    }
    if (path === '/health') {
      if (request.method !== 'GET') {
        return sendJson(response, 405, { error: 'Method not allowed' });
      }
      return sendJson(response, 200, { status: 'ok', provider });
    }
    if (request.method !== 'POST') {
      return sendJson(response, 405, { error: 'Method not allowed' });
    }

    try {
      const body = await readAndValidateRequest(request);
      const content = await generate(body);
      return sendJson(response, 200, { content });
    } catch (error) {
      if (error instanceof ClientError) {
        return sendJson(response, error.status, { error: error.message });
      }
      logger.error(`AI provider request failed (${provider})`);
      return sendJson(response, 502, {
        error: 'AI provider request failed',
      });
    }
  };
}
