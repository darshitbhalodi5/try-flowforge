/**
 * Centralized blockchain chain configuration and helpers.
 *
 * This file now DELEGATES to @/config/chain-registry.ts for almost everything.
 * It serves as an adapter to format the registry data for viem/privy/wagmi.
 */

import {
  arbitrum,
  arbitrumSepolia,
  Chain,
} from "viem/chains";
import {
  CHAIN_REGISTRY,
  ChainInfo,
  Chains as RegistryChains,
} from "@/web3/config/chain-registry";
import { getContractAddress } from "@/web3/config/contract-registry";

// Map our internal Chain IDs (strings) to Viem Chain objects
const VIEM_CHAIN_MAP: Record<string, Chain> = {
  [RegistryChains.ARBITRUM]: arbitrum,
  [RegistryChains.ARBITRUM_SEPOLIA]: arbitrumSepolia
  // Add new chains here as they are added to registry
};

// ─── Constants derived from Registry ─────────────────────────────────

/**
 * Numeric Chain IDs map (e.g. { ARBITRUM: 42161, ... })
 * Used by legacy code that expects this shape.
 */
export const CHAIN_IDS = CHAIN_REGISTRY.reduce((acc, chain) => {
  // Create a key that matches the old style if possible (uppercase ID)
  // The ID in registry is already uppercase like "ARBITRUM"
  acc[chain.id] = chain.chainId;
  // Also support "ARBITRUM_MAINNET" style for back-compat if needed,
  // though "ARBITRUM" is preferred.
  if (chain.id === RegistryChains.ARBITRUM) {
    acc["ARBITRUM_MAINNET"] = chain.chainId;
  }
  return acc;
}, {} as Record<string, number>);

export type SupportedChainId = number;

export type ChainDefinition = ChainInfo & {
  key: "testnet" | "mainnet";
  safeWalletFactoryAddress: string;
  safeModuleAddress: string;
};

// ─── Exported Lists ──────────────────────────────────────────────────

export const USE_TESTNET_ONLY =
  process.env.NEXT_PUBLIC_USE_TESTNET_ONLY === "true";

/**
 * All chains formatted as ChainDefinitions for internal app use
 */
export const ALL_CHAINS: ChainDefinition[] = CHAIN_REGISTRY.map((chain) => ({
  ...chain,
  key: (chain.isTestnet ? "testnet" : "mainnet") as "testnet" | "mainnet",

  safeWalletFactoryAddress: getContractAddress(chain.id, "safeWalletFactory") || "",
  safeModuleAddress: getContractAddress(chain.id, "safeModule") || "",
})).filter((chain) => !USE_TESTNET_ONLY || chain.isTestnet);

/**
 * Viem chains for Wagmi/Privy config
 */
export const VIEM_CHAINS: Chain[] = ALL_CHAINS.map((c) => VIEM_CHAIN_MAP[c.id]).filter(
  (c): c is Chain => !!c,
);

// Re-export specific chains for convenience if needed
export { arbitrum, arbitrumSepolia };

// ─── Utility Functions ───────────────────────────────────────────────

export function isSupportedChain(chainId: number): boolean {
  return ALL_CHAINS.some((c) => c.chainId === chainId);
}

export function getChainName(chainId: number): string {
  return ALL_CHAINS.find((c) => c.chainId === chainId)?.name ?? `Chain ${chainId}`;
}

export function getSelectableChains(): ChainDefinition[] {
  return ALL_CHAINS;
}

export function isTestnet(chainId: number | null | undefined): boolean {
  if (!chainId) return false;
  return ALL_CHAINS.find((c) => c.chainId === chainId)?.isTestnet ?? false;
}

export function isMainnet(chainId: number | null | undefined): boolean {
  if (!chainId) return false;
  return !isTestnet(chainId);
}

/**
 * Get target chain ID for network switching.
 * Defaults to Arbitrum Sepolia (testnet) or Arbitrum One (mainnet).
 */
export function getTargetChainId(toTestnet: boolean): number {
  if (toTestnet) {
    return (
      CHAIN_IDS[RegistryChains.ARBITRUM_SEPOLIA] || 421614
    );
  }
  return CHAIN_IDS[RegistryChains.ARBITRUM] || 42161;
}

export function getDefaultChainForPrivy() {
  return arbitrumSepolia;
}

export function getSupportedChainsForPrivy() {
  return VIEM_CHAINS;
}

export function getSafeWalletFactoryAddress(chainId: number): string {
  return ALL_CHAINS.find((c) => c.chainId === chainId)?.safeWalletFactoryAddress ?? "";
}

export function getSafeModuleAddress(chainId: number): string {
  return ALL_CHAINS.find((c) => c.chainId === chainId)?.safeModuleAddress ?? "";
}
