"use client";

import { useEffect, useCallback, useState } from "react";

interface UseUnsavedChangesOptions {
    /** Whether there are unsaved changes */
    hasUnsavedChanges: boolean;
    /** Message to show in the browser confirmation dialog */
    message?: string;
}

/**
 * useUnsavedChanges - Hook to warn users before leaving with unsaved changes
 * 
 * Features:
 * - Browser beforeunload event handling
 * - Customizable warning message
 * - Cleanup on unmount
 */
export function useUnsavedChanges({
    hasUnsavedChanges,
    message = "You have unsaved changes. Are you sure you want to leave?",
}: UseUnsavedChangesOptions): void {
    // Store message in state to avoid ref access during render
    const [currentMessage] = useState(message);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                // Modern browsers ignore custom messages but still show a default warning
                e.returnValue = currentMessage;
                return currentMessage;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUnsavedChanges, currentMessage]);
}

// ============ useWorkflowHistory ============

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UseWorkflowHistoryReturn<T> {
    /** Current state */
    state: T;
    /** Whether undo is available */
    canUndo: boolean;
    /** Whether redo is available */
    canRedo: boolean;
    /** Push new state to history */
    push: (newState: T) => void;
    /** Undo last change */
    undo: () => void;
    /** Redo last undone change */
    redo: () => void;
    /** Clear history */
    clear: () => void;
    /** History length info */
    historyInfo: {
        pastCount: number;
        futureCount: number;
    };
}

/**
 * useWorkflowHistory - Undo/redo functionality for workflow states
 * 
 * Features:
 * - Configurable max history size
 * - Keyboard shortcut friendly (call methods from key handlers)
 * - Memory efficient with history limits
 */
export function useWorkflowHistory<T>(
    initialState: T,
    maxHistorySize: number = 50
): UseWorkflowHistoryReturn<T> {
    // Use state instead of ref to avoid lint errors about accessing refs during render
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    const push = useCallback(
        (newState: T) => {
            setHistory((prevHistory) => {
                const newPast = [...prevHistory.past, prevHistory.present];

                // Limit history size
                if (newPast.length > maxHistorySize) {
                    newPast.shift();
                }

                return {
                    past: newPast,
                    present: newState,
                    future: [], // Clear redo stack on new change
                };
            });
        },
        [maxHistorySize]
    );

    const undo = useCallback(() => {
        setHistory((prevHistory) => {
            if (prevHistory.past.length === 0) return prevHistory;

            const previous = prevHistory.past[prevHistory.past.length - 1];
            const newPast = prevHistory.past.slice(0, -1);

            return {
                past: newPast,
                present: previous,
                future: [prevHistory.present, ...prevHistory.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((prevHistory) => {
            if (prevHistory.future.length === 0) return prevHistory;

            const next = prevHistory.future[0];
            const newFuture = prevHistory.future.slice(1);

            return {
                past: [...prevHistory.past, prevHistory.present],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const clear = useCallback(() => {
        setHistory((prevHistory) => ({
            past: [],
            present: prevHistory.present,
            future: [],
        }));
    }, []);

    return {
        state: history.present,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        push,
        undo,
        redo,
        clear,
        historyInfo: {
            pastCount: history.past.length,
            futureCount: history.future.length,
        },
    };
}
