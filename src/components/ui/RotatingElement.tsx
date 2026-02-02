"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export interface RotatingElementProps {
    items: Array<{ Icon?: React.ComponentType<Record<string, unknown>>; text?: string }>;
    startDelay?: number;
    changeInterval?: number;
    className?: string;
}

export function RotatingElement({
    items,
    startDelay = 500,
    changeInterval = 200,
    className = "inline-flex items-center justify-center"
}: RotatingElementProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        const startTimer = setTimeout(() => {
            // Show all items one by one sequentially
            for (let i = 1; i < items.length; i++) {
                const timeout = setTimeout(() => {
                    setCurrentIndex(i);
                }, i * changeInterval);
                timeoutsRef.current.push(timeout);
            }
            // After showing all items, it will stay on the last one (finalized)
        }, startDelay);

        timeoutsRef.current.push(startTimer);

        return () => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
        };
    }, [items.length, startDelay, changeInterval]);

    const currentItem = items[currentIndex];

    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.01, ease: "easeInOut" }}
                className={className}
            >
                {currentItem.Icon ? <currentItem.Icon /> : currentItem.text}
            </motion.span>
        </AnimatePresence>
    );
}
