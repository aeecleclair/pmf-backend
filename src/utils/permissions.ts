import { UserRole } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { findUserById } from "../controllers/users";

declare module "fastify" {
  interface FastifySchema {
    requiredRoles?: UserRole[];
  }
}

export const verifyPermission = async (request: FastifyRequest) => {

    const { user } = request;
    if (!user) {
        throw new Error("Unauthorized");
    }
    const { id } = user as { id: string };

    if (!id) {
        throw new Error("Unauthorized");
    }

    const databaseUser = await findUserById(id);
    if (!databaseUser) {
        throw new Error("Unauthorized");
    }

    const roles = request.routeOptions.schema?.requiredRoles;

    if (roles && roles.length > 0) {
        const hasPermission = roles.some(role => databaseUser.role === role);
        if (!hasPermission) {
            throw new Error("Forbidden");
        }
    }
}

// const rolePermissions: Record<UserRole, string[]> = {
//     [UserRole.ADMIN]: adminPermissions,
//     //[UserRole.STUDENT]: studentPermissions,
// }

// export const studentPermissions = {
//     "/offers": [
//         "GET",
//     ],
//     "/offers/:id": [
//         "GET",
//     ],

// };

// const adminPermissions = [
//     "/users",
//     "/users/:id",
//     "/offers",
//     "/offers/:id",
// ];