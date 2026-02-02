import { useMemo } from "react";
import { useWindowSize } from "./useWindowSize";
import { LAYOUT_CONSTANTS } from "@/constants/layout";
import type { Node } from "reactflow";

export interface CanvasDimensions {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  categoryWidth: number;
  blocksWidth: number;
  configWidth: number;
  navbarHeight: number;
  /**
   * Calculate actual canvas dimensions excluding sidebars
   */
  getCanvasBounds: (selectedNode: Node | null) => {
    left: number;
    width: number;
    top: number;
    height: number;
  };
}

/**
 * Custom hook for responsive canvas dimensions
 * Provides reactive dimensions based on window size and layout configuration in runtime
 */
export function useCanvasDimensions(): CanvasDimensions {
  const { width, height } = useWindowSize();

  return useMemo(() => {
    const isMobile = width < LAYOUT_CONSTANTS.BREAKPOINTS.MOBILE;
    const isTablet =
      width >= LAYOUT_CONSTANTS.BREAKPOINTS.MOBILE &&
      width < LAYOUT_CONSTANTS.BREAKPOINTS.DESKTOP;
    const isDesktop = width >= LAYOUT_CONSTANTS.BREAKPOINTS.DESKTOP;

    // Calculate sidebar widths based on breakpoints
    const categoryWidth =
      width >= LAYOUT_CONSTANTS.BREAKPOINTS.DESKTOP
        ? LAYOUT_CONSTANTS.SIDEBAR_WIDTHS.CATEGORY.DESKTOP
        : LAYOUT_CONSTANTS.SIDEBAR_WIDTHS.CATEGORY.TABLET;

    const blocksWidth =
      width >= LAYOUT_CONSTANTS.BREAKPOINTS.DESKTOP
        ? LAYOUT_CONSTANTS.SIDEBAR_WIDTHS.BLOCKS.DESKTOP
        : width >= LAYOUT_CONSTANTS.BREAKPOINTS.TABLET
          ? LAYOUT_CONSTANTS.SIDEBAR_WIDTHS.BLOCKS.LAPTOP
          : LAYOUT_CONSTANTS.SIDEBAR_WIDTHS.BLOCKS.MOBILE;

    const configWidth =
      width >= LAYOUT_CONSTANTS.BREAKPOINTS.DESKTOP
        ? LAYOUT_CONSTANTS.SIDEBAR_WIDTHS.CONFIG.DESKTOP
        : width >= LAYOUT_CONSTANTS.BREAKPOINTS.TABLET
          ? LAYOUT_CONSTANTS.SIDEBAR_WIDTHS.CONFIG.LAPTOP
          : LAYOUT_CONSTANTS.SIDEBAR_WIDTHS.CONFIG.MOBILE;

    const navbarHeight = LAYOUT_CONSTANTS.NAVBAR_HEIGHT;

    // Function to calculate canvas bounds
    const getCanvasBounds = (selectedNode: Node | null) => {
      let canvasLeft = 0;
      let canvasWidth = width;
      const canvasTop = navbarHeight;
      const canvasHeight = height - navbarHeight;

      if (!isMobile) {
        // Desktop: account for sidebars
        const configPanelWidth = selectedNode ? configWidth : 0;
        canvasLeft = categoryWidth + blocksWidth;
        canvasWidth = width - categoryWidth - blocksWidth - configPanelWidth;
      }

      return {
        left: canvasLeft,
        width: canvasWidth,
        top: canvasTop,
        height: canvasHeight,
      };
    };

    return {
      isMobile,
      isTablet,
      isDesktop,
      categoryWidth,
      blocksWidth,
      configWidth,
      navbarHeight,
      getCanvasBounds,
    };
  }, [width, height]);
}
