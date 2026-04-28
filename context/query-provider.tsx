"use client"

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { ApiError } from "@/lib/fetch"
import { authKeys } from "@/lib/api/auth"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client: QueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
      queryCache: new QueryCache({
        onError: (error, query) => {
          // On 401, treat the session as gone — clear the cached user so
          // AuthProvider transitions to logged-out state and middleware/layout
          // can react (e.g. redirect to /auth/login).
          if (error instanceof ApiError && error.status === 401) {
            // Don't loop on the auth/me query itself (it will naturally return null).
            const isAuthMeQuery =
              JSON.stringify(query.queryKey) === JSON.stringify(authKeys.me)
            if (!isAuthMeQuery) {
              client.setQueryData(authKeys.me, null)
              client.invalidateQueries({ queryKey: authKeys.me })
            }
          }
        },
      }),
    })
    return client
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
