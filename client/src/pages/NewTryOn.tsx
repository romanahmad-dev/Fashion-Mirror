import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateTryOn } from "@/hooks/use-try-ons";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight, ChevronLeft, Loader2, Shirt, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Model", description: "Upload your photo" },
  { id: 2, title: "Garment", description: "Choose clothing" },
  { id: 3, title: "Category", description: "Select type" },
];

export default function NewTryOn() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    modelImage: "",
    garmentImage: "",
    category: "tops",
  });
  
  const [, setLocation] = useLocation();
  const createTryOn = useCreateTryOn();
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep === 1 && !formData.modelImage) {
      toast({ title: "Required", description: "Please upload a model image", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && !formData.garmentImage) {
      toast({ title: "Required", description: "Please upload a garment image", variant: "destructive" });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      await createTryOn.mutateAsync(formData);
      setLocation("/dashboard");
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-serif font-bold text-center mb-2">New Virtual Try-On</h1>
        <p className="text-center text-muted-foreground">Follow the steps to generate your look</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex flex-col items-center relative z-10 ${index <= currentStep - 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 font-semibold
                  ${index < currentStep - 1 ? 'bg-primary text-primary-foreground border-primary' : 
                    index === currentStep - 1 ? 'bg-background border-primary text-primary' : 
                    'bg-background border-muted text-muted-foreground'}`}
              >
                {index < currentStep - 1 ? "✓" : step.id}
              </div>
              <span className="text-xs font-medium mt-2 absolute -bottom-6 w-32 text-center">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-24 h-0.5 mx-2 ${index < currentStep - 1 ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-16">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8 border-none shadow-xl bg-background/50 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <User className="w-6 h-6" /> Upload Model
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Upload a full-body photo of yourself or the model. 
                      Ensure good lighting and a simple background for best results.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc list-inside">
                      <li>Supported formats: JPG, PNG, WEBP</li>
                      <li>Max file size: 10MB</li>
                      <li>Best resolution: 1024x1024 or higher</li>
                    </ul>
                  </div>
                  <FileUpload 
                    label="Drop model image here"
                    value={formData.modelImage}
                    onFileSelect={(base64) => setFormData({ ...formData, modelImage: base64 })}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8 border-none shadow-xl bg-background/50 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Shirt className="w-6 h-6" /> Upload Garment
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Upload an image of the clothing item you want to try on. 
                      Flat lay images or mannequin shots work best.
                    </p>
                  </div>
                  <FileUpload 
                    label="Drop garment image here"
                    value={formData.garmentImage}
                    onFileSelect={(base64) => setFormData({ ...formData, garmentImage: base64 })}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8 border-none shadow-xl bg-background/50 backdrop-blur-sm max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Select Category</h2>
                <RadioGroup 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {[
                    { value: "tops", label: "Tops", desc: "T-shirts, Shirts, Hoodies" },
                    { value: "bottoms", label: "Bottoms", desc: "Pants, Skirts, Shorts" },
                    { value: "one-pieces", label: "One Piece", desc: "Dresses, Jumpsuits" },
                  ].map((option) => (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                      <Label
                        htmlFor={option.value}
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all h-full"
                      >
                        <span className="text-xl mb-2 font-serif">{option.label}</span>
                        <span className="text-xs text-muted-foreground text-center">{option.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="mt-8 p-4 bg-muted/50 rounded-lg flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <img src={formData.modelImage} className="w-12 h-12 rounded-full border-2 border-background object-cover" />
                    <img src={formData.garmentImage} className="w-12 h-12 rounded-full border-2 border-background object-cover" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Ready to generate</p>
                    <p className="text-muted-foreground">This usually takes about 30 seconds.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-8 max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1 || createTryOn.isPending}
          className={currentStep === 1 ? "invisible" : ""}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext} className="rounded-full px-8">
            Next Step <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={createTryOn.isPending}
            className="rounded-full px-8 min-w-[140px]"
          >
            {createTryOn.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                Generating...
              </>
            ) : (
              "Generate Look"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
