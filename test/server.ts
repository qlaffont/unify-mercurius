import Fastify from 'fastify';
import mercurius from 'mercurius';
import {BadRequest} from "unify-errors";

const app = Fastify();

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
        //@ts-ignore
        errorHandler: (error, request, reply) => {
            console.log(error);
            reply.send({
                errors: [],
                data: {}
            });
        },
        errorFormatter: (execution) => {
            // console.log(execution);
            return {
                statusCode: 200,
                response: execution,
            }
        },
    });
})();


export const Server = app;