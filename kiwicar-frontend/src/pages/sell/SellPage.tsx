import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useSellStore } from '@/stores/sell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Import step components
import Step1PlateNumber from './steps/Step1PlateNumber'
import Step2Photos from './steps/Step2Photos'
import Step3Description from './steps/Step3Description'
import Step4Pricing from './steps/Step4Pricing'
import Step5Preview from './steps/Step5Preview'

export default function SellPage() {
  const navigate = useNavigate()
  const { draft, setStep, resetDraft } = useSellStore()
  const currentStep = draft.step

  useEffect(() => {
    // Warn about unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 1 && currentStep < 5) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentStep])

  const goToStep = (step: number) => {
    setStep(step)
  }

  const goToPrevious = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1)
    } else {
      navigate('/')
    }
  }

  const steps = [
    { number: 1, title: 'Vehicle Info', component: Step1PlateNumber },
    { number: 2, title: 'Photos', component: Step2Photos },
    { number: 3, title: 'Description', component: Step3Description },
    { number: 4, title: 'Pricing', component: Step4Pricing },
    { number: 5, title: 'Preview', component: Step5Preview },
  ]

  const CurrentStepComponent = steps[currentStep - 1]?.component

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sell Your Car</h1>
        <p className="text-muted-foreground">Complete the steps below to list your vehicle</p>
      </div>

      {/* Step indicator */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => goToStep(step.number)}
                  disabled={step.number > currentStep}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                    step.number < currentStep
                      ? 'bg-green-600 text-white'
                      : step.number === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    step.number < currentStep && 'cursor-pointer hover:bg-green-700',
                    step.number === currentStep && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  {step.number < currentStep ? <Check className="h-5 w-5" /> : step.number}
                </button>
                <span
                  className={cn(
                    'text-sm mt-2 hidden md:block',
                    step.number === currentStep ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 transition-colors',
                    step.number < currentStep ? 'bg-green-600' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile step title */}
        <div className="md:hidden mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </p>
          <p className="font-semibold">{steps[currentStep - 1]?.title}</p>
        </div>
      </Card>

      {/* Step content */}
      <Card className="p-6 mb-6">
        {CurrentStepComponent && <CurrentStepComponent />}
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        <div className="flex gap-2">
          {currentStep > 1 && currentStep < 5 && (
            <Button variant="ghost" onClick={() => resetDraft()}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
