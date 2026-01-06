/**
 * Feature Flags Dictionary
 * 
 * Centralized feature flag management for the application.
 * Use this to control feature rollouts and A/B testing.
 */

interface FeatureFlag {
    key: string;
    enabled: boolean;
    description: string;
}

export const FEATURE_FLAGS = {
    // Authentication & User Management
    FREE_PRICING: {
        key: "free_pricing",
        enabled: true,
        description: "Enables free pricing tier for all users",
    },
} as const satisfies Record<string, FeatureFlag>;

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(
    featureKey: keyof typeof FEATURE_FLAGS
): boolean {
    return FEATURE_FLAGS[featureKey].enabled;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
    return Object.values(FEATURE_FLAGS)
        .filter((flag) => flag.enabled)
        .map((flag) => flag.key);
}

/**
 * Feature flag type for external use
 */
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;