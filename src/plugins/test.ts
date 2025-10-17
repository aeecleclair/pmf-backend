// Test plugin for autoload

import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(async function testPlugin(fastify) {
  fastify.decorate('test', () => 'This is a test plugin');
  fastify.log.info('Test plugin loaded');
  // You can add routes or other functionalities here
});