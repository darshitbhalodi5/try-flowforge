/**
 * useWorkflowSearch Hook
 * Custom hook for managing workflow search state with debouncing
 */

import { useState, useEffect, useDeferredValue } from "react";
import { listPublicWorkflows } from "@/utils/workflow-api";
import type { PublicWorkflowSummary } from "@/types/workflow";

export function useWorkflowSearch() {
    const [workflows, setWorkflows] = useState<PublicWorkflowSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Use deferred value for automatic debouncing
    const deferredSearchQuery = useDeferredValue(searchQuery);

    useEffect(() => {
        const fetchWorkflows = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await listPublicWorkflows({
                    q: deferredSearchQuery || undefined,
                    tag: selectedTag || undefined,
                });

                if (result.success) {
                    setWorkflows(result.data || []);
                } else {
                    setError(result.error?.message || "Failed to load public workflows");
                }
            } catch {
                setError("An unexpected error occurred");
                // console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkflows();
    }, [deferredSearchQuery, selectedTag]);

    return {
        workflows,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        // Expose whether search is pending (for loading indicators)
        isPending: searchQuery !== deferredSearchQuery,
    };
}
