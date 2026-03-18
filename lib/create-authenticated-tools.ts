import type { Tool } from "ai";

/**
 * Wraps tool definitions to inject authenticated userId into all tool calls.
 * This ensures that the actual authenticated user's ID from the session is used,
 * not the placeholder value from the AI SDK.
 */
export function createAuthenticatedTools<T extends Record<string, Tool>>(
  tools: T,
  userId: string,
  additionalContext?: Record<string, any>
): T {
  console.log(`[createAuthenticatedTools] Wrapping tools for userId: ${userId}`);

  const wrappedTools = {} as T;

  for (const [name, toolDef] of Object.entries(tools)) {
    const originalExecute = toolDef.execute;

    if (!originalExecute) {
      // If tool has no execute function, keep it as-is
      wrappedTools[name as keyof T] = toolDef as T[keyof T];
      continue;
    }

    wrappedTools[name as keyof T] = {
      ...toolDef,
      execute: async (args: any, options: any) => {
        // Override any userId in args with the authenticated userId
        const authenticatedArgs = {
          ...args,
          userId, // Force authenticated userId
          ...additionalContext, // Inject additional context like githubUsername
        };

        console.log(
          `[createAuthenticatedTools] Executing ${name} with authenticated userId: ${userId}`
        );

        return originalExecute(authenticatedArgs, options);
      },
    } as T[keyof T];
  }

  return wrappedTools;
}
