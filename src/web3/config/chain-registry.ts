/**
 * Chain Registry - Single source for all chain data in the frontend.
 */



// ─── Chain Info ──────────────────────────────────────────────────────

export interface ChainInfo {
    /** Identifier that matches the backend SupportedChain enum value, e.g. "ARBITRUM" */
    id: string;
    /** EVM numeric chain ID, e.g. 42161 */
    chainId: number;
    /** Full display name, e.g. "Arbitrum One" */
    name: string;
    /** Short label for dropdowns, e.g. "Arbitrum" */
    label: string;
    /** Whether this is a test network */
    isTestnet: boolean;
    /** Block explorer base URL */
    explorerUrl: string;
    /** Public RPC URL */
    rpcUrl?: string;

}

// ─── Well-Known Chain Identifiers ────────────────────────────────────

export const Chains = {
    ARBITRUM: "ARBITRUM",
    ARBITRUM_SEPOLIA: "ARBITRUM_SEPOLIA"
} as const;

// ─── THE Registry ────────────────────────────────────────────────────
// Add / remove chains HERE.  Order matters for UI dropdowns.

export const CHAIN_REGISTRY: ChainInfo[] = [
    {
        id: Chains.ARBITRUM,
        chainId: 42161,
        name: "Arbitrum One",
        label: "Arbitrum",
        isTestnet: false,
        explorerUrl: "https://arbiscan.io",

        rpcUrl: "https://arb1.arbitrum.io/rpc",
    },
    {
        id: Chains.ARBITRUM_SEPOLIA,
        chainId: 421614,
        name: "Arbitrum Sepolia",
        label: "Arbitrum Sepolia",
        isTestnet: true,
        explorerUrl: "https://sepolia.arbiscan.io",

        rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    }
];

// ─── Derived Helpers (auto-update when CHAIN_REGISTRY changes) ───────

const _byId = new Map<string, ChainInfo>(CHAIN_REGISTRY.map((c) => [c.id, c]));
const _byChainId = new Map<number, ChainInfo>(
    CHAIN_REGISTRY.map((c) => [c.chainId, c]),
);

/** Look up a chain by its string identifier (e.g. "ARBITRUM") */
export const getChainById = (id: string): ChainInfo | undefined =>
    _byId.get(id);

/** Look up a chain by its numeric EVM chain ID (e.g. 42161) */
export const getChainByChainId = (chainId: number): ChainInfo | undefined =>
    _byChainId.get(chainId);

/** All registered chain IDs as an array of strings */
export const getAllChainIds = (): string[] => CHAIN_REGISTRY.map((c) => c.id);

/** All registered chains */
export const getAllChains = (): ChainInfo[] => [...CHAIN_REGISTRY];

/** Only mainnet chains */
export const getMainnetChains = (): ChainInfo[] =>
    CHAIN_REGISTRY.filter((c) => !c.isTestnet);

/** Only testnet chains */
export const getTestnetChains = (): ChainInfo[] =>
    CHAIN_REGISTRY.filter((c) => c.isTestnet);

/**
 * Auto-generated chain labels for dropdowns.
 * Replaces the old manually maintained `CHAIN_LABELS` Record.
 */
export const CHAIN_LABELS: Record<string, string> = Object.fromEntries(
    CHAIN_REGISTRY.map((c) => [c.id, c.label]),
);

/**
 * Filter chains to only those in the given list of IDs.
 * Useful for blocks that declare `supportedChains`.
 */
export const filterChains = (chainIds: string[]): ChainInfo[] => {
    const set = new Set(chainIds);
    return CHAIN_REGISTRY.filter((c) => set.has(c.id));
};
