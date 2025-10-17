import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

// Interface for formatted errors
interface FormattedError {
  statusCode: number;
  message: string;
  code?: string;
}

// Secure error messages
const ERROR_MESSAGES = {
  P2002: 'This resource already exists',
  P2025: 'Resource not found',
  P2003: 'Foreign key constraint violation',
  P2014: 'Invalid relationship between data',
  P2016: 'Query error',
  P2021: 'The requested table does not exist',
  P2022: 'The requested column does not exist',
  DEFAULT: 'An error occurred while processing your request',
};

// Function to format Prisma errors
function formatPrismaError(error: any): FormattedError {
  // Prisma validation error
  if (error instanceof PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
    };
  }

  // Known Prisma error
  if (error instanceof PrismaClientKnownRequestError) {
    const statusCode = getStatusCodeFromPrismaError(error.code);
    const message =
      ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] ||
      ERROR_MESSAGES.DEFAULT;

    return {
      statusCode,
      message,
      code: error.code,
    };
  }

  // Unknown Prisma error
  if (error instanceof PrismaClientUnknownRequestError) {
    return {
      statusCode: 500,
      message: ERROR_MESSAGES.DEFAULT,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Other errors
  return {
    statusCode: 500,
    message: ERROR_MESSAGES.DEFAULT,
  };
}

// Function to determine HTTP status code based on Prisma error code
function getStatusCodeFromPrismaError(code: string): number {
  switch (code) {
    case 'P2002': // Unique constraint violation
      return 409;
    case 'P2025': // Record not found
      return 404;
    case 'P2003': // Foreign key constraint violation
    case 'P2014': // Relation violation
      return 400;
    case 'P2016': // Query interpretation error
    case 'P2021': // Table does not exist
    case 'P2022': // Column does not exist
      return 400;
    default:
      return 500;
  }
}

// Fastify plugin to handle Prisma errors
export default fastifyPlugin(function prismaErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    async (error: any, request: FastifyRequest, reply: FastifyReply) => {
      // Log complete error for debugging (server-side only)
      fastify.log.error(
        {
          error: error,
          request: {
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
          },
        },
        'Prisma error intercepted'
      );

      // Check if it's a Prisma error
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof PrismaClientUnknownRequestError
      ) {
        const formattedError = formatPrismaError(error);

        return reply.status(formattedError.statusCode).send({
          error: true,
          message: formattedError.message,
          code: formattedError.code,
          timestamp: new Date().toISOString(),
        });
      }

      // If it's not a Prisma error, pass to default error handler
      throw error;
    }
  );
});

// Export utilities for direct use
export { formatPrismaError, ERROR_MESSAGES };
