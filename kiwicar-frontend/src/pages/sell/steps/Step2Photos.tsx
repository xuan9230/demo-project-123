import { useRef } from 'react'
import { Upload, X, Camera, Image as ImageIcon, MoveUp, MoveDown } from 'lucide-react'
import { useSellStore } from '@/stores/sell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const MAX_IMAGES = 10
const MIN_IMAGES = 3

export default function Step2Photos() {
  const { draft, addImage, removeImage, reorderImages, setStep } = useSellStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (draft.images.length >= MAX_IMAGES) {
        alert(`Maximum ${MAX_IMAGES} images allowed`)
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB')
        return
      }

      // In a real app, upload to server/S3 and get URL
      // For now, create a local object URL (this is just for demo)
      const reader = new FileReader()
      reader.onloadend = () => {
        // Use a mock image URL from unsplash for demo
        const mockImageUrl = `https://images.unsplash.com/photo-${Date.now() % 10}?w=800`
        addImage(mockImageUrl)
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleContinue = () => {
    if (draft.images.length < MIN_IMAGES) {
      alert(`Please upload at least ${MIN_IMAGES} photos`)
      return
    }
    setStep(3)
  }

  const canAddMore = draft.images.length < MAX_IMAGES
  const canContinue = draft.images.length >= MIN_IMAGES

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Photos</h2>
        <p className="text-muted-foreground">
          Add at least {MIN_IMAGES} photos (max {MAX_IMAGES}). First photo will be the cover image.
        </p>
      </div>

      {/* Upload area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {canAddMore && (
          <Card
            className="p-8 border-2 border-dashed cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-semibold mb-1">Click to upload photos</p>
              <p className="text-sm text-muted-foreground mb-4">or drag and drop images here</p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  <span>JPG, PNG</span>
                </div>
                <span>•</span>
                <span>Max 2MB each</span>
                <span>•</span>
                <span>{draft.images.length}/{MAX_IMAGES} uploaded</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Image grid */}
      {draft.images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium">
              {draft.images.length} of {MAX_IMAGES} photos
            </p>
            {canAddMore && (
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Add More
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {draft.images.map((image, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* First image badge */}
                {index === 0 && (
                  <Badge className="absolute top-2 left-2 bg-primary">
                    Cover Photo
                  </Badge>
                )}

                {/* Action buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index > 0 && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => reorderImages(index, index - 1)}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                  )}
                  {index < draft.images.length - 1 && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => reorderImages(index, index + 1)}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image number */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="p-4 bg-muted">
        <div className="flex items-start gap-3">
          <ImageIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-2">
            <p className="font-semibold">Photo Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Take photos in good lighting</li>
              <li>Include exterior from multiple angles</li>
              <li>Show interior and dashboard</li>
              <li>Capture any damage or wear honestly</li>
              <li>First photo will be shown as the main listing image</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Continue button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          size="lg"
        >
          Continue to Description
        </Button>
      </div>

      {!canContinue && (
        <p className="text-sm text-muted-foreground text-center">
          Upload at least {MIN_IMAGES} photos to continue
        </p>
      )}
    </div>
  )
}
