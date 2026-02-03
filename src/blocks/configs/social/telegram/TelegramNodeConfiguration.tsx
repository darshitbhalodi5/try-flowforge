"use client";

import { useState, useCallback } from "react";
import { LuLoader, LuRefreshCw, LuBot, LuSend, LuTrash2, LuMessageSquare, LuX, LuPlus, LuCopy, LuCheck, LuCircleCheck, LuClock, LuCircleAlert } from "react-icons/lu";
import { SimpleCard } from "@/components/ui/SimpleCard";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { TemplateFieldSelector } from "@/blocks/configs/shared/TemplateFieldSelector";
import { useTelegramConnection } from "@/hooks/useTelegramConnection";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePrivyWallet } from "@/hooks/usePrivyWallet";
import { API_CONFIG, buildApiUrl } from "@/config/api";
import type { TelegramConnection } from "@/types/telegram";

interface TelegramMessage {
    updateId: number;
    messageId?: number;
    text?: string;
    from?: { id: number; firstName: string; username?: string };
    date: number;
}

interface TelegramNodeConfigurationProps {
    nodeData: Record<string, unknown>;
    handleDataChange: (updates: Record<string, unknown>) => void;
    authenticated: boolean;
    login: () => void;
}

function TelegramNodeConfigurationInner({
    nodeData,
    handleDataChange,
    authenticated,
    login,
}: TelegramNodeConfigurationProps) {
    const { getPrivyAccessToken } = usePrivyWallet();
    const {
        botInfo,
        connections,
        // chats,
        loading,
        notification,
        selectedConnection,
        telegramMessage,
        verificationCode,
        verificationStatus,
        actions,
    } = useTelegramConnection({
        nodeData,
        onDataChange: handleDataChange,
        authenticated,
    });

    // Message viewer state
    const [showMessages, setShowMessages] = useState(false);
    const [messages, setMessages] = useState<TelegramMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showVerificationFlow, setShowVerificationFlow] = useState(false);

    // Copy verification code to clipboard
    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // console.error('Failed to copy:', err);
        }
    }, []);

    // Load messages from backend
    const loadMessages = useCallback(async () => {
        if (!selectedConnection) return;

        setLoadingMessages(true);
        try {
            const accessToken = await getPrivyAccessToken();
            if (!accessToken) return;

            const response = await fetch(
                buildApiUrl(`${API_CONFIG.ENDPOINTS.TELEGRAM.CONNECTIONS}/${selectedConnection.id}/messages`),
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (response.ok) {
                const data = await response.json();
                setMessages(data.data.messages || []);
            }
        } catch {
            // console.error("Failed to load messages:", error);
        } finally {
            setLoadingMessages(false);
        }
    }, [selectedConnection, getPrivyAccessToken]);

    // Open message viewer
    const openMessageViewer = useCallback(() => {
        setShowMessages(true);
        loadMessages();
    }, [loadMessages]);

    // Show login prompt
    if (!authenticated) {
        return (
            <SimpleCard className="p-4 space-y-3">
                <Typography variant="bodySmall" className="font-semibold text-foreground">
                    Authentication Required
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                    Please log in to configure Telegram integration.
                </Typography>
                <Button onClick={login} className="w-full">
                    Login to Continue
                </Button>
            </SimpleCard>
        );
    }

    return (
        <div className="space-y-4">
            {/* Notification */}
            {notification && (
                <div className={`p-3 rounded-lg text-sm border ${notification.type === "error"
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : notification.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Step 1: Bot Info */}
            <SimpleCard className="p-4 space-y-3">
                <Typography variant="bodySmall" className="font-semibold text-foreground">
                    1. FlowForge Telegram Bot
                </Typography>

                {loading.bot ? (
                    <div className="flex items-center gap-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                            <LuLoader className="w-4 h-4 animate-spin text-amber-500/80" />
                        </div>
                        <div>
                            <Typography variant="bodySmall" className="font-medium text-foreground">Checking bot</Typography>
                            <Typography variant="caption" className="text-muted-foreground">Verifying configuration…</Typography>
                        </div>
                    </div>
                ) : botInfo ? (
                    <div className="flex flex-col gap-3 rounded-lg border-l-2 border-amber-500/50 bg-white/5 pl-3 py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                                <LuBot className="w-4 h-4 text-amber-500/90" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <code className="text-xs font-medium">
                                        @{botInfo.username}
                                    </code>
                                </div>
                            </div>
                        </div>
                        <Typography variant="caption" className="mt-1.5 block text-muted-foreground leading-snug">
                            Add this bot to your Telegram chat, then connect the chat in Step 2.
                        </Typography>
                    </div>
                ) : (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                        <LuCircleAlert className="w-4 h-4 shrink-0 text-destructive mt-0.5" aria-hidden />
                        <Typography variant="caption" className="text-destructive">
                            Bot not configured. Please contact support to complete setup.
                        </Typography>
                    </div>
                )}
            </SimpleCard>

            {/* Step 2: Select Chat */}
            <SimpleCard className="p-4 space-y-4">
                <div className="flex flex-col gap-3 min-w-0">
                    <Typography variant="bodySmall" className="font-semibold text-foreground shrink-0">
                        2. Connect a Chat
                    </Typography>
                    <div className="flex flex-wrap gap-2 min-w-0">
                        <Button
                            onClick={() => {
                                setShowVerificationFlow(true);
                                actions.generateVerificationCode();
                            }}
                            disabled={loading.verification}
                            className="gap-1.5 shrink-0"
                        >
                            {loading.verification ? (
                                <LuLoader className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <LuPlus className="w-3.5 h-3.5" />
                            )}
                            Add New Chat
                        </Button>
                        <Button
                            onClick={actions.loadConnections}
                            disabled={loading.connections}
                            className="gap-1.5 p-2 aspect-square border border-white/20 bg-transparent hover:bg-white/10 shrink-0"
                            title="Refresh connections"
                        >
                            {loading.connections ? (
                                <LuLoader className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <LuRefreshCw className="w-3.5 h-3.5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Verification Flow UI */}
                {showVerificationFlow && verificationCode && (
                    <div className="space-y-4 rounded-xl border border-white/10 bg-card/50 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5 min-w-0">
                                <Typography variant="bodySmall" className="font-semibold text-foreground">
                                    Verify your chat
                                </Typography>
                                <Typography variant="caption" className="text-muted-foreground block">
                                    Send the code below in your Telegram chat
                                </Typography>
                            </div>
                            <Button
                                onClick={() => {
                                    setShowVerificationFlow(false);
                                    actions.cancelVerificationCode();
                                }}
                                className="p-1.5 h-auto min-h-0 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
                                aria-label="Close verification"
                            >
                                <LuX className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Verification Code Display */}
                        <div className="rounded-lg border-l-2 border-amber-500/50 bg-white/5 pl-3 pr-2 py-3 flex items-center justify-between gap-3 min-w-0">
                            <span className="font-mono text-sm tracking-wide select-all text-foreground truncate min-w-0">
                                {verificationCode.code}
                            </span>
                            <Button
                                onClick={() => copyToClipboard(verificationCode.code)}
                                className="shrink-0 p-2 h-auto min-h-0 rounded-md bg-white/10 hover:bg-white/15 text-muted-foreground hover:text-foreground"
                                title={copied ? "Copied!" : "Copy code"}
                            >
                                {copied ? (
                                    <LuCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                    <LuCopy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <LuClock className="w-3.5 h-3.5 shrink-0" />
                            Expires in {verificationCode.remainingMinutes} minutes
                        </p>

                        {/* Steps — same left-accent block as Step 1 */}
                        <div className="rounded-lg border-l-2 border-amber-500/50 bg-white/5 pl-3 py-2.5 pr-3">
                            <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
                                {verificationCode.instructions.map((instruction, index) => (
                                    <li key={index} className="leading-snug">
                                        {instruction.replace(/^\d+\.\s*/, "")}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <Button
                            onClick={() => actions.checkVerificationStatus()}
                            disabled={loading.verification}
                            className="w-full gap-2"
                        >
                            {loading.verification ? (
                                <LuLoader className="w-4 h-4 animate-spin" />
                            ) : (
                                <LuCircleCheck className="w-4 h-4" />
                            )}
                            Check verification
                        </Button>

                        {verificationStatus?.status === "verified" && (
                            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 py-2.5 px-3 text-sm text-green-700 dark:text-green-400">
                                <LuCircleCheck className="w-4 h-4 shrink-0" />
                                <span className="font-medium">Chat &quot;{verificationStatus.chat?.title}&quot; verified</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Saved connections */}
                {connections.length > 0 && (
                    <div className="space-y-2">
                        <Typography variant="caption" className="text-muted-foreground font-medium">
                            Connected chats
                        </Typography>
                        <ul className="space-y-1.5" role="list">
                            {connections.map((conn: TelegramConnection) => (
                                <li key={conn.id}>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                actions.selectConnection(conn);
                                            }
                                        }}
                                        className={`flex items-center justify-between gap-2 p-3 rounded-lg border cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${selectedConnection?.id === conn.id
                                            ? "border-amber-500/40 bg-amber-500/10"
                                            : "border-white/15 bg-black/20 hover:bg-white/10 hover:border-white/25"
                                            }`}
                                        onClick={() => actions.selectConnection(conn)}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <LuBot className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="text-sm font-medium text-foreground truncate">
                                                {conn.chatTitle}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                actions.deleteConnection(conn.id);
                                            }}
                                            className="p-1.5 h-auto min-h-0 shrink-0 bg-transparent text-muted-foreground hover:text-destructive hover:bg-white/10"
                                            aria-label={`Remove ${conn.chatTitle}`}
                                        >
                                            <LuTrash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Empty state */}
                {connections.length === 0 && !showVerificationFlow && (
                    <div className="text-center py-6 px-4 rounded-xl border border-dashed border-white/15 bg-white/5">
                        <LuMessageSquare className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" aria-hidden />
                        <Typography variant="bodySmall" align="center" className="font-medium text-foreground">
                            No chats connected yet
                        </Typography>
                    </div>
                )}
            </SimpleCard>

            {/* Step 3: Message Template */}
            {selectedConnection && (
                <SimpleCard className="p-4 space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
                        <Typography variant="bodySmall" className="font-semibold text-foreground">
                            3. Message Template
                        </Typography>
                        <Button
                            onClick={openMessageViewer}
                            className="gap-1.5 shrink-0"
                        >
                            <LuMessageSquare className="w-3.5 h-3.5" />
                            View Messages
                        </Button>
                    </div>

                    <div className="rounded-lg border-l-2 border-amber-500/50 bg-white/5 pl-3 py-2 pr-3 flex items-center gap-2 min-w-0">
                        <Typography variant="caption" className="text-muted-foreground shrink-0">Sending to:</Typography>
                        <span className="font-medium text-foreground truncate">{selectedConnection.chatTitle}</span>
                    </div>

                    <div className="space-y-2">
                        <Typography variant="caption" className="font-medium text-muted-foreground block">Insert fields</Typography>
                        <TemplateFieldSelector
                            currentNodeId={(nodeData.id as string) || ""}
                            onInsertField={(placeholder) => {
                                actions.updateMessage(telegramMessage + placeholder);
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Typography variant="caption" className="font-medium text-muted-foreground block">Message</Typography>
                        <textarea
                            value={telegramMessage}
                            onChange={(e) => actions.updateMessage(e.target.value)}
                            placeholder="Type your message. Use the field selector above to insert dynamic values."
                            className="w-full px-3 py-2.5 text-sm border border-white/10 rounded-lg bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 resize-none transition-colors"
                            rows={4}
                        />
                    </div>

                    <Button
                        onClick={actions.sendPreviewMessage}
                        disabled={!telegramMessage.trim() || loading.sending}
                        className="w-full gap-2"
                    >
                        {loading.sending ? (
                            <LuLoader className="w-4 h-4 animate-spin" />
                        ) : (
                            <LuSend className="w-4 h-4" />
                        )}
                        Send Preview
                    </Button>
                </SimpleCard>
            )}

            {/* Message Viewer Popup */}
            {showMessages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-[#121212] border border-white/20 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <LuMessageSquare className="w-5 h-5 text-amber-500 shrink-0" />
                                <Typography variant="bodySmall" className="font-semibold text-foreground">
                                    Incoming Messages
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={loadMessages}
                                    disabled={loadingMessages}
                                    className="p-1 h-auto"
                                >
                                    {loadingMessages ? (
                                        <LuLoader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LuRefreshCw className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    onClick={() => setShowMessages(false)}
                                    className="p-1 h-auto"
                                >
                                    <LuX className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center py-8">
                                    <LuLoader className="w-6 h-6 animate-spin text-amber-500" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <LuMessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <Typography variant="caption">
                                        No messages received yet.
                                    </Typography>
                                    <Typography variant="caption" className="block mt-1">
                                        Messages appear here when sent to the connected chat.
                                    </Typography>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.updateId}
                                        className="p-3 rounded-lg bg-black/20 border border-white/15"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <Typography variant="caption" className="font-medium text-amber-500">
                                                {msg.from?.firstName || "Unknown"}
                                                {msg.from?.username && (
                                                    <span className="text-muted-foreground ml-1">
                                                        @{msg.from.username}
                                                    </span>
                                                )}
                                            </Typography>
                                            <Typography variant="caption" className="text-muted-foreground">
                                                {new Date(msg.date * 1000).toLocaleTimeString()}
                                            </Typography>
                                        </div>
                                        <Typography variant="bodySmall" className="text-foreground">
                                            {msg.text || "[No text]"}
                                        </Typography>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/10 bg-white/5">
                            <Typography variant="caption" className="text-muted-foreground text-center block">
                                {messages.length} message{messages.length !== 1 ? "s" : ""} • From webhook
                            </Typography>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function TelegramNodeConfiguration(props: TelegramNodeConfigurationProps) {
    return (
        <ErrorBoundary
            fallback={(error, reset) => (
                <SimpleCard className="p-4 space-y-3">
                    <Typography variant="bodySmall" className="font-semibold text-foreground">
                        Telegram Configuration Error
                    </Typography>
                    <Typography variant="caption" className="text-destructive">
                        {error.message}
                    </Typography>
                    <Button type="button" onClick={reset} className="w-full">
                        Try Again
                    </Button>
                </SimpleCard>
            )}
        >
            <TelegramNodeConfigurationInner {...props} />
        </ErrorBoundary>
    );
}
