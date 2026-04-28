import "server-only"

import type { User } from "@/types/users"

import { getCurrentUser } from "./get-current-user"
import { ForbiddenError, UnauthorizedError, can, type Permission } from "./permissions"

interface RouteContext {
  params?: Promise<Record<string, string>>
}

type RouteHandler<TContext extends RouteContext = RouteContext> = (
  request: Request,
  context: TContext,
  user: User
) => Promise<Response> | Response

interface WithAuthOptions {
  /** Required permission. Omit (or set `allowAny`) to require only a logged-in user. */
  permission?: Permission
  /** Allow any logged-in user regardless of role. Mutually exclusive with `permission`. */
  allowAny?: boolean
}

/**
 * Wrap an App Router route handler with auth + role checks.
 *
 * - Returns 401 if no valid session.
 * - Returns 403 if the session lacks the required permission.
 * - Otherwise calls the handler with the resolved user as the third argument.
 *
 * @example
 * export const GET = withAuth(async (request, ctx, user) => {
 *   const data = await listAccounts()
 *   return Response.json(data)
 * }, { permission: "accounts:read" })
 */
export function withAuth<TContext extends RouteContext = RouteContext>(
  handler: RouteHandler<TContext>,
  options: WithAuthOptions = {}
): (request: Request, context: TContext) => Promise<Response> {
  if (options.permission && options.allowAny) {
    throw new Error("withAuth: cannot set both `permission` and `allowAny`.")
  }

  return async (request, context) => {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: new UnauthorizedError().message }, { status: 401 })
    }

    if (options.permission && !can(user.role, options.permission)) {
      return Response.json({ error: new ForbiddenError().message }, { status: 403 })
    }

    return handler(request, context, user)
  }
}
