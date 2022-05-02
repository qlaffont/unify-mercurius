/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fastify from 'fastify';
import mercurius from 'mercurius';
import { NotFound } from 'unify-errors';
import { InternalServerError } from 'unify-errors';
import { CustomError } from 'unify-errors';
import { NotImplemented } from 'unify-errors';
import { TimeOut } from 'unify-errors';
import { Forbidden } from 'unify-errors';
import { Unauthorized } from 'unify-errors';
import { BadRequest } from 'unify-errors';

import { Options, unifyMercuriusErrorFormatter } from '../../src';

const makeServer = (options: Options) => {
  const app = fastify();

  const schema = `
    type Query {
      BadRequest: String!
      Unauthorized: String!
      Forbidden: String!
      NotFound: String!
      TimeOut: String!
      InternalServerError: String!
      NotImplemented: String!
      CustomError: String!
      Success: String!
      testOtherError: String!
    }
  `;

  const resolvers = {
    Query: {
      BadRequest: () => {
        throw new BadRequest({
          issue: 'This is the issue',
        });

        return 'result';
      },
      Unauthorized: () => {
        throw new Unauthorized({
          issue: 'This is the issue',
        });

        return 'result';
      },
      Forbidden: () => {
        throw new Forbidden({
          issue: 'This is the issue',
        });

        return 'result';
      },
      NotFound: () => {
        throw new NotFound({
          issue: 'This is the issue',
        });

        return 'result';
      },
      TimeOut: () => {
        throw new TimeOut({
          issue: 'This is the issue',
        });

        return 'result';
      },
      InternalServerError: () => {
        throw new InternalServerError({
          issue: 'This is the issue',
        });

        return 'result';
      },
      NotImplemented: () => {
        throw new NotImplemented({
          issue: 'This is the issue',
        });

        return 'result';
      },
      CustomError: () => {
        throw new CustomError('Custom Error', {
          issue: 'This is the issue',
        });

        return 'result';
      },
      Success: () => {
        return 'result';
      },
      testOtherError: () => {
        throw new Error('test');
      },
    },
  };

  app.register(mercurius, {
    schema,
    resolvers,
    allowBatchedQueries: true,
    ide: true,
    errorFormatter: unifyMercuriusErrorFormatter(options),
  });

  return app;
};

export default makeServer;
