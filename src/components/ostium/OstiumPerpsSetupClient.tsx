"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Safe from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { usePrivy } from "@privy-io/react-auth";
import {
  LuArrowLeft,
  LuCircleAlert,
  LuCircleCheck,
  LuLoader,
  LuRefreshCw,
  LuShield,
  LuShieldAlert,
  LuShieldCheck,
} from "react-icons/lu";
import { Typography } from "@/components/ui/Typography";
import { SimpleCard } from "@/components/ui/SimpleCard";
import { Button } from "@/components/ui/Button";
import { API_CONFIG } from "@/config/api";
import { FEATURE_FLAGS } from "@/config/feature-flags";
import { usePrivyWallet } from "@/hooks/usePrivyWallet";
import { postOstiumAuthed } from "@/lib/ostium-api";
import { emitOstiumTelemetry } from "@/lib/ostium-telemetry";
import { getChain } from "@/web3/config/chain-registry";
import { OSTIUM_NETWORK_LABELS, type OstiumNetwork, type OstiumSetupOverview } from "@/types/ostium";

interface SafeTxData {
  to: string;
  value: string;
  data: string;
  operation: number;
}

function getDelegationStatusVisual(status: string | null): {
  label: string;
  className: string;
  icon: React.ReactNode;
} {
  if (status === "ACTIVE") {
    return {
      label: "Active",
      className: "text-green-400 bg-green-500/10 border-green-500/30",
      icon: <LuShieldCheck className="w-4 h-4" />,
    };
  }
  if (status === "PENDING") {
    return {
      label: "Pending",
      className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      icon: <LuShield className="w-4 h-4" />,
    };
  }
  if (status === "REVOKED") {
    return {
      label: "Revoked",
      className: "text-zinc-300 bg-zinc-500/10 border-zinc-500/30",
      icon: <LuShieldAlert className="w-4 h-4" />,
    };
  }
  if (status === "FAILED") {
    return {
      label: "Failed",
      className: "text-red-400 bg-red-500/10 border-red-500/30",
      icon: <LuShieldAlert className="w-4 h-4" />,
    };
  }
  return {
    label: "Unknown",
    className: "text-zinc-300 bg-white/5 border-white/10",
    icon: <LuShield className="w-4 h-4" />,
  };
}

function getCheckVisual(ok: boolean): { className: string; label: string; icon: React.ReactNode } {
  if (ok) {
    return {
      className: "text-green-300 bg-green-500/10 border-green-500/20",
      label: "Ready",
      icon: <LuCircleCheck className="w-4 h-4" />,
    };
  }
  return {
    className: "text-amber-200 bg-amber-500/10 border-amber-500/20",
    label: "Action Required",
    icon: <LuCircleAlert className="w-4 h-4" />,
  };
}

