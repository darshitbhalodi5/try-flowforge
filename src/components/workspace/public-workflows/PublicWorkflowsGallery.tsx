"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LuSearch, LuLayoutGrid, LuList, LuFilter, LuWorkflow, LuSearchX, LuSparkles, LuX } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { WorkflowCardSkeleton } from "@/components/workspace/workflow-dashboard/WorkflowCardSkeleton";
import { PublicWorkflowCard } from "@/components/workspace/public-workflows/PublicWorkflowCard";
import { useWorkflowSearch } from "@/hooks/useWorkflowSearch";
import { extractUniqueTags } from "@/utils/workflow-tags";
import { WORKFLOW_CONSTANTS } from "@/constants/workflow";

const VIEW_MODE_KEY = "public-workflows-view-mode";

type SortOrder = "newest" | "oldest";

export function PublicWorkflowsGallery() {
    const router = useRouter();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
        if (typeof window === "undefined") return "grid";
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        return saved === "grid" || saved === "list" ? saved : "grid";
    });
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

    const {
        workflows,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        isPending,
    } = useWorkflowSearch();

    const allTags = useMemo(() => extractUniqueTags(workflows), [workflows]);

    // Close filter dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
                setFilterDropdownOpen(false);
            }
        };
        if (filterDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [filterDropdownOpen]);

    const handleViewModeChange = useCallback((mode: "grid" | "list") => {
        setViewMode(mode);
        localStorage.setItem(VIEW_MODE_KEY, mode);
    }, []);

    // Keyboard shortcut for search focus (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleView = useCallback(
        (workflowId: string) => {
            router.push(`/public-workflows/${workflowId}`);
        },
        [router],
    );

    // Sort workflows client-side by published_at / updated_at
    const sortedWorkflows = useMemo(() => {
        return [...workflows].sort((a, b) => {
            const dateA = new Date(a.published_at ?? a.updated_at).getTime();
            const dateB = new Date(b.published_at ?? b.updated_at).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });
    }, [workflows, sortOrder]);

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 w-full">
            {/* Header */}
            <div className="pt-32 pb-12">
                <h1 className="text-[5vw] text-center font-bold">
                    Public Automations
                </h1>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 w-full">
                <div className="flex items-center gap-2 w-full flex-wrap">
                    <div className="relative flex items-center justify-start rounded-full border border-white/20 px-4 h-[44px] group hover:border-white/30 transition-all duration-300 flex-1 min-w-[200px] max-w-xl">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search public flows... (Ctrl+K)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-semibold text-white placeholder:text-white/50 w-full pr-10"
                            aria-label="Search workflows"
                        />
                        <Button
                            type="button"
                            className="absolute right-0 p-0! w-[42px]! h-[42px]!"
                            title="Search"
                            aria-label="Search"
                        >
                            {isPending ? (
                                <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <LuSearch className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex p-1 rounded-full border border-white/20 h-[44px]">
                            <button
                                type="button"
                                onClick={() => handleViewModeChange("grid")}
                                className={cn(
                                    "p-2.5 rounded-full transition-all duration-200",
                                    viewMode === "grid"
                                        ? "bg-white/20 text-white"
                                        : "text-white/70 hover:text-white hover:bg-white/10",
                                )}
                                title="Grid view"
                                aria-label="Grid view"
                                aria-pressed={viewMode === "grid"}
                            >
                                <LuLayoutGrid className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewModeChange("list")}
                                className={cn(
                                    "p-2.5 rounded-full transition-all duration-200",
                                    viewMode === "list"
                                        ? "bg-white/20 text-white"
                                        : "text-white/70 hover:text-white hover:bg-white/10",
                                )}
                                title="List view"
                                aria-label="List view"
                                aria-pressed={viewMode === "list"}
                            >
                                <LuList className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="relative h-[44px] shrink-0" ref={filterDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setFilterDropdownOpen((o) => !o)}
                                className={cn(
                                    "h-full aspect-square flex items-center justify-center rounded-full border border-white/20 text-sm font-medium transition-all duration-200",
                                    filterDropdownOpen
                                        ? "bg-white/20 text-white border-white/30"
                                        : "text-white/70 hover:text-white hover:bg-white/10 hover:border-white/25",
                                )}
                                aria-expanded={filterDropdownOpen}
                                aria-haspopup="true"
                                title="Sort"
                            >
                                <LuFilter className="w-4 h-4 shrink-0" />
                            </button>
                            {filterDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 min-w-[220px] rounded-xl border border-white/20 bg-[#121212] shadow-xl z-50 overflow-hidden">
                                    <div className="p-2">
                                        <p className="px-3 py-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">
                                            Sort
                                        </p>
                                        {(
                                            [
                                                { value: "newest" as const, label: "Newest first" },
                                                { value: "oldest" as const, label: "Oldest first" },
                                            ] as const
                                        ).map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setSortOrder(value)}
                                                className={cn(
                                                    "w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors",
                                                    sortOrder === value
                                                        ? "bg-white/15 text-white"
                                                        : "text-white/70 hover:bg-white/10 hover:text-white",
                                                )}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => router.push("/workflows")}
                    className="shrink-0"
                    border
                    borderColor="#ffffff"
                    title="Your Automations"
                    aria-label="Your Automations"
                >
                    Your Automations
                </Button>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setSelectedTag(null)}
                        className={cn(
                            "px-3 py-1.5 h-auto text-sm rounded-full border transition-all duration-200",
                            selectedTag === null
                                ? "bg-white/20 text-white border-white/30"
                                : "border-white/20 text-white/70 hover:text-white hover:bg-white/10",
                        )}
                    >
                        All
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(tag)}
                            className={cn(
                                "px-3 py-1.5 h-auto text-sm rounded-full border transition-all duration-200",
                                selectedTag === tag
                                    ? "bg-white/20 text-white border-white/30"
                                    : "border-white/20 text-white/70 hover:text-white hover:bg-white/10",
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-red-400/90">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div
                    className={cn(
                        viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            : "space-y-3",
                    )}
                >
                    {Array.from({ length: WORKFLOW_CONSTANTS.SKELETON_CARDS_COUNT }).map((_, i) => (
                        <WorkflowCardSkeleton key={i} viewMode={viewMode} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && sortedWorkflows.length === 0 && (
                <div className="min-h-[50vh] flex items-center justify-center px-4 overflow-hidden w-full">
                    <div
                        className={cn(
                            "group relative w-full max-w-md rounded-2xl border border-white/20 bg-white/5 p-8 sm:p-10 overflow-hidden",
                            "shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]",
                            "transition-all duration-300 ease-out",
                            "hover:border-white/30 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_8px_32px_-8px_rgba(0,0,0,0.4)]",
                        )}
                    >
                        <div
                            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-80"
                            style={{
                                background:
                                    "linear-gradient(180deg, rgba(249,115,22,0.95) 0%, rgba(251,146,60,0.7) 50%, rgba(249,115,22,0.25) 100%)",
                                boxShadow: "0 0 12px rgba(249,115,22,0.25)",
                            }}
                        />
                        <div
                            className="absolute right-0 top-0 bottom-0 w-0.5 rounded-r-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-80"
                            style={{
                                background:
                                    "linear-gradient(180deg, rgba(249,115,22,0.95) 0%, rgba(251,146,60,0.7) 50%, rgba(249,115,22,0.25) 100%)",
                                boxShadow: "0 0 12px rgba(249,115,22,0.25)",
                            }}
                        />
                        <div className="relative text-center space-y-7">
                            <div
                                className={cn(
                                    "mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10",
                                    "bg-linear-to-br from-white/6 to-transparent",
                                    "ring-1 ring-white/5 transition-all duration-300",
                                    "shadow-[0_0_24px_-4px_rgba(249,115,22,0.15)]",
                                    !searchQuery &&
                                    !selectedTag &&
                                    "group-hover:shadow-[0_0_32px_-4px_rgba(249,115,22,0.2)] group-hover:border-amber-500/20",
                                )}
                            >
                                {searchQuery || selectedTag ? (
                                    <LuSearchX
                                        className="h-11 w-11 text-white/50"
                                        strokeWidth={1.5}
                                    />
                                ) : (
                                    <LuWorkflow
                                        className="h-11 w-11 text-amber-500/95"
                                        strokeWidth={1.5}
                                    />
                                )}
                            </div>
                            <div className="space-y-2.5">
                                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                                    {searchQuery || selectedTag
                                        ? "No workflows found"
                                        : "No public workflows yet"}
                                </h3>
                                <p className="text-sm text-white/55 max-w-sm mx-auto leading-relaxed">
                                    {searchQuery || selectedTag
                                        ? "No public automations match your search. Try a different term or clear filters."
                                        : "Be the first to share a workflow with the community."}
                                </p>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-4">
                                {searchQuery || selectedTag ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedTag(null);
                                        }}
                                        className={cn(
                                            "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium",
                                            "border border-white/20 bg-white/5 text-white/90",
                                            "hover:bg-white/10 hover:border-white/30 transition-all duration-200",
                                        )}
                                    >
                                        <LuX className="h-4 w-4 shrink-0" />
                                        Clear search & filters
                                    </button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => router.push("/automation-builder")}
                                            className="inline-flex items-center gap-2 shrink-0 px-6"
                                        >
                                            <LuSparkles className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
                                            <span>Create First Public Workflow</span>
                                        </Button>
                                        <p className="flex items-center gap-1.5 text-xs text-white/40 text-center">
                                            <LuSparkles className="h-3.5 w-3.5 shrink-0" />
                                            Publish a workflow to share with the community
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Workflow Grid/List */}
            {!isLoading && sortedWorkflows.length > 0 && (
                <div
                    className={cn(
                        viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            : "space-y-3",
                    )}
                >
                    {sortedWorkflows.map((workflow) => (
                        <PublicWorkflowCard
                            key={workflow.id}
                            workflow={workflow}
                            viewMode={viewMode}
                            onView={() => handleView(workflow.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
