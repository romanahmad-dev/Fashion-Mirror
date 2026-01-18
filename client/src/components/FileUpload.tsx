import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (base64: string) => void;
  value?: string | null;
  label?: string;
  accept?: Record<string, string[]>;
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  value, 
  label = "Upload Image", 
  accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
  className
}: FileUploadProps) {
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onFileSelect(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept,
    maxFiles: 1,
    multiple: false
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect('');
  };

  return (
    <div className={cn("w-full group", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border border-dashed rounded-xl p-8 transition-all duration-300 ease-out cursor-pointer overflow-hidden",
          "hover:border-primary/50 hover:bg-muted/30",
          isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border",
          value ? "aspect-[3/4] p-0 border-solid" : "aspect-video"
        )}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {value ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <img 
                src={value} 
                alt="Uploaded preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-medium">Click to change</p>
              </div>
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-transform hover:scale-110 z-10"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4"
            >
              <div className="p-4 bg-muted rounded-full group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? "Drop to upload" : "Drag & drop or click to browse"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
