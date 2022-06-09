import Fastify from 'fastify';
import mercurius from 'mercurius';
import { BadRequest } from "unify-errors";

export const app = Fastify();

const schema = `
type Query {
    badRequestTest: String!
}
`;

const resolvers = {
    Query: {
        badRequestTest: () => {
            throw BadRequest({
                status: 400,
                issue: 'This is the issue',
            });
            return "won't be called anyway"
        }
    }
};

(async () => {
    await app.register(mercurius, {
        schema,
        resolvers,
        // Only required to use .batchQueries()
        allowBatchedQueries: true,
        errorFormatter: (execution) => {
            // console.log(execution);
            return {
                statusCode: 200,
                response: execution,
            }
        },
    });

    app.setErrorHandler(
        //@ts-ignore
        (error, request, reply) => {
            console.log(error);
            reply.send({
                errors: [],
                data: {}
            });
        });
})();