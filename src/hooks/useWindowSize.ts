import { useState, useEffect, useCallback } from "react";
import { UI_CONSTANTS } from "@/constants/layout";

export interface WindowSize {
  width: number;
  height: number;
  /** Whether the hook has hydrated with actual window dimensions */
  isHydrated: boolean;
}

/** SSR-safe fallback dimensions */
const SSR_FALLBACK: WindowSize = {
  width: 1024,
  height: 768,
  isHydrated: false,
};

/**
 * Hook to track window dimensions with SSR safety in runtime
 *
 * Features:
 * - SSR-safe: Returns fallback values during server render
 * - Hydration-safe: Only reads window after mount to prevent mismatches
 * - Debounced: Resize events are debounced for performance
 * - Hydration indicator: `isHydrated` flag indicates when real values are available
 */
export function useWindowSize(): WindowSize {
  // Always start with SSR-safe fallback to prevent hydration mismatch
  const [size, setSize] = useState<WindowSize>(SSR_FALLBACK);

  const updateSize = useCallback(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
      isHydrated: true,
    });
  }, []);

  useEffect(() => {
    // Hydrate with actual dimensions on mount
    const rafId = window.requestAnimationFrame(updateSize);

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, UI_CONSTANTS.DEBOUNCE_DELAY);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateSize]);

  return size;
}
