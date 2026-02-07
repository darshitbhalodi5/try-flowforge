"use client";

import React, { useState } from "react";
import { usePrivy, useWallets, useLinkAccount, useCreateWallet } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { FaWallet, FaPlus } from "react-icons/fa";
import { useOnboarding } from "@/context/OnboardingContext";

export const WALLET_CHOICE_DISMISS_KEY = "flowforge_wallet_choice_embedded_dismissed";

/**
 * After login: ask "Connect Wallet?".
 * - Yes → open Privy wallet connection modal; on success dismiss modal and proceed.
 * - No → use embedded wallet (create if needed), then proceed.
 *
 * Visibility is driven by:
 *   1. `initialCheckDone` – wait for the early user-existence check so returning
 *      (fully-onboarded) users never see this modal.
 *   2. `walletChoiceCompletedByUser` – once the user acts (or the early check
 *      auto-completes for returning users) the modal hides.
 */
export function WalletChoiceModal() {
    const { authenticated, ready } = usePrivy();
    const { wallets = [], ready: walletsReady } = useWallets();
    const { walletChoiceCompletedByUser, setWalletChoiceCompleted, initialCheckDone } = useOnboarding();
    const [connectError, setConnectError] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // useLinkAccount permanently links the wallet to the Privy user account
    // (unlike useConnectWallet which is session-only).  The backend auth
    // middleware reads user.linkedAccounts, so the wallet must be linked.
    const { linkWallet } = useLinkAccount({
        onSuccess: () => {
            setConnectError(null);
            // Wallet is now permanently linked → dismiss modal and continue
            setWalletChoiceCompleted(true);
        },
        onError: (error) => setConnectError(typeof error === "string" ? error : String(error)),
    });
    const { createWallet } = useCreateWallet();

    // Show the modal only when:
    //  • user is authenticated & SDK is ready
    //  • the early user-existence check has finished (avoids flash for returning users)
    //  • wallet choice hasn't been resolved yet
    const showChoice =
        authenticated &&
        ready &&
        initialCheckDone &&
        !walletChoiceCompletedByUser;
    if (!showChoice) return null;

    const handleYesConnect = () => {
        setConnectError(null);
        linkWallet();
    };

    const handleNoUseEmbedded = async () => {
        setCreateError(null);
        // Create an embedded wallet if user doesn't already have one.
        // Check specifically for an embedded (privy) wallet — useWallets()
        // may include injected browser wallets (e.g. MetaMask extension)
        // that are NOT linked to the Privy account.
        const hasEmbeddedWallet = wallets.some((w) => w.walletClientType === "privy");
        if (!hasEmbeddedWallet) {
            setIsCreating(true);
            try {
                await createWallet();
                // Brief pause so Privy's servers propagate the new embedded
                // wallet into linkedAccounts before the backend reads it.
                await new Promise((r) => setTimeout(r, 1500));
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                // "already has an embedded wallet" is fine — just proceed
                if (!message.toLowerCase().includes("already")) {
                    setCreateError(message);
                    setIsCreating(false);
                    return;
                }
            }
            setIsCreating(false);
        }
        setWalletChoiceCompleted(true);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-choice-title"
            aria-describedby="wallet-choice-description"
        >
            <div className="fixed inset-0 bg-background/90 backdrop-blur-md" />

            <div
                className="relative z-50 w-full max-w-md flex flex-col items-center justify-center p-6 gap-6 bg-black/95 border border-white/20 rounded-xl shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <FaWallet className="w-14 h-14 text-primary shrink-0" />
                    <h2
                        id="wallet-choice-title"
                        className="text-xl font-semibold text-foreground"
                    >
                        Connect your wallet?
                    </h2>
                    <p
                        id="wallet-choice-description"
                        className="text-sm text-muted-foreground max-w-[85%]"
                    >
                        Use your own wallet (e.g. MetaMask) or an embedded wallet we create for you.
                    </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <Button
                        onClick={handleYesConnect}
                        className="w-full gap-2"
                        disabled={!walletsReady}
                    >
                        <FaWallet className="w-4 h-4" />
                        {walletsReady ? "Yes, connect my wallet" : "Loading…"}
                    </Button>
                    {connectError && (
                        <p className="text-sm text-destructive text-center">
                            {connectError}
                        </p>
                    )}

                    <Button
                        onClick={handleNoUseEmbedded}
                        disabled={!walletsReady || isCreating}
                        variant="default"
                        border
                        borderColor="rgba(255,255,255,0.3)"
                        className="w-full gap-2 bg-transparent hover:bg-white/10"
                    >
                        {isCreating ? (
                            <>Creating…</>
                        ) : !walletsReady ? (
                            <>Loading…</>
                        ) : (
                            <>
                                <FaPlus className="w-4 h-4" />
                                No, use embedded wallet
                            </>
                        )}
                    </Button>
                    {createError && (
                        <p className="text-sm text-destructive text-center">
                            {createError}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WalletChoiceModal;
