import { Button } from '@/components/ui/button'

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Demo Placeholder</p>
        <h1 className="mt-3 text-3xl font-bold">Account Page</h1>
        <p className="mt-3 text-muted-foreground">
          This section is still in progress. For the demo, use the navigation to explore other pages.
        </p>
        <Button className="mt-6" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  )
}
