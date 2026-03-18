import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GithubIntegrationStatus {
  connected: boolean;
  githubUserId?: string;
  githubUsername?: string;
  lastSyncAt?: string;
  scope?: string;
}

/**
 * Hook to get GitHub integration status
 */
export function useGithubIntegration() {
  return useQuery<GithubIntegrationStatus>({
    queryKey: ["github-integration"],
    queryFn: async () => {
      const response = await fetch("/api/integrations/github");
      if (!response.ok) {
        throw new Error("Failed to fetch GitHub integration status");
      }
      return response.json();
    },
  });
}

/**
 * Hook to connect GitHub integration
 */
export function useConnectGithub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/integrations/github", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to connect GitHub");
      }

      const { authUrl } = await response.json();
      
      // Redirect to GitHub OAuth page
      window.location.href = authUrl;
    },
    onError: (error) => {
      console.error("Error connecting GitHub:", error);
    },
  });
}

/**
 * Hook to disconnect GitHub integration
 */
export function useDisconnectGithub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/integrations/github", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to disconnect GitHub");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch integration status
      queryClient.invalidateQueries({ queryKey: ["github-integration"] });
    },
    onError: (error) => {
      console.error("Error disconnecting GitHub:", error);
    },
  });
}
