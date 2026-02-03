"use client";

import React, { useRef, useState } from "react";
import type { BlockDefinition } from "@/blocks/types";
import { useBlock } from "@/blocks/context";
import { SimpleCard } from "@/components/ui/SimpleCard";

interface DraggableBlockProps {
  block: BlockDefinition;
  onDragStart?: (block: BlockDefinition, event: React.DragEvent) => void;
  onClick?: (block: BlockDefinition) => void;
  disabled?: boolean;
}

export const DraggableBlock = React.memo(function DraggableBlock({
  block,
  onDragStart,
  onClick,
  disabled = false,
}: DraggableBlockProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { iconRegistry } = useBlock();
  const IconComponent = block.iconName ? iconRegistry[block.iconName] : null;

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);

    // Set drag data
    e.dataTransfer.setData("application/reactflow", JSON.stringify(block));
    e.dataTransfer.effectAllowed = "move";

    // Visual feedback
    if (dragRef.current) {
      dragRef.current.style.opacity = "0.5";
    }

    // Call custom handler if provided
    if (onDragStart) {
      onDragStart(block, e);
    }
  };

  const handleDragEnd = () => {
    // Reset visual feedback
    if (dragRef.current) {
      dragRef.current.style.opacity = "1";
    }
    // Reset dragging state after a small delay
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleClick = () => {
    // Don't trigger click if user was dragging or block is disabled
    if (isDragging || disabled) {
      return;
    }

    // Call click handler (for mobile tap-to-add)
    if (onClick) {
      onClick(block);
    }
  };

  return (
    <SimpleCard
      ref={dragRef}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`relative group w-full aspect-square flex flex-col items-center justify-center gap-1.5 select-none touch-manipulation ${disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-grab active:cursor-grabbing "
        }`}
    >
      {/* Icon */}
      <div
        className={`flex items-center justify-center transition-colors ${disabled
          ? "text-white/30"
          : "text-white/70 group-hover:text-white"
          }`}
      >
        {IconComponent && (
          <IconComponent className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
        )}
      </div>

      {/* Block Label */}
      <span
        className={`text-[10px] md:text-xs font-medium text-center leading-tight px-1 transition-colors ${disabled
          ? "text-white/20"
          : "text-white/60 group-hover:text-white/80"
          }`}
      >
        {block.label}
      </span>

      {/* Disabled indicator */}
      {disabled && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white/20" />
      )}
    </SimpleCard>
  );
});
