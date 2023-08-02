import { expect } from '@jest/globals';
import { describe, it } from '@jest/globals';
import { createMercuriusTestClient } from 'mercurius-integration-testing';
import { AbortSignal } from 'node-abort-controller';
import * as UnifyErrors from 'unify-errors';

// fix for Reference error AbortSignal in `lru-cache`
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.AbortSignal = AbortSignal;

import makeServer from './core/server';

describe('unifyMercuriusErrorFormatter', () => {
  describe('default', () => {
    it('should render error with a good format', async () => {
      const client = createMercuriusTestClient(makeServer({}));

      const errors = [
        'BadRequest',
        'Unauthorized',
        'Forbidden',
        'NotFound',
        'TimeOut',
        'InternalServerError',
        'NotImplemented',
        'CustomError',
      ];

      for (const errorType of errors) {
        const res = await client.query(
          `query {
              ${errorType}
            }`
        );

        const error = res.errors![0];

        expect(error.message).toStrictEqual(
          new UnifyErrors[errorType as 'BadRequest']().message || 'Custom Error'
        );
        expect(error.extensions).toStrictEqual({
          issue: 'This is the issue',
        });
      }
    });

    it('should render not unifyerror', async () => {
      const client = createMercuriusTestClient(makeServer({}));
      const res = await client.query(
        `query {
            testOtherError
          }`
      );

      const error = res.errors![0];

      expect(error.message).toStrictEqual('test');
    });

    it('should render result', async () => {
      const client = createMercuriusTestClient(makeServer({}));

      const res = await client.query(
        `query {
              Success
            }`
      );

      expect(res.data.Success).toStrictEqual('result');
    });

    it('should be able to render result and error', async () => {
      const client = createMercuriusTestClient(makeServer({}));

      const res = await client.batchQueries([
        {
          query: `
          query {
            Success
          }
          `,
        },
        {
          query: `
          query {
            Forbidden
          }`,
        },
      ]);

      expect(res[0].data.Success).toStrictEqual('result');
      expect(res[1].errors![0].message).toStrictEqual('Forbidden');
    });
  });

  describe('disableDetails', () => {
    it('should hide extensions if option enable', async () => {
      process.env.NODE_ENV = 'production';
      const client = createMercuriusTestClient(makeServer({ disableDetails: true }));

      const res = await client.query(
        `query {
            BadRequest
            }`
      );

      const error = res.errors![0];
      expect(error.stack).not.toBeDefined();
      expect(error.extensions).toStrictEqual({
        issue: 'This is the issue',
      });
    });

    it('should display extensions if option is disable', async () => {
      const client = createMercuriusTestClient(makeServer({}));

      const res = await client.query(
        `query {
            BadRequest
          }`
      );

      const error = res.errors![0];
      expect(error.stack).toBeDefined();
      expect(error.extensions).toStrictEqual({
        issue: 'This is the issue',
      });
    });
  });
});
