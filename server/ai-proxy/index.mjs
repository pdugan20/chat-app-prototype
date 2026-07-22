import 'dotenv/config';
import { createServer } from 'node:http';

import { readConfig } from './config.mjs';
import { createHandler } from './handler.mjs';
import { createGenerator } from './providers.mjs';

const HOST = '127.0.0.1';
const config = readConfig();
const server = createServer(
  createHandler({
    generate: createGenerator(config),
    provider: config.provider,
  })
);

server.listen(config.port, HOST, () => {
  console.log(
    `AI proxy ready for ${config.provider} at http://${HOST}:${config.port}`
  );
});
