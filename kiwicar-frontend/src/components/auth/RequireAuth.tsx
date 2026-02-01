import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">Checking your session…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
