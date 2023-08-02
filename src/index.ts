/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MercuriusCommonOptions } from 'mercurius';
import {
  BadRequest,
  CustomError,
  Forbidden,
  InternalServerError,
  NotFound,
  NotImplemented,
  TimeOut,
  Unauthorized,
} from 'unify-errors';

export interface Options {
  /**
   * Removes the 'error' key from the error response
   */
  disableDetails?: boolean;

  /**
   * Removes logging
   */
  disableLog?: boolean;
}

const safeStringify = (obj: unknown, indent = 2) => {
  let cache: any[] | null = [];
  const retVal = JSON.stringify(
    obj,
    (_key, value) =>
      typeof value === 'object' && value !== null
        ? cache!.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache!.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
};

//@ts-ignore
export const unifyMercuriusErrorFormatter = (options?: Options) =>
  ((execution, context) => {
    const newResponse = {
      errors: execution.errors
        ? //@ts-ignore
          execution.errors.map((error) => {
            const enrichedError = error;

            if (!options?.disableDetails === true) {
              enrichedError.extensions.exception = enrichedError.originalError;
              Object.defineProperty(enrichedError, 'extensions', {
                enumerable: true,
              });
              Object.defineProperty(enrichedError, 'stack', {
                enumerable: true,
              });
            }

            return (error.originalError as
              | Error
              | CustomError
              | false) instanceof CustomError
              ? {
                  ...error,
                  message: (error.originalError as CustomError).message,
                  extensions: {
                    ...(error.originalError as CustomError).context,
                  },
                  ...(options?.disableDetails === true
                    ? {}
                    : { originalError: error.originalError }),
                }
              : enrichedError;
          })
        : [
            JSON.parse(
              safeStringify({
                message: 'Internal Server Error',
                ...(options?.disableDetails === true
                  ? {}
                  : {
                      extensions: {
                        error: execution.toString(),
                        data: undefined,
                      },
                    }),
              })
            ),
          ],
      data: execution.data,
    };

    let newStatusCode = 200;

    //@ts-ignore
    newStatusCode = newResponse.errors.reduce(
      //@ts-ignore
      (prevStatusCode: number, error) => {
        const customError = error.originalError as CustomError;

        if (customError && customError instanceof CustomError) {
          let httpCode = 0;

          switch (customError.constructor) {
            case BadRequest: {
              httpCode = 400;
              break;
            }
            case Unauthorized: {
              httpCode = 401;
              break;
            }
            case Forbidden: {
              httpCode = 403;
              break;
            }
            case NotFound: {
              httpCode = 404;
              break;
            }
            case TimeOut: {
              httpCode = 408;
              break;
            }
            case InternalServerError: {
              httpCode = 500;
              break;
            }
            case NotImplemented: {
              httpCode = 501;
              break;
            }
            default: {
              httpCode = 500;
              break;
            }
          }

          return httpCode > prevStatusCode ? httpCode : prevStatusCode;
        } else {
          if (
            error.message.toLowerCase() ===
            'graphql validation error'.toLowerCase()
          ) {
            return 400;
          }

          if (error.message.toLowerCase().includes('too many requests')) {
            return 429;
          }

          return 500;
        }
      },
      0
    );

    const data = {
      statusCode: newStatusCode,
      response: JSON.parse(safeStringify(newResponse)),
    };

    if (!options?.disableLog) {
      //@ts-ignore
      context.app.log.error(data);
    }

    return data;
  }) as MercuriusCommonOptions['errorFormatter'];
