import { UserRole } from "@prisma/client";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { findUserById } from "../controllers/users";

declare module "fastify" {
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

// Function to verify permissions
const verifyPermission = async (request: FastifyRequest): Promise<void> => {
  const { user } = request;
  if (!user) {
    const error: PermissionError = {
      statusCode: 401,
      message: PERMISSION_ERROR_MESSAGES.UNAUTHORIZED,
      code: 'UNAUTHORIZED'
    };
    throw error;
  }

  const { id } = user as { id: string };
  if (!id) {
    const error: PermissionError = {
      statusCode: 401,
      message: PERMISSION_ERROR_MESSAGES.UNAUTHORIZED,
      code: 'UNAUTHORIZED'
    };
    throw error;
  }

  const databaseUser = await findUserById(id);
  if (!databaseUser) {
    const error: PermissionError = {
      statusCode: 401,
      message: PERMISSION_ERROR_MESSAGES.USER_NOT_FOUND,
      code: 'USER_NOT_FOUND'
    };
    throw error;
  }

  const roles = request.routeOptions.schema?.requiredRoles;
  if (roles && roles.length > 0) {
    const hasPermission = roles.some(role => databaseUser.role === role);
    if (!hasPermission) {
      const error: PermissionError = {
        statusCode: 403,
        message: PERMISSION_ERROR_MESSAGES.FORBIDDEN,
        code: 'FORBIDDEN'
      };
      throw error;
    }
  }
};

// Fastify plugin to handle permissions
export default fastifyPlugin(function permissionsPlugin(fastify: FastifyInstance) {
  // Add permission verification function to Fastify instance
  fastify.decorate('verifyPermission', verifyPermission);

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
    if (error.statusCode && error.code && Object.values(PERMISSION_ERROR_MESSAGES).includes(error.message)) {
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
      await verifyPermission(request);
    }
  });
});

// Module declaration for TypeScript
declare module "fastify" {
  interface FastifyInstance {
    verifyPermission: (request: FastifyRequest) => Promise<void>;
  }
}

// Export utilities for direct use
export { verifyPermission, PERMISSION_ERROR_MESSAGES };