"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LuClock,
    LuChevronDown,
    LuChevronRight,
    LuExternalLink,
    LuTrendingUp,
    LuArrowLeftRight,
    LuActivity,
    LuDroplets,
    LuLayers,
    LuDollarSign,
    LuGamepad2,
    LuVote,
    LuShield,
} from "react-icons/lu";
import {
    comingSoonCategories,
    type ComingSoonCategoryDefinition,
} from "@/blocks/coming-soon/coming-soon";
import { iconRegistry } from "@/blocks/registry";

// Theme color - single color for all categories
const themeColor = {
    categoryGradient: "from-amber-500/20 to-orange-500/10",
    categoryBorder: "border-amber-500/30 hover:border-amber-400/50",
    blockBorder: "border-amber-500/30",
    blockHoverBorder: "hover:border-amber-400/50",
    link: "text-amber-400/70 hover:text-amber-400",
};

interface ComingSoonBlockCardProps {
    block: {
        id: string;
        label: string;
        iconName: string;
        protocolUrl?: string;
    };
}

function ComingSoonBlockCard({ block }: ComingSoonBlockCardProps) {
    const IconComponent = block.iconName ? iconRegistry[block.iconName] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group flex items-center gap-3 p-3 bg-white/5 border ${themeColor.blockBorder} hover:bg-white/10 ${themeColor.blockHoverBorder} rounded-xl transition-all duration-300`}
        >
            {/* Protocol Icon */}
            <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg transition-colors">
                {IconComponent && (
                    <IconComponent className="w-6 h-6" />
                )}
            </div>

            {/* Protocol Name */}
            <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white/90 transition-colors">
                    {block.label}
                </span>
            </div>

            {/* External Link */}
            {block.protocolUrl && (
                <a
                    href={block.protocolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <LuExternalLink className={`w-3 h-3 ${themeColor.link}`} />
                </a>
            )}
        </motion.div>
    );
}

interface ComingSoonCategoryCardProps {
    category: ComingSoonCategoryDefinition;
    isExpanded: boolean;
    onToggle: () => void;
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoryIconMap: Record<string, any> = {
    TrendingUp: LuTrendingUp,
    ArrowLeftRight: LuArrowLeftRight,
    LineChart: LuActivity,
    Droplets: LuDroplets,
    Layers: LuLayers,
    DollarSign: LuDollarSign,
    Gamepad2: LuGamepad2,
    Vote: LuVote,
    BarChart3: LuActivity,
    Shield: LuShield,
};

function ComingSoonCategoryCard({
    category,
    isExpanded,
    onToggle,
}: ComingSoonCategoryCardProps) {
    const CategoryIcon = category.iconName ? categoryIconMap[category.iconName] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden"
        >
            {/* Category Header */}
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-between gap-3 p-3 bg-linear-to-r ${themeColor.categoryGradient} ${themeColor.categoryBorder} border rounded-xl transition-all duration-300`}
            >
                <div className="flex items-center gap-3">
                    {/* Category Icon */}
                    <div className="shrink-0 text-white/60">
                        {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
                    </div>
                    {/* Category Name */}
                    <span className="text-sm font-semibold text-white/90">
                        {category.label}
                    </span>
                </div>

                {/* Expand Icon */}
                <div className="shrink-0 text-white/40">
                    {isExpanded ? (
                        <LuChevronDown className="w-4 h-4" />
                    ) : (
                        <LuChevronRight className="w-4 h-4" />
                    )}
                </div>
            </button>

            {/* Expanded Blocks */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-2 pl-2"
                    >
                        {category.blocks.map((block) => (
                            <ComingSoonBlockCard key={block.id} block={block} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function ComingSoonSection() {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set()
    );
    const [showAll, setShowAll] = useState(false);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const displayedCategories = showAll
        ? comingSoonCategories
        : comingSoonCategories.slice(0, 4);

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <LuClock className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-sm font-semibold text-white/90">
                        Coming Soon
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-white/50 px-1 leading-relaxed">
                Discover upcoming integrations and powerful automation capabilities arriving soon.
            </p>

            {/* Categories List */}
            <div className="space-y-3">
                {displayedCategories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <ComingSoonCategoryCard
                            category={category}
                            isExpanded={expandedCategories.has(category.id)}
                            onToggle={() => toggleCategory(category.id)}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Show More/Less Button */}
            {comingSoonCategories.length > 4 && (
                <motion.button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full py-2.5 px-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all duration-300"
                >
                    {showAll ? (
                        <>
                            Show Less
                            <LuChevronDown className="w-4 h-4 rotate-180" />
                        </>
                    ) : (
                        <>
                            Show More
                            <LuChevronDown className="w-4 h-4" />
                        </>
                    )}
                </motion.button>
            )}
        </div>
    );
}
