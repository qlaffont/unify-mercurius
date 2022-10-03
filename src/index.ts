/* eslint-disable @typescript-eslint/ban-ts-comment */
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
   * Removes the 'context' key from the error response if NODE_ENV is 'production'
   */
  hideContextOnProd?: boolean;
}

export const unifyMercuriusErrorFormatter = (options?: Options) =>
  ((execution) => {
    const newResponse = {
      errors: execution.errors
        ? //@ts-ignore
          execution.errors.map((error) => {
            return (error.originalError as
              | Error
              | CustomError
              | false) instanceof CustomError
              ? {
                  ...error,
                  message: (error.originalError as CustomError).message,
                  extensions: {
                    ...(options?.hideContextOnProd === false ||
                    process.env.NODE_ENV !== 'production'
                      ? (error.originalError as CustomError).context
                      : {}),
                  },
                }
              : error;
          })
        : [
            {
              message: 'Internal Server Error',
              extensions: { error: execution.toString(), data: undefined },
            },
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
          return 500;
        }
      },
      0
    );

    return {
      statusCode: newStatusCode,
      response: newResponse,
    };
  }) as MercuriusCommonOptions['errorFormatter'];
