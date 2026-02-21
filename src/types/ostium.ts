/**
 * Ostium (Perps) frontend type definitions.
 */

export type OstiumNetwork = "testnet" | "mainnet";

export type OstiumAction =
  | "MARKETS"
  | "PRICE"
  | "BALANCE"
  | "LIST_POSITIONS"
  | "OPEN_POSITION"
  | "CLOSE_POSITION"
  | "UPDATE_SL"
  | "UPDATE_TP";

export type OstiumSide = "long" | "short";

export const OSTIUM_NETWORK_LABELS: Record<OstiumNetwork, string> = {
  testnet: "Arbitrum Sepolia (Testnet)",
  mainnet: "Arbitrum Mainnet",
};

export const OSTIUM_ACTION_LABELS: Record<OstiumAction, string> = {
  MARKETS: "List Markets",
  PRICE: "Get Price",
  BALANCE: "Get Balance",
  LIST_POSITIONS: "List Positions",
  OPEN_POSITION: "Open Position",
  CLOSE_POSITION: "Close Position",
  UPDATE_SL: "Update Stop-Loss",
  UPDATE_TP: "Update Take-Profit",
};

export const OSTIUM_ACTIONS: OstiumAction[] = [
  "MARKETS",
  "PRICE",
  "BALANCE",
  "LIST_POSITIONS",
  "OPEN_POSITION",
  "CLOSE_POSITION",
  "UPDATE_SL",
  "UPDATE_TP",
];

export const OSTIUM_PANEL_ACTIONS: OstiumAction[] = [
  "MARKETS",
  "PRICE",
  "OPEN_POSITION",
  "CLOSE_POSITION",
];

export function actionRequiresDelegation(action: OstiumAction): boolean {
  return (
    action === "OPEN_POSITION" ||
    action === "CLOSE_POSITION" ||
    action === "UPDATE_SL" ||
    action === "UPDATE_TP"
  );
}

export function actionRequiresAllowance(action: OstiumAction): boolean {
  return action === "OPEN_POSITION";
}

export interface OstiumReadinessCheck {
  ok: boolean;
  message: string;
}

export interface OstiumReadiness {
  network: OstiumNetwork;
  chainId: number;
  safeAddress: string | null;
  delegateAddress: string | null;
  contracts: {
    usdc: string;
    trading: string;
    tradingStorage: string;
  };
  checks: {
    safeWallet: OstiumReadinessCheck & { address: string | null };
    delegation: OstiumReadinessCheck & { status: string | null };
    usdcBalance: OstiumReadinessCheck & { balance: string | null };
    allowance: OstiumReadinessCheck & { amount: string | null; spender: string };
    delegateGas: OstiumReadinessCheck & { balance: string | null; address: string | null };
  };
  readyForOpenPosition: boolean;
  readyForPositionManagement: boolean;
  refreshedAt: string;
}

export interface OstiumDelegationStatus {
  status: "PENDING" | "ACTIVE" | "REVOKED" | "FAILED";
  safeAddress?: string;
  approvalTxHash?: string | null;
  revokeTxHash?: string | null;
  safeTxHash?: string | null;
  lastError?: string | null;
  updatedAt?: string;
}

export interface OstiumSetupActionItem {
  id:
    | "SAFE_WALLET"
    | "DELEGATION"
    | "SAFE_USDC_BALANCE"
    | "USDC_ALLOWANCE"
    | "DELEGATE_GAS";
  label: string;
  done: boolean;
  message: string;
}

export interface OstiumSetupOverview {
  network: OstiumNetwork;
  delegation: OstiumDelegationStatus | null;
  readiness: OstiumReadiness;
  actionItems: OstiumSetupActionItem[];
  refreshedAt: string;
}
