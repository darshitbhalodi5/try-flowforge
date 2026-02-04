"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { LuHistory, LuChevronDown, LuLoader, LuClock } from "react-icons/lu";
import { formatDistanceToNow } from "date-fns";
import {
    getPublicWorkflowVersions,
    WorkflowVersionSummary,
} from "@/utils/workflow-api";

interface PublicVersionSelectorProps {
    workflowId: string;
    currentVersion: number;
    selectedVersion: number;
    onVersionChange: (version: number) => void;
    className?: string;
}

export function PublicVersionSelector({
    workflowId,
    currentVersion,
    selectedVersion,
    onVersionChange,
    className = "",
}: PublicVersionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [versions, setVersions] = useState<WorkflowVersionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        try {
            const result = await getPublicWorkflowVersions({ workflowId });

            if (result.success && result.versions) {
                setVersions(result.versions);
            }
        } catch {
            // console.error("Error fetching versions:", error);
        } finally {
            setIsLoading(false);
        }
    }, [workflowId]);

    const handleToggle = async () => {
        if (!isOpen) {
            setIsOpen(true);
            await fetchVersions();
        } else {
            setIsOpen(false);
        }
    };

    const handleSelectVersion = (version: number) => {
        onVersionChange(version);
        setIsOpen(false);
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return "Unknown";
        }
    };

    // Build list of all versions including current
    const allVersions = [
        { version_number: currentVersion, created_at: new Date().toISOString(), isCurrent: true },
        ...versions.map(v => ({ ...v, isCurrent: false })),
    ];

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Toggle Button */}
            <button
                onClick={handleToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${isOpen
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-500/50"
                    }`}
                title="View other versions"
            >
                <LuHistory className="w-3.5 h-3.5" />
                <span>v.{selectedVersion}</span>
                {selectedVersion !== currentVersion && (
                    <span className="text-xs text-amber-400">(viewing old)</span>
                )}
                <LuChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-zinc-900/95 border border-zinc-700 rounded-xl shadow-xl z-50 backdrop-blur-md overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <LuHistory className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">Available Versions</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                            Viewing: v.{selectedVersion} {selectedVersion === currentVersion && "(latest)"}
                        </p>
                    </div>

                    {/* Version List */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LuLoader className="w-5 h-5 animate-spin text-zinc-400" />
                            </div>
                        ) : allVersions.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <LuClock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-400">No version history</p>
                            </div>
                        ) : (
                            <ul className="py-2">
                                {allVersions.map((version) => (
                                    <li key={version.version_number}>
                                        <button
                                            onClick={() => handleSelectVersion(version.version_number)}
                                            className={`w-full px-4 py-2.5 text-left transition-colors ${selectedVersion === version.version_number
                                                ? "bg-blue-500/20"
                                                : "hover:bg-zinc-800/50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white">
                                                        v.{version.version_number}
                                                    </span>
                                                    {version.isCurrent && (
                                                        <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded">
                                                            Latest
                                                        </span>
                                                    )}
                                                    {selectedVersion === version.version_number && (
                                                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded">
                                                            Viewing
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {!version.isCurrent && (
                                                <p className="text-xs text-zinc-400 mt-0.5">
                                                    {formatDate(version.created_at)}
                                                </p>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-zinc-700/50 bg-zinc-800/30">
                        <p className="text-[10px] text-zinc-500">
                            Clone any version to use in your own workflow
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
