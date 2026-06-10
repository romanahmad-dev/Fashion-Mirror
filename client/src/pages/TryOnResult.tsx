import { useRoute } from "wouter";
import { useTryOn, useTryOnStatus } from "@/hooks/use-try-ons";
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertCircle, RefreshCw, ArrowLeft, Shirt } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function TryOnResult() {
  const [, params] = useRoute("/try-ons/:id");
  const id = parseInt(params?.id || "0");
  const queryClient = useQueryClient();

  const { data: tryOn, isLoading: isLoadingDetails } = useTryOn(id);
  const { data: statusData } = useTryOnStatus(id, tryOn?.status);

  // Merge status update if available
  const displayStatus = statusData?.status || tryOn?.status || "pending";
  const displayResult = statusData?.resultImage || tryOn?.resultImage;
  const displayError = statusData?.error || tryOn?.error;

  // Invalidate list query when status completes
  useEffect(() => {
    if (displayStatus === 'completed' || displayStatus === 'failed') {
      queryClient.invalidateQueries({ queryKey: [api.tryOns.list.path] });
    }
  }, [displayStatus, queryClient]);

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tryOn) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Try-On Not Found</h2>
        <Link href="/dashboard">
          <Button variant="ghost">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">ID: #{tryOn.id}</span>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
            displayStatus === "completed" && "bg-green-100 text-green-700",
            displayStatus === "processing" && "bg-blue-100 text-blue-700 animate-pulse",
            displayStatus === "failed" && "bg-red-100 text-red-700",
            displayStatus === "pending" && "bg-gray-100 text-gray-700",
          )}>
            {displayStatus}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Images */}
        <div className="space-y-6">
          <div className="bg-background rounded-2xl p-6 border shadow-sm">
            <h3 className="font-serif text-lg font-bold mb-4">Input Sources</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase">Model</p>
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  <img src={tryOn.modelImage} alt="Model" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase">Garment</p>
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  <img src={tryOn.garmentImage} alt="Garment" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Area */}
        <div className="bg-background rounded-2xl p-6 border shadow-lg h-full min-h-[500px] flex flex-col">
          <h3 className="font-serif text-lg font-bold mb-4">Generated Result</h3>
          
          <div className="flex-1 rounded-xl bg-muted/30 flex items-center justify-center relative overflow-hidden group">
            {displayStatus === "completed" && displayResult ? (
              <>
                <img src={displayResult} alt="Result" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a href={displayResult} download={`tryon-${tryOn.id}.png`} target="_blank" rel="noreferrer">
                    <Button variant="secondary" className="rounded-full">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </a>
                </div>
              </>
            ) : displayStatus === "failed" ? (
              <div className="text-center p-8">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-red-900 mb-2">Generation Failed</h4>
                <p className="text-red-700/80 text-sm max-w-xs mx-auto">
                  {displayError || "Something went wrong during the generation process. Please try again with different images."}
                </p>
              </div>
            ) : (
              <div className="text-center p-8 space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Shirt className="absolute inset-0 m-auto w-8 h-8 text-primary/50 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">AI is working its magic...</h4>
                  <p className="text-sm text-muted-foreground">
                    This usually takes about 30 seconds. <br/>You can leave this page and come back later.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
