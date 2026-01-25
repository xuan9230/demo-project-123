import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <FileQuestion className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/search">Browse Cars</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
