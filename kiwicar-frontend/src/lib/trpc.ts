import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@kiwicar/trpc-types'

export const trpc = createTRPCReact<AppRouter>()
