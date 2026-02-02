import { ReactFlowInstance } from "reactflow";
import type { Node } from "reactflow";
import type { CanvasDimensions } from "@/hooks/useCanvasDimensions";

/**
 * Utility to calculate canvas center position
 */
export function calculateCanvasCenter(
  reactFlowInstance: ReactFlowInstance,
  canvasDimensions: CanvasDimensions,
  selectedNode: Node | null
) {
  const bounds = canvasDimensions.getCanvasBounds(selectedNode);

  return reactFlowInstance.screenToFlowPosition({
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
  });
}
