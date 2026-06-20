import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type TryOnInput, type GarmentInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";

// ─── Try-On Hooks ─────────────────────────────────────────────────────────────

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

export function useRetryTryOn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/try-ons/${id}/retry`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.status === 401) { redirectToLogin(toast); throw new Error('Unauthorized'); }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to retry try-on');
      }
      return res.json();
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [api.tryOns.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.tryOns.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.tryOns.status.path, id] });
      toast({ title: 'Retrying', description: 'Generation has been restarted.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTryOn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tryOns.delete.path, { id });
      const res = await fetch(url, {
        method: api.tryOns.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete try-on");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tryOns.list.path] });
      toast({ title: "Deleted", description: "Try-on removed from history." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete try-on.", variant: "destructive" });
    },
  });
}

export function useTryOnStatus(id: number, currentStatus?: string) {
  return useQuery({
    queryKey: [api.tryOns.status.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tryOns.status.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch status");
      return api.tryOns.status.responses[200].parse(await res.json());
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status || currentStatus;
      return (status === 'pending' || status === 'processing') ? 3000 : false;
    },
    enabled: !!id && (currentStatus === 'pending' || currentStatus === 'processing'),
  });
}

// ─── Inventory Hooks ──────────────────────────────────────────────────────────

export function useInventory() {
  const { toast } = useToast();
  return useQuery({
    queryKey: [api.inventory.list.path],
    queryFn: async () => {
      const res = await fetch(api.inventory.list.path, { credentials: "include" });
      if (res.status === 401) {
        redirectToLogin(toast);
        return [];
      }
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return api.inventory.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddGarment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GarmentInput) => {
      const res = await fetch(api.inventory.create.path, {
        method: api.inventory.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add garment");
      return api.inventory.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] });
      toast({ title: "Added", description: "Garment saved to your inventory." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save garment.", variant: "destructive" });
    },
  });
}

export function useDeleteGarment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.inventory.delete.path, { id });
      const res = await fetch(url, {
        method: api.inventory.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete garment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] });
      toast({ title: "Removed", description: "Garment removed from inventory." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove garment.", variant: "destructive" });
    },
  });
}
