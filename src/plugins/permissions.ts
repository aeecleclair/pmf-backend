import type { UserRole } from '@prisma/client';
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
//import { findUserById } from "../controllers/users";

declare module 'fastify' {
  interface FastifySchema {
    requiredRoles?: UserRole[];
  }
}

// Interface for formatted errors
interface PermissionError {
  statusCode: number;
  message: string;
  code: string;
}

// Secure error messages
const PERMISSION_ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  USER_NOT_FOUND: 'User not found',
};

// Fastify plugin to handle permissions
export default fastifyPlugin(
  function permissionsPlugin(fastify: FastifyInstance) {
    // Add permission verification function to Fastify instance
    // Function to verify permissions

    fastify.decorate('verifyPermission', async (request: FastifyRequest) => {
      const { user } = request;
      if (!user) {
        const error: PermissionError = {
          statusCode: 401,
          message: PERMISSION_ERROR_MESSAGES.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        };
        throw error;
      }

      const { id } = user as { id: string };
      if (!id) {
        const error: PermissionError = {
          statusCode: 401,
          message: PERMISSION_ERROR_MESSAGES.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        };
        throw error;
      }

      const databaseUser = await fastify.prisma.user.findUnique({
        where: { id: id },
      });
      if (!databaseUser) {
        const error: PermissionError = {
          statusCode: 401,
          message: PERMISSION_ERROR_MESSAGES.USER_NOT_FOUND,
          code: 'USER_NOT_FOUND',
        };
        throw error;
      }

      const roles = request.routeOptions.schema?.requiredRoles;
      if (roles && roles.length > 0) {
        const hasPermission = roles.some((role) => databaseUser.role === role);
        if (!hasPermission) {
          const error: PermissionError = {
            statusCode: 403,
            message: PERMISSION_ERROR_MESSAGES.FORBIDDEN,
            code: 'FORBIDDEN',
          };
          throw error;
        }
      }
    });

    // Error handler for permission errors
    fastify.setErrorHandler(async (error: any, request: FastifyRequest, reply: FastifyReply) => {
      // Log error for debugging
      fastify.log.error(
        {
          error: error,
          request: {
            method: request.method,
            url: request.url,
            userId: (request.user as any)?.id,
          },
        },
        'Permission error intercepted',
      );

      // Check if it's a permission error
      if (
        error.statusCode &&
        error.code &&
        Object.values(PERMISSION_ERROR_MESSAGES).includes(error.message)
      ) {
        return reply.status(error.statusCode).send({
          error: true,
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString(),
        });
      }

      // If it's not a permission error, pass to default error handler
      throw error;
    });

    // PreHandler hook to automatically verify permissions
    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      // Check if route requires permissions
      const requiredRoles = request.routeOptions.schema?.requiredRoles;
      if (requiredRoles && requiredRoles.length > 0) {
        await fastify.verifyPermission(request);
      }
    });
  },
  { name: 'permissions-plugin', dependencies: ['prisma-plugin'] },
);

// Module declaration for TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    verifyPermission: (request: FastifyRequest) => Promise<void>;
  }
}

// Export utilities for direct use
export { PERMISSION_ERROR_MESSAGES };
