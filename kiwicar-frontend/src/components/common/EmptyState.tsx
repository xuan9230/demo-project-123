import type { ComponentType, SVGProps } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && (
        <Button asChild>
          <Link to={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
