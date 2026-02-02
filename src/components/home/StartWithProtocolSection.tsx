"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function StartWithProtocolSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 50%", "end end"],
    });

    // Word 1: "Start" - appears first (0 to 0.33)
    const startOpacity = useTransform(
        scrollYProgress,
        [0, 0, 0.30, 0.33],
        [0, 1, 1, 0]
    );
    const startScale = useTransform(
        scrollYProgress,
        [0, 0.1, 0.3],
        [20, 1, 1]
    );

    // Word 2: "With" - appears second (0.33 to 0.66)
    const withOpacity = useTransform(
        scrollYProgress,
        [0.33, 0.35, 0.65, 0.66],
        [0, 1, 1, 0]
    );
    const withScale = useTransform(
        scrollYProgress,
        [0.35, 0.53, 0.66],
        [20, 1, 1]
    );

    // Word 3: "PRTOCOLS" - appears third (0.66 to 1.0)
    const protocolOpacity = useTransform(
        scrollYProgress,
        [0.64, 0.68, 0.97, 1.0],
        [0, 1, 1, 0]
    );
    const protocolScale = useTransform(
        scrollYProgress,
        [0.64, 0.86, 0.9, 1.0],
        [20, 1, 1, 1]
    );

    return (
        <section
            ref={containerRef}
            className="relative h-[500vh] z-30"
            style={{ backgroundColor: "#FF6500" }}
        >
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                {/* Word 1: start */}
                <motion.div
                    className="absolute"
                    style={{
                        opacity: startOpacity,
                        scale: startScale,
                    }}
                >
                    <h1 className="text-9xl font-bold text-black uppercase tracking-tight">
                        START
                    </h1>
                </motion.div>

                {/* Word 2: WITH */}
                <motion.div
                    className="absolute"
                    style={{
                        opacity: withOpacity,
                        scale: withScale,
                    }}
                >
                    <div className="relative">
                        <h1 className="text-9xl font-bold text-black uppercase tracking-tight">
                            WITH
                        </h1>
                        {/* Oval outline around MORE */}
                        <svg
                            className="absolute inset-0 w-[150%] h-[130%]"
                            style={{ overflow: "visible" }}
                        >
                            <ellipse
                                cx="33%"
                                cy="40%"
                                rx="55%"
                                ry="45%"
                                fill="none"
                                stroke="black"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </motion.div>

                {/* Word 3: PROTOCOL */}
                <motion.div
                    className="absolute"
                    style={{
                        opacity: protocolOpacity,
                        scale: protocolScale,
                    }}
                >
                    <h1 className="text-9xl font-bold text-black uppercase tracking-tight">
                        PROTOCOLS
                    </h1>
                </motion.div>
            </div>
        </section>
    );
}
