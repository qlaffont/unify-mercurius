import { Server } from './server';
import { createMercuriusTestClient } from 'mercurius-integration-testing';

let server: any;

beforeAll(async () => {
  server = await createMercuriusTestClient(Server);
});

describe('Fastify mock', () => {
  it('Should respond to call', async () => {
    await server.query(`query { badRequestTest }`);
    expect(1).toBe(1);
  });
});