import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory, useAddGarment, useDeleteGarment } from "@/hooks/use-try-ons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Package, Wand2 } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import type { Garment } from "@shared/schema";

export default function Inventory() {
  const { data: garments, isLoading } = useInventory();
  const addGarment = useAddGarment();
  const deleteGarment = useDeleteGarment();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Garment | null>(null);

  const [form, setForm] = useState({
    name: "",
    imageUrl: "",
    category: "tops",
  });

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast({ title: "Required", description: "Please enter a garment name.", variant: "destructive" });
      return;
    }
    if (!form.imageUrl) {
      toast({ title: "Required", description: "Please upload a garment image.", variant: "destructive" });
      return;
    }
    await addGarment.mutateAsync({
      name: form.name.trim(),
      imageUrl: form.imageUrl,
      category: form.category,
    });
    setForm({ name: "", imageUrl: "", category: "tops" });
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteGarment.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleUseTryOn = (garment: Garment) => {
    // Store selected garment in sessionStorage so NewTryOn can pre-populate it
    sessionStorage.setItem("preselectedGarment", JSON.stringify({
      imageUrl: garment.imageUrl,
      category: garment.category,
    }));
    window.location.href = "/new";
  };

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case "tops": return "Tops";
      case "bottoms": return "Bottoms";
      case "one-pieces": return "One Piece";
      default: return cat;
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Garment Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Save garments to reuse them in future try-ons.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-6" data-testid="button-add-garment">
              <Plus className="w-4 h-4 mr-2" />
              Add Garment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Add New Garment</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label htmlFor="garment-name">Garment Name</Label>
                <Input
                  id="garment-name"
                  data-testid="input-garment-name"
                  placeholder="e.g. Blue Denim Jacket"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <RadioGroup
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                  className="flex gap-4"
                >
                  {[
                    { value: "tops", label: "Tops" },
                    { value: "bottoms", label: "Bottoms" },
                    { value: "one-pieces", label: "One Piece" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <RadioGroupItem value={opt.value} id={`cat-${opt.value}`} />
                      <Label htmlFor={`cat-${opt.value}`} className="cursor-pointer font-normal">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Garment Image</Label>
                <FileUpload
                  label="Drop garment image here"
                  value={form.imageUrl}
                  onFileSelect={(base64) => setForm({ ...form, imageUrl: base64 })}
                />
              </div>

              <Button
                onClick={handleAdd}
                disabled={addGarment.isPending}
                className="w-full"
                data-testid="button-save-garment"
              >
                {addGarment.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  "Save to Inventory"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Garment Grid */}
      {garments && garments.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence>
            {garments.map((garment, index) => (
              <motion.div
                key={garment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card
                  className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300"
                  data-testid={`card-garment-${garment.id}`}
                >
                  <div className="aspect-[3/4] relative bg-muted overflow-hidden">
                    <img
                      src={garment.imageUrl}
                      alt={garment.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                      <Button
                        size="sm"
                        className="w-full rounded-full"
                        onClick={() => handleUseTryOn(garment)}
                        data-testid={`button-use-garment-${garment.id}`}
                      >
                        <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Try On
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full rounded-full"
                        onClick={() => setDeleteTarget(garment)}
                        data-testid={`button-delete-garment-${garment.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {categoryLabel(garment.category)}
                      </Badge>
                    </div>
                    {(garment.usageCount ?? 0) > 0 && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="text-[10px] bg-black/40 text-white border-white/20">
                          Used {garment.usageCount}×
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate" data-testid={`text-garment-name-${garment.id}`}>
                      {garment.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(garment.createdAt!).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No garments saved yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Save clothing items to your inventory for quick access during try-ons.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add First Garment
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from inventory?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently removed from your inventory. 
              This won't affect existing try-ons that used this garment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete-garment"
            >
              {deleteGarment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
