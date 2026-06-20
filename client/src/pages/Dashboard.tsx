import { useState } from "react";
import { useTryOns, useDeleteTryOn, useRetryTryOn } from "@/hooks/use-try-ons";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Trash2, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TryOn } from "@shared/schema";

export default function Dashboard() {
  const { data: tryOns, isLoading } = useTryOns();
  const deleteTryOn = useDeleteTryOn();
  const retryTryOn = useRetryTryOn();
  const [deleteTarget, setDeleteTarget] = useState<TryOn | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-0">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-0 animate-pulse">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive" className="opacity-80">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteTryOn.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your virtual try-on requests.</p>
        </div>
        <Link href="/new">
          <Button className="rounded-full px-6" data-testid="button-new-tryon">
            <Plus className="w-4 h-4 mr-2" />
            New Try-On
          </Button>
        </Link>
      </div>

      {tryOns && tryOns.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tryOns.map((tryOn, index) => (
            <motion.div
              key={tryOn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
              data-testid={`card-tryon-${tryOn.id}`}
            >
              {/* Delete button - visible on hover */}
              <button
                className="absolute top-3 left-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteTarget(tryOn);
                }}
                data-testid={`button-delete-tryon-${tryOn.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Retry button — only shown on failed cards */}
              {tryOn.status === "failed" && (
                <button
                  className="absolute top-3 right-12 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    retryTryOn.mutate(tryOn.id);
                  }}
                  disabled={retryTryOn.isPending}
                  title="Retry generation"
                  data-testid={`button-retry-tryon-${tryOn.id}`}
                >
                  {retryTryOn.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              <Link href={`/try-ons/${tryOn.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
                  <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                    {tryOn.resultImage ? (
                      <img 
                        src={tryOn.resultImage} 
                        alt="Try-on Result" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex gap-2">
                          <img src={tryOn.modelImage} className="w-1/3 h-24 object-cover rounded-lg shadow-sm" alt="Model" />
                          <img src={tryOn.garmentImage} className="w-1/3 h-24 object-cover rounded-lg shadow-sm" alt="Garment" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(tryOn.status)}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {tryOn.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tryOn.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium group-hover:text-primary transition-colors">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No try-ons yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Start your first virtual try-on session to see the magic happen.
          </p>
          <Link href="/new">
            <Button>Start Creating</Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this try-on?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this try-on from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete-tryon"
            >
              {deleteTryOn.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
