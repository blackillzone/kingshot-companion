/**
 * Store fixtures and utilities for testing
 *
 * Ensures proper isolation and reset of store state between tests
 * to prevent state leakage and intermittent test failures.
 */

import { useRallyStore } from "../store/useRallyStore";

/**
 * Reset store to default state
 *
 * Use in beforeEach() to ensure clean state between tests
 * @example
 * beforeEach(() => {
 *   resetStore()
 *   localStorage.clear()
 * })
 */
export function resetStore(): void {
  // Load initial state from localStorage or use defaults
  const stored = localStorage.getItem("ks_profiles");
  const activeProfileId = localStorage.getItem("ks_active_profile");

  // Reset to initial state
  useRallyStore.setState({
    profiles: stored ? JSON.parse(stored) : [],
    activeProfileId: activeProfileId ?? null,
  });
}

/**
 * Create store snapshot for verification
 * Useful for comparing store before/after state
 */
export function captureStoreState() {
  const state = useRallyStore.getState();
  return {
    profiles: JSON.parse(JSON.stringify(state.profiles)),
    activeProfileId: state.activeProfileId,
    activeProfile: state.activeProfile
      ? JSON.parse(JSON.stringify(state.activeProfile))
      : null,
    rallyConfig: JSON.parse(JSON.stringify(state.rallyConfig)),
  };
}
