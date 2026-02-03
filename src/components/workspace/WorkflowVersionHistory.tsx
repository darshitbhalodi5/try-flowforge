"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { LuHistory, LuChevronDown, LuRotateCcw, LuClock, LuLoaderCircle } from "react-icons/lu";
import { formatDistanceToNow } from "date-fns";
import { usePrivy } from "@privy-io/react-auth";
import { useWorkflow } from "@/context/WorkflowContext";
import {
    getWorkflowVersions,
    restoreWorkflowVersion,
    WorkflowVersionSummary,
} from "@/utils/workflow-api";

interface WorkflowVersionHistoryProps {
    className?: string;
}

export function WorkflowVersionHistory({ className = "" }: WorkflowVersionHistoryProps) {
    const { currentWorkflowId, workflowVersion, loadWorkflow, isPublic } = useWorkflow();
    const { getAccessToken } = usePrivy();

    const [isOpen, setIsOpen] = useState(false);
    const [versions, setVersions] = useState<WorkflowVersionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchVersions = useCallback(async () => {
        if (!currentWorkflowId) return;

        setIsLoading(true);
        try {
            const accessToken = await getAccessToken();
            if (!accessToken) return;

            const result = await getWorkflowVersions({
                workflowId: currentWorkflowId,
                accessToken,
            });

            if (result.success && result.versions) {
                setVersions(result.versions);
            }
        } catch (error) {
            // console.error("Error fetching versions:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentWorkflowId, getAccessToken]);

    const handleToggle = async () => {
        if (!isOpen) {
            setIsOpen(true);
            await fetchVersions();
        } else {
            setIsOpen(false);
        }
    };

    const handleRestore = async (versionNumber: number) => {
        if (!currentWorkflowId || isRestoring !== null) return;

        // Block rollback for public workflows
        if (isPublic) {
            // alert("Cannot rollback public workflows. Unpublish the workflow first to restore previous versions.");
            return;
        }

        const confirmed = window.confirm(
            `Roll back to version ${versionNumber}? This will restore the workflow to v.${versionNumber} and remove any newer versions.`
        );

        if (!confirmed) return;

        setIsRestoring(versionNumber);
        try {
            const accessToken = await getAccessToken();
            if (!accessToken) return;

            const result = await restoreWorkflowVersion({
                workflowId: currentWorkflowId,
                versionNumber,
                accessToken,
            });

            if (result.success) {
                // Reload the workflow to get the restored version
                await loadWorkflow(currentWorkflowId);
                setIsOpen(false);
                // alert(`Successfully rolled back to version ${versionNumber}`);
            } else {
                // alert(`Failed to restore: ${result.error?.message || "Unknown error"}`);
            }
        } catch (error) {
            // console.error("Error restoring version:", error);
            // alert(`Error restoring version: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsRestoring(null);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return "Unknown";
        }
    };

    // Don't show for new workflows
    if (!currentWorkflowId) {
        return null;
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Toggle Button */}
            <button
                onClick={handleToggle}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-200 ${isOpen
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    : "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:border-blue-500/50"
                    }`}
                title="View version history"
            >
                <LuHistory className="w-3 h-3" />
                <span>v.{workflowVersion}</span>
                <LuChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-zinc-900/95 border border-zinc-700 rounded-xl shadow-xl z-50 backdrop-blur-md overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <LuHistory className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">Version History</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                            Current: v.{workflowVersion}
                        </p>
                    </div>

                    {/* Version List */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LuLoaderCircle className="w-5 h-5 animate-spin text-zinc-400" />
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <LuClock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-400">No previous versions</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Versions are created each time you save
                                </p>
                            </div>
                        ) : (
                            <ul className="py-2">
                                {versions.map((version) => (
                                    <li
                                        key={version.id}
                                        className="px-4 py-2.5 hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white">
                                                        v.{version.version_number}
                                                    </span>
                                                    {version.version_number === workflowVersion && (
                                                        <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-400 mt-0.5">
                                                    {formatDate(version.created_at)}
                                                </p>
                                            </div>

                                            {version.version_number !== workflowVersion && (
                                                <button
                                                    onClick={() => handleRestore(version.version_number)}
                                                    disabled={isRestoring !== null || isPublic}
                                                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${isPublic
                                                        ? "text-zinc-600 cursor-not-allowed"
                                                        : "text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
                                                        }`}
                                                    title={isPublic ? "Unpublish to restore versions" : `Restore to version ${version.version_number}`}
                                                >
                                                    {isRestoring === version.version_number ? (
                                                        <LuLoaderCircle className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <LuRotateCcw className="w-3 h-3" />
                                                    )}
                                                    <span>Restore</span>
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {versions.length > 0 && (
                        <div className="px-4 py-2 border-t border-zinc-700/50 bg-zinc-800/30">
                            <p className="text-[10px] text-zinc-500">
                                {isPublic
                                    ? "Rollback disabled while workflow is public"
                                    : "Rolling back removes newer versions permanently"
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
