import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type TryOnInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";

// Fetch all try-ons
export function useTryOns() {
  const { toast } = useToast();
  return useQuery({
    queryKey: [api.tryOns.list.path],
    queryFn: async () => {
      const res = await fetch(api.tryOns.list.path, { credentials: "include" });
      if (res.status === 401) {
        redirectToLogin(toast);
        return [];
      }
      if (!res.ok) throw new Error("Failed to fetch try-ons");
      return api.tryOns.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch single try-on
export function useTryOn(id: number) {
  const { toast } = useToast();
  return useQuery({
    queryKey: [api.tryOns.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tryOns.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 401) {
        redirectToLogin(toast);
        return null;
      }
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch try-on details");
      return api.tryOns.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Create new try-on
export function useCreateTryOn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: TryOnInput) => {
      const res = await fetch(api.tryOns.create.path, {
        method: api.tryOns.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (res.status === 401) {
        redirectToLogin(toast);
        throw new Error("Unauthorized");
      }
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create try-on");
      }
      
      return api.tryOns.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tryOns.list.path] });
      toast({
        title: "Success",
        description: "Try-on request started successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Poll for try-on status
export function useTryOnStatus(id: number, currentStatus?: string) {
  return useQuery({
    queryKey: [api.tryOns.status.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tryOns.status.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch status");
      return api.tryOns.status.responses[200].parse(await res.json());
    },
    // Poll every 3 seconds if status is processing or pending
    refetchInterval: (query) => {
      const status = query.state.data?.status || currentStatus;
      return (status === 'pending' || status === 'processing') ? 3000 : false;
    },
    enabled: !!id && (currentStatus === 'pending' || currentStatus === 'processing'),
  });
}
