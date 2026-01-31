/**
 * Onboarding Module
 * Centralized Safe wallet onboarding orchestration
 */

export {
  getFrontendMode,
  fetchBackendRuntimeConfig,
  assertModeMatchOrThrow,
  getOnboardingChains,
  validateAndGetOnboardingChains,
  ModeMismatchError,
  type BackendRuntimeConfig,
} from "./config";

export { ensureChainSelected, waitForChain } from "./chain-switcher";

export { verifyModuleEnabled } from "./safemodule-verifier";
