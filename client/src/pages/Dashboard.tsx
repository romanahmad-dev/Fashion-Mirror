import { useTryOns } from "@/hooks/use-try-ons";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: tryOns, isLoading } = useTryOns();

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
          <Button className="rounded-full px-6">
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
            >
              <Link href={`/try-ons/${tryOn.id}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
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
    </div>
  );
}
