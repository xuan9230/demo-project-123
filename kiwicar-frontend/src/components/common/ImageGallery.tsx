import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <>
      <div className="relative group">
        {/* Main image */}
        <div
          className="aspect-[16/9] bg-muted rounded-lg overflow-hidden cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          <img
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Fullscreen button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsFullscreen(true)}
        >
          <Expand className="h-4 w-4" />
        </Button>

        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-colors',
                index === currentIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
              )}
            >
              <img src={image} alt={`${alt} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
          <VisuallyHidden.Root>
            <DialogTitle>Image Gallery</DialogTitle>
          </VisuallyHidden.Root>
          <div className="relative h-[90vh]">
            <img
              src={images[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
