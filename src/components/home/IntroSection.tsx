"use client";

import {
    motion,
    MotionValue,
    useMotionValue,
    useTransform,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Typography } from "../ui/Typography";

interface IntroSectionProps {
    scrollProgress?: MotionValue<number>;
}

// Sub-component for the counting numbers
function AnimatedNumber({
    value,
    isVisible
}: {
    value: string;
    isVisible: boolean;
}) {
    // Extract number from string (e.g., "$1M+" -> 1000000)
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.]/g, "");
    const prefix = value.startsWith("$") ? "$" : "";
    const cleanSuffix = suffix.replace("$", "");

    const [display, setDisplay] = useState(0);
    const hasAnimatedRef = useRef(false);

    useEffect(() => {
        if (isVisible && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;

            // Animate from 0 to target value
            const duration = 2000; // 2 seconds
            const startTime = Date.now();
            const startValue = 0;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out)
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = startValue + (numericValue - startValue) * eased;

                setDisplay(current);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setDisplay(numericValue); // Ensure final value
                }
            };

            requestAnimationFrame(animate);
        }
    }, [isVisible, numericValue]);

    // Format display value
    const formatDisplay = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${Math.round(val / 1000)}K`;
        return Math.round(val).toString();
    };

    return <span>{prefix}{formatDisplay(display)}{cleanSuffix}</span>;
}

export function IntroSection({ scrollProgress }: IntroSectionProps) {
    const defaultProgress = useMotionValue(0.2);
    const progress = scrollProgress || defaultProgress;

    // Header scale
    const headerScale = useTransform(progress, [0.3, 0.5], [2.7, 1]);

    // Description Reveals (using clip-path to reveal from bottom baseline)
    const descriptionDisplay = useTransform(progress, [0.4, 0.41], ["none", "block"]);
    const descriptionClip = useTransform(
        progress,
        [0.4, 0.6],
        ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
    );
    const descriptionY = useTransform(progress, [0.4, 0.5], [40, 0]);

    // Stats Container Reveals
    const statsDisplay = useTransform(progress, [0.4, 0.41], ["none", "grid"]);
    const [statsVisible, setStatsVisible] = useState(false);

    // Track when stats become visible
    useEffect(() => {
        const unsubscribe = statsDisplay.on("change", (latest) => {
            if (latest === "grid") {
                setStatsVisible(true);
            }
        });
        return unsubscribe;
    }, [statsDisplay]);

    const stats = [
        { label: "Protocol Integration", value: "15+" },
        { label: "Workflow Created", value: "1000+" },
        { label: "Volume Automated", value: "$1M+" },
        { label: "Transaction Count", value: "70K+" },
        { label: "Public Workflow Template", value: "400+" },
    ];

    return (
        <div className="h-full w-full flex flex-col gap-8 items-center justify-center bg-[#7A1CAC] overflow-hidden">
            <motion.h1
                className="text-white font-bold tracking-tighter text-[7vw]"
                style={{ scale: headerScale }}
            >
                FlowForge
            </motion.h1>

            <motion.div
                className="max-w-4xl"
                style={{
                    display: descriptionDisplay,
                    clipPath: descriptionClip,
                    y: descriptionY,
                }}
            >
                <Typography
                    variant="body"
                    align="center"
                    className="text-white md:text-base leading-relaxed"
                >
                    <span className="block font-semibold text-white mb-2">Connect everything. Automate anything.</span>
                    Seamlessly bridge the gap between traditional apps and decentralized networks.
                    Create powerful workflows without the complexity, manage operations effortlessly,
                    and unlock the full potential of automation in one unified platform.
                </Typography>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-12 w-max"
                style={{
                    display: statsDisplay,
                }}
            >
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center justify-center gap-2">
                        <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-blue-200 drop-shadow-sm">
                            <AnimatedNumber
                                value={stat.value}
                                isVisible={statsVisible}
                            />
                        </span>
                        <span className="text-xs text-blue-200/70 text-center font-medium uppercase tracking-wider">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}