export default function OstiumPerpsSetupClient() {
  const { authenticated, login } = usePrivy();
  const { getPrivyAccessToken, ethereumProvider, chainId, walletAddress } = usePrivyWallet();
  const chain = getChain(chainId);
  const derivedNetwork: OstiumNetwork = chain?.id === "ARBITRUM" ? "mainnet" : "testnet";

  const [overviewState, setOverviewState] = useState<{
    loading: boolean;
    error: string | null;
    data: OstiumSetupOverview | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });
  const [delegationActionLoading, setDelegationActionLoading] = useState<"approve" | "revoke" | null>(null);
  const [allowanceActionLoading, setAllowanceActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    kind: "error" | "success";
    value: string;
  } | null>(null);
  const overviewInFlightRef = useRef(false);
  const lastOverviewFetchAtRef = useRef(0);

  useEffect(() => {
    emitOstiumTelemetry("ostium_setup_page_opened", { network: derivedNetwork });
  }, [derivedNetwork]);

  const refreshOverview = useCallback(async (force = false) => {
    if (!authenticated || overviewInFlightRef.current) {
      return;
    }
    if (
      !force &&
      Date.now() - lastOverviewFetchAtRef.current < FEATURE_FLAGS.OSTIUM_SETUP_FETCH_COOLDOWN_MS
    ) {
      return;
    }

    overviewInFlightRef.current = true;
    setOverviewState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const data = await postOstiumAuthed<OstiumSetupOverview>(
        getPrivyAccessToken,
        API_CONFIG.ENDPOINTS.OSTIUM.SETUP_OVERVIEW,
        { network: derivedNetwork },
        {
          dedupeInFlight: true,
          dedupeKey: `ostium:setup-overview:${derivedNetwork}`,
          cacheMs: FEATURE_FLAGS.OSTIUM_SETUP_FETCH_COOLDOWN_MS,
        },
      );
      lastOverviewFetchAtRef.current = Date.now();
      emitOstiumTelemetry("ostium_setup_refreshed", { network: derivedNetwork });
      setOverviewState({
        loading: false,
        error: null,
        data,
      });
    } catch (error) {
      setOverviewState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load Ostium setup overview",
        data: null,
      });
      emitOstiumTelemetry("ostium_setup_refreshed", {
        network: derivedNetwork,
        error: error instanceof Error ? error.message : "unknown",
      });
    } finally {
      overviewInFlightRef.current = false;
    }
  }, [authenticated, derivedNetwork, getPrivyAccessToken]);

  const signAndExecuteSafeFlow = useCallback(
    async (
      prepared: { safeAddress: string; safeTxHash: string; safeTxData: SafeTxData },
      executeEndpoint: string,
      extraPayload: Record<string, unknown> = {},
    ) => {
      if (!ethereumProvider) {
        throw new Error("Ethereum provider unavailable. Reconnect wallet and try again.");
      }

      const safeSdk = await Safe.init({
        provider: ethereumProvider as unknown as ethers.Eip1193Provider,
        safeAddress: prepared.safeAddress,
      });

      const safeTransaction = await safeSdk.createTransaction({
        transactions: [
          {
            to: prepared.safeTxData.to,
            value: prepared.safeTxData.value,
            data: prepared.safeTxData.data,
            operation: prepared.safeTxData.operation,
          },
        ],
      });

      const signedSafeTx = await safeSdk.signTransaction(safeTransaction);
      const signedTxHash = await safeSdk.getTransactionHash(signedSafeTx);
      if (signedTxHash.toLowerCase() !== prepared.safeTxHash.toLowerCase()) {
        throw new Error(
          `Safe tx hash mismatch. Backend=${prepared.safeTxHash} Frontend=${signedTxHash}`,
        );
      }

      const signature = signedSafeTx.encodedSignatures();
      if (!signature || signature === "0x") {
        throw new Error("Failed to produce Safe signature.");
      }

      await postOstiumAuthed(
        getPrivyAccessToken,
        executeEndpoint,
        {
        network: derivedNetwork,
        signature,
        ...extraPayload,
        },
      );
    },
    [derivedNetwork, ethereumProvider, getPrivyAccessToken],
  );

  const runDelegationFlow = useCallback(
    async (mode: "approve" | "revoke") => {
      const prepareEndpoint =
        mode === "approve"
          ? API_CONFIG.ENDPOINTS.OSTIUM.DELEGATION_PREPARE
          : API_CONFIG.ENDPOINTS.OSTIUM.DELEGATION_REVOKE_PREPARE;
      const executeEndpoint =
        mode === "approve"
          ? API_CONFIG.ENDPOINTS.OSTIUM.DELEGATION_EXECUTE
          : API_CONFIG.ENDPOINTS.OSTIUM.DELEGATION_REVOKE_EXECUTE;

      setDelegationActionLoading(mode);
      setActionMessage(null);
      emitOstiumTelemetry(
        mode === "approve"
          ? "ostium_delegation_approve_started"
          : "ostium_delegation_revoke_started",
        { network: derivedNetwork },
      );

      try {
        const prepared = await postOstiumAuthed<{
          safeAddress: string;
          safeTxHash: string;
          safeTxData: SafeTxData;
        }>(getPrivyAccessToken, prepareEndpoint, { network: derivedNetwork });
        await signAndExecuteSafeFlow(prepared, executeEndpoint);
        await refreshOverview(true);
        emitOstiumTelemetry(
          mode === "approve"
            ? "ostium_delegation_approve_succeeded"
            : "ostium_delegation_revoke_succeeded",
          { network: derivedNetwork },
        );
        setActionMessage({
          kind: "success",
          value: mode === "approve" ? "Delegation approved successfully." : "Delegation revoked successfully.",
        });
      } catch (error) {
        emitOstiumTelemetry(
          mode === "approve"
            ? "ostium_delegation_approve_failed"
            : "ostium_delegation_revoke_failed",
          { network: derivedNetwork, error: error instanceof Error ? error.message : "unknown" },
        );
        setActionMessage({
          kind: "error",
          value: error instanceof Error ? error.message : "Delegation flow failed",
        });
      } finally {
        setDelegationActionLoading(null);
      }
    },
    [derivedNetwork, getPrivyAccessToken, refreshOverview, signAndExecuteSafeFlow],
  );

  const runAllowanceFlow = useCallback(async () => {
    setAllowanceActionLoading(true);
    setActionMessage(null);
    emitOstiumTelemetry("ostium_allowance_started", { network: derivedNetwork });

    try {
      const prepared = await postOstiumAuthed<{
        safeAddress: string;
        safeTxHash: string;
        safeTxData: SafeTxData;
      }>(getPrivyAccessToken, API_CONFIG.ENDPOINTS.OSTIUM.ALLOWANCE_PREPARE, {
        network: derivedNetwork,
      });

      await signAndExecuteSafeFlow(prepared, API_CONFIG.ENDPOINTS.OSTIUM.ALLOWANCE_EXECUTE, {
        safeTxHash: prepared.safeTxHash,
        safeTxData: prepared.safeTxData,
      });

      await refreshOverview(true);
      emitOstiumTelemetry("ostium_allowance_succeeded", { network: derivedNetwork });
      setActionMessage({
        kind: "success",
        value: "USDC allowance approved successfully.",
      });
    } catch (error) {
      emitOstiumTelemetry("ostium_allowance_failed", {
        network: derivedNetwork,
        error: error instanceof Error ? error.message : "unknown",
      });
      setActionMessage({
        kind: "error",
        value: error instanceof Error ? error.message : "USDC allowance approval failed",
      });
    } finally {
      setAllowanceActionLoading(false);
    }
  }, [derivedNetwork, getPrivyAccessToken, refreshOverview, signAndExecuteSafeFlow]);

  useEffect(() => {
    if (!authenticated) return;
    void refreshOverview(true);
  }, [authenticated, refreshOverview]);

  useEffect(() => {
    if (!authenticated || !FEATURE_FLAGS.OSTIUM_SETUP_AUTO_REFRESH_ENABLED) {
      return;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refreshOverview();
    }, FEATURE_FLAGS.OSTIUM_SETUP_AUTO_REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [authenticated, refreshOverview]);

  const overview = overviewState.data;
  const delegationStatus = overview?.delegation?.status || overview?.readiness?.checks?.delegation?.status || null;
  const delegationVisual = getDelegationStatusVisual(delegationStatus);

  const needsAllowance = useMemo(
    () => !(overview?.readiness?.checks?.allowance?.ok ?? false),
    [overview],
  );

  const safeAddress = overview?.readiness?.safeAddress || null;
  const delegateAddress = overview?.readiness?.delegateAddress || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Typography variant="h4" className="font-semibold text-foreground">
              Ostium Perps Setup
            </Typography>
            <Typography variant="caption" className="text-muted-foreground block mt-1">
              Manage delegation, readiness, and allowance outside the workflow node panel.
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/automation-builder">
              <Button className="h-10 px-3 bg-white/10 hover:bg-white/15 text-white">
                <LuArrowLeft className="w-4 h-4" />
                Back to Builder
              </Button>
            </Link>
            <Button
              type="button"
              className="h-10 px-3 bg-white/10 hover:bg-white/15 text-white"
              onClick={() => void refreshOverview(true)}
              disabled={!authenticated || overviewState.loading}
            >
              {overviewState.loading ? (
                <LuLoader className="w-4 h-4 animate-spin" />
              ) : (
                <LuRefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {!authenticated && (
          <SimpleCard className="p-4 border-amber-500/20 bg-amber-500/5">
            <div className="flex gap-3">
              <LuCircleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-3 flex-1">
                <Typography variant="bodySmall" className="font-bold text-foreground">
                  Sign in required
                </Typography>
                <Typography variant="caption" className="text-muted-foreground block leading-relaxed">
                  Sign in to view and manage Ostium delegation/readiness.
                </Typography>
                <Button
                  onClick={login}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-10"
                >
                  Connect Wallet
                </Button>
              </div>
            </div>
          </SimpleCard>
        )}

        <SimpleCard className="p-4 space-y-2">
          <Typography variant="bodySmall" className="font-semibold text-foreground">
            Effective Account
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            Network:{" "}
            <span className="text-foreground">
              {OSTIUM_NETWORK_LABELS[derivedNetwork]}
            </span>
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            Privy wallet:{" "}
            <span className="text-foreground font-mono">{walletAddress || "-"}</span>
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            Safe address:{" "}
            <span className="text-foreground font-mono">{safeAddress || "-"}</span>
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            Delegate address:{" "}
            <span className="text-foreground font-mono">{delegateAddress || "-"}</span>
          </Typography>
        </SimpleCard>

        <SimpleCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="bodySmall" className="font-semibold text-foreground">
              Delegation
            </Typography>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${delegationVisual.className}`}
            >
              {delegationVisual.icon}
              {delegationVisual.label}
            </div>
          </div>
          <Typography variant="caption" className="text-muted-foreground block">
            Write actions require active delegation from your Safe to backend delegate.
          </Typography>
          <div className="flex flex-wrap gap-2">
            {delegationStatus === "ACTIVE" ? (
              <Button
                type="button"
                className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white"
                onClick={() => void runDelegationFlow("revoke")}
                disabled={!authenticated || delegationActionLoading !== null || !ethereumProvider}
              >
                {delegationActionLoading === "revoke" ? (
                  <LuLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <LuShieldAlert className="w-4 h-4" />
                )}
                Revoke Delegation
              </Button>
            ) : (
              <Button
                type="button"
                className="h-10 px-4 rounded-lg bg-green-600 hover:bg-green-500 text-white"
                onClick={() => void runDelegationFlow("approve")}
                disabled={!authenticated || delegationActionLoading !== null || !ethereumProvider}
              >
                {delegationActionLoading === "approve" ? (
                  <LuLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <LuShieldCheck className="w-4 h-4" />
                )}
                Approve Delegation
              </Button>
            )}
          </div>
        </SimpleCard>

        <SimpleCard className="p-4 space-y-3">
          <Typography variant="bodySmall" className="font-semibold text-foreground">
            Readiness Checks
          </Typography>
          {overview ? (
            <div className="space-y-2">
              {overview.actionItems.map((entry) => {
                const visual = getCheckVisual(entry.done);
                return (
                  <div key={entry.id} className={`rounded-lg border p-2 ${visual.className}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5">
                        {visual.icon}
                        <Typography variant="caption" className="font-semibold">
                          {entry.label}
                        </Typography>
                      </div>
                      <Typography variant="caption" className="opacity-90">
                        {visual.label}
                      </Typography>
                    </div>
                    <Typography variant="caption" className="block mt-1 opacity-90">
                      {entry.message}
                    </Typography>
                  </div>
                );
              })}
            </div>
          ) : (
            <Typography variant="caption" className="text-muted-foreground block">
              Refresh to load readiness checks.
            </Typography>
          )}
        </SimpleCard>

        <SimpleCard className="p-4 space-y-3">
          <Typography variant="bodySmall" className="font-semibold text-foreground">
            Allowance
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            Open position requires Safe USDC allowance to Ostium trading storage contract.
          </Typography>
          <Button
            type="button"
            className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
            onClick={() => void runAllowanceFlow()}
            disabled={!authenticated || allowanceActionLoading || !ethereumProvider || !needsAllowance}
          >
            {allowanceActionLoading ? (
              <LuLoader className="w-4 h-4 animate-spin" />
            ) : (
              <LuShieldCheck className="w-4 h-4" />
            )}
            {needsAllowance ? "Approve USDC Allowance" : "Allowance Ready"}
          </Button>
        </SimpleCard>

        <SimpleCard className="p-4 space-y-2">
          <Typography variant="bodySmall" className="font-semibold text-foreground">
            Diagnostics
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            Trading contract:{" "}
            <span className="text-foreground font-mono">
              {overview?.readiness.contracts.trading || "-"}
            </span>
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            Trading storage:{" "}
            <span className="text-foreground font-mono">
              {overview?.readiness.contracts.tradingStorage || "-"}
            </span>
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            USDC contract:{" "}
            <span className="text-foreground font-mono">
              {overview?.readiness.contracts.usdc || "-"}
            </span>
          </Typography>
          <Typography variant="caption" className="text-muted-foreground block">
            Last updated:{" "}
            <span className="text-foreground">
              {overview?.refreshedAt ? new Date(overview.refreshedAt).toLocaleString() : "-"}
            </span>
          </Typography>
        </SimpleCard>

        {overviewState.error && (
          <SimpleCard className="p-4 border-red-500/20 bg-red-500/10">
            <div className="flex gap-2">
              <LuCircleAlert className="w-4 h-4 text-red-400 mt-0.5" />
              <Typography variant="caption" className="text-red-300">
                {overviewState.error}
              </Typography>
            </div>
          </SimpleCard>
        )}

        {actionMessage && (
          <SimpleCard
            className={`p-4 border ${
              actionMessage.kind === "success"
                ? "border-green-500/20 bg-green-500/10"
                : "border-amber-500/20 bg-amber-500/10"
            }`}
          >
            <div className="flex gap-2">
              {actionMessage.kind === "success" ? (
                <LuCircleCheck className="w-4 h-4 text-green-400 mt-0.5" />
              ) : (
                <LuCircleAlert className="w-4 h-4 text-amber-300 mt-0.5" />
              )}
              <Typography
                variant="caption"
                className={actionMessage.kind === "success" ? "text-green-300" : "text-amber-200"}
              >
                {actionMessage.value}
              </Typography>
            </div>
          </SimpleCard>
        )}
      </div>
    </div>
  );
}
