import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateTryOn } from "@/hooks/use-try-ons";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight, ChevronLeft, Loader2, Shirt, User, Camera, RefreshCw, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Model", description: "Upload your photo" },
  { id: 2, title: "Garment", description: "Choose clothing" },
  { id: 3, title: "Category", description: "Select type" },
];

export default function NewTryOn() {
  const [currentStep, setCurrentStep] = useState(1);

  // Check for a garment preselected from the Inventory page
  const [formData, setFormData] = useState(() => {
    const stored = sessionStorage.getItem("preselectedGarment");
    if (stored) {
      sessionStorage.removeItem("preselectedGarment");
      const parsed = JSON.parse(stored) as { imageUrl: string; category: string };
      return {
        modelImage: "",
        garmentImage: parsed.imageUrl,
        category: parsed.category,
      };
    }
    return {
      modelImage: "",
      garmentImage: "",
      category: "tops",
    };
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [, setLocation] = useLocation();
  const createTryOn = useCreateTryOn();
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      const preferredCamera = videoDevices.find(d =>
        d.label.toLowerCase().includes('iriun')
      );

      const constraints: MediaStreamConstraints = {
        video: preferredCamera
          ? { deviceId: { exact: preferredCamera.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // The video element is always in the DOM — videoRef.current is never null here.
      const video = videoRef.current!;
      video.srcObject = stream;

      // Show the camera container immediately so the user sees it loading.
      setIsCameraActive(true);

      // Play as soon as the browser has enough data.
      const playWhenReady = async () => {
        try {
          await video.play();
        } catch (e) {
          console.error("Video play error:", e);
        }
      };

      if (video.readyState >= 2) {
        playWhenReady();
      } else {
        video.onloadedmetadata = playWhenReady;
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera Access Failed",
        description: "Please grant camera permission and make sure no other app is using it.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    console.log("Capture requested");
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Stability: Check if video is actually providing frames
      if (video.readyState < 2) {
        console.error("Video not ready for capture");
        return;
      }

      const targetRatio = 3/4;
      const videoRatio = video.videoWidth / video.videoHeight;
      
      let sourceWidth, sourceHeight, sourceX, sourceY;
      
      if (videoRatio > targetRatio) {
        sourceHeight = video.videoHeight;
        sourceWidth = video.videoHeight * targetRatio;
        sourceX = (video.videoWidth - sourceWidth) / 2;
        sourceY = 0;
      } else {
        sourceWidth = video.videoWidth;
        sourceHeight = video.videoWidth / targetRatio;
        sourceX = 0;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }

      // Optimization: High-quality capture but optimized size
      canvas.width = 768; 
      canvas.height = 1024;
      
      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        
        console.log("Drawing complete, generating dataURL");
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85); // Balanced quality/size
        
        if (dataUrl.length < 100) {
          console.error("Captured image appears corrupted/empty");
          toast({ title: "Capture Failed", description: "Image corrupted. Please try again.", variant: "destructive" });
          return;
        }

        setFormData(prev => ({ ...prev, modelImage: dataUrl }));
        console.log("Capture successful, size:", Math.round(dataUrl.length / 1024), "KB");
        
        toast({
          title: "Photo Captured",
          description: "Your photo has been saved successfully.",
        });
        
        stopCamera();
      }
    }
  };

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
                      Upload a full-body photo of yourself or take one with your webcam.
                    </p>
                    <div className="flex flex-col gap-3 mb-6">
                          <Button 
                            variant="outline" 
                            onClick={startCamera} 
                            disabled={isCameraActive}
                            className="hover-elevate transition-all active-elevate-2"
                          >
                            <Camera className="w-4 h-4 mr-2" /> Use Webcam
                          </Button>
                          <label className="cursor-pointer">
                            <Button 
                              variant="outline" 
                              className="w-full pointer-events-none hover-elevate transition-all active-elevate-2"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload File
                            </Button>
                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                console.log("File selected:", file.name, "Size:", Math.round(file.size / 1024), "KB");
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const result = reader.result as string;
                                  // Compression logic would go here if needed for large files
                                  setFormData({ ...formData, modelImage: result });
                                  console.log("File loaded into state");
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                      <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                        <li>Ensure good lighting</li>
                        <li>Stand against a plain background</li>
                      </ul>
                    </div>
                  </div>
                  <div className="relative">
                    {/* 
                      Video element is ALWAYS in the DOM so videoRef is always valid.
                      We show/hide with CSS — never conditionally unmount it.
                    */}
                    <div
                      className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden border-2 border-primary group"
                      style={{ display: isCameraActive ? 'block' : 'none' }}
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />

                      {/* Live indicator */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 z-10 pointer-events-none">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live</span>
                      </div>

                      {/* Capture / Stop controls */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10">
                        <Button
                          size="icon"
                          className="h-14 w-14 rounded-full shadow-2xl bg-white hover:bg-white/90 border-4 border-primary/20"
                          onClick={capturePhoto}
                          data-testid="button-capture"
                        >
                          <div className="h-10 w-10 rounded-full border-4 border-primary" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-14 w-14 rounded-full shadow-2xl"
                          onClick={stopCamera}
                          data-testid="button-stop-camera"
                        >
                          <X className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>

                    {/* Captured photo preview */}
                    {!isCameraActive && formData.modelImage && (
                      <div className="relative aspect-[3/4] bg-muted rounded-2xl overflow-hidden border-2 border-primary">
                        <img src={formData.modelImage} alt="Model" className="w-full h-full object-cover" />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData({ ...formData, modelImage: "" })}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    )}

                    {/* File drop zone */}
                    {!isCameraActive && !formData.modelImage && (
                      <FileUpload
                        label="Drop model image here"
                        value={formData.modelImage}
                        onFileSelect={(base64) => setFormData({ ...formData, modelImage: base64 })}
                      />
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                  </div>
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
