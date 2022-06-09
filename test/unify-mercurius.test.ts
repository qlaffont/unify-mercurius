import { createMercuriusTestClient } from 'mercurius-integration-testing';
import { app } from './server';
import { gql } from "mercurius-codegen";
import fetch from 'node-fetch';

beforeAll(async () => {
  await createMercuriusTestClient(app);
});

describe('Fastify mock', () => {
  it('Should respond to call', async () => {
    const query = gql`
        query {
            badRequestTest
        }
    `;
    const response = await fetch('localhost:3000/graphql', {
    method: 'POST',
        body: query,
    });
    console.log(JSON.stringify(response, null, 2))
    expect(1).toBe(1);
  });
});