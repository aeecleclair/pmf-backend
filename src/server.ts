'use strict';

import { buildApp } from './app';

buildApp({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
})
  .then((server) => {
    server.listen({ port: 3000 }, (err, address) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }
    });
  })
  .catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
