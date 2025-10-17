'use strict';

import { buildApp } from './app';

buildApp({
  logger: {
    level: 'info',
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
