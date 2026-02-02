"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function HeroBackgroundAnimation() {
  const [coords, setCoords] = useState({ x: 420, y: 180 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords({
        x: 420 + Math.floor(Math.random() * 5),
        y: 180 + Math.floor(Math.random() * 5),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 overflow-hidden text-zinc-500 font-mono text-[10px] select-none pointer-events-none">

      {/* 1. Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"
        />
      </div>

      {/* 2. Enhanced Workspace Grid */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3f3f46 1px, transparent 1px),
            linear-gradient(to bottom, #3f3f46 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 6. Studio UI */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="h-12 border-b border-white/5 bg-zinc-950/20 backdrop-blur-md flex items-center justify-between px-4 z-20"
        >
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              ))}
            </div>
            <div className="h-4 w-px bg-zinc-800 mx-2" />
            <span className="text-zinc-400 opacity-40">Public_Workflow</span>
            <div className="h-4 w-px bg-zinc-800 mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-900/50 border border-white/5 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <span className="text-[8px]">↶</span>
              </div>
              <div className="w-6 h-6 rounded bg-zinc-900/50 border border-white/5 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                <span className="text-[8px]">↷</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-zinc-600 text-[9px]">
              <span className="opacity-50">Nodes: <span className="text-zinc-500">12</span></span>
              <span className="opacity-50">Connections: <span className="text-zinc-500">8</span></span>
            </div>
            <div className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-zinc-500 text-[9px] min-w-12 text-center">
              100%
            </div>
          </div>
        </motion.div>

        {/* Main Workspace Area (Rulers) */}
        <div className="flex-1 relative">
          <div className="absolute top-0 left-0 right-0 h-5 border-b border-white/5 flex items-end pb-1 px-1 gap-10 opacity-30">
            {[...Array(20)].map((_, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                {i * 100}
              </motion.span>
            ))}
          </div>
          <div className="absolute top-0 left-0 bottom-0 w-5 border-r border-white/5 flex flex-col pt-6 items-center gap-10 opacity-30">
            {[...Array(10)].map((_, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} style={{ writingMode: 'vertical-rl' }}>
                {i * 100}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="h-8 border-t border-white/5 bg-zinc-950/40 backdrop-blur-md flex items-center justify-between px-4 text-[9px] text-zinc-600 z-20"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="italic text-[13px] text-zinc-500">
                &lt;&gt;
              </motion.span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />

            {/* Real-time Oscilloscope/Waveform Simulation */}
            <div className="flex items-end gap-px h-3 w-12 px-1">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 bg-zinc-500/40 rounded-t-[1px]"
                />
              ))}
            </div>

            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2 tabular-nums">
              <span className="opacity-50 uppercase tracking-tighter">Pos:</span>
              <span className="text-zinc-800">{coords.x} / {coords.y}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="text-zinc-500">●</motion.span>
              <span className="text-zinc-500 font-bold uppercase tracking-tighter">System_Valid</span>
            </div>

            <div className="h-4 w-px bg-zinc-500" />
            <div className="flex items-center gap-2 uppercase tracking-tighter opacity-50">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}