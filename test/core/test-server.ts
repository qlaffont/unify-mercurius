import makeServer from './server';

const fastify = makeServer({});

fastify.listen({ port: 3000 });
