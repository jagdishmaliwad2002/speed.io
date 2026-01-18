import { useState } from 'react';
import { useSpeedTest } from "@/hooks/use-speed-test";
import { SpeedGauge } from "@/components/SpeedGauge";
import { StatCard } from "@/components/StatCard";
import { HistoryTable } from "@/components/HistoryTable";
import { Wifi, ArrowDown, ArrowUp, Activity, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { status, stats, startTest, cancelTest } = useSpeedTest();

  // Determine which gauge to show as "active" based on test phase
  const showDownload = status === 'downloading' || status === 'complete' || (status === 'idle' && stats.download > 0);
  const showUpload = status === 'uploading' || status === 'complete' || (status === 'idle' && stats.upload > 0);
  
  // Dynamic value for the main big gauge
  const mainGaugeValue = status === 'uploading' ? stats.upload : stats.download;
  const mainGaugeLabel = status === 'uploading' ? 'Upload' : 'Download';
  const mainGaugeColor = status === 'uploading' ? 'hsl(var(--secondary))' : 'hsl(var(--primary))';

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary/20">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[70%] h-[70%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background shadow-lg shadow-primary/20">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter italic">SPEED<span className="text-primary not-italic">.io</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-panel flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${status === 'idle' || status === 'complete' ? 'text-green-400 bg-current' : 'text-amber-400 bg-current animate-ping'}`} />
              {status === 'idle' ? 'System Ready' : status === 'complete' ? 'Scan Complete' : 'Analyzing...'}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16 space-y-20 relative z-10">
        
        {/* Hero Section - The Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Left Column - Stats */}
          <div className="space-y-6 order-2 lg:order-1">
            <StatCard 
              label="Latency (Ping)" 
              value={stats.ping} 
              unit="ms" 
              icon={Wifi} 
              active={status === 'pinging'} 
            />
            <StatCard 
              label="Stability (Jitter)" 
              value={stats.jitter} 
              unit="ms" 
              icon={Activity} 
              active={status === 'pinging'}
            />
          </div>

          {/* Center Column - Main Interaction */}
          <div className="flex flex-col items-center justify-center space-y-12 order-1 lg:order-2">
            <div className="relative w-full max-w-lg flex flex-col items-center">
              <SpeedGauge 
                value={mainGaugeValue} 
                max={100} 
                label={mainGaugeLabel}
                color={mainGaugeColor}
                isActive={status !== 'idle'}
              />
              
              {/* Start Button */}
              <div className="mt-[20px] relative z-20">
                {status === 'idle' || status === 'complete' || status === 'error' ? (
                  <button
                    onClick={startTest}
                    className="group relative flex items-center justify-center w-32 h-32 rounded-full bg-black/40 border border-white/20 backdrop-blur-md hover:border-primary/50 transition-all duration-500 hover:scale-110 active:scale-90"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                    <span className="font-display font-black text-3xl tracking-tighter text-white group-hover:text-primary transition-colors">GO</span>
                    
                    {/* Glossy Reflection */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    
                    {/* Ring animation */}
                    <div className="absolute -inset-4 rounded-full border border-primary/20 animate-[ping_3s_infinite]" />
                    <div className="absolute -inset-8 rounded-full border border-secondary/10 animate-[ping_4s_infinite]" />
                  </button>
                ) : (
                  <button
                    onClick={cancelTest}
                    className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border border-destructive/30 backdrop-blur-md hover:bg-destructive hover:text-white transition-all duration-300"
                  >
                    <Square fill="currentColor" size={24} className="group-hover:scale-90 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                <span>Progress</span>
                <span>{Math.round(stats.progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary via-white to-secondary rounded-full shadow-[0_0_10px_hsla(var(--primary),0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ type: "spring", damping: 20 }}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Secondary Stats */}
          <div className="space-y-6 order-3">
            <StatCard 
              label="Download Stream" 
              value={stats.download} 
              unit="Mbps" 
              icon={ArrowDown} 
              active={showDownload}
            />
            <StatCard 
              label="Upload Stream" 
              value={stats.upload} 
              unit="Mbps" 
              icon={ArrowUp} 
              active={showUpload}
            />
          </div>
        </div>

        {/* History Section */}
        <section className="space-y-8 pt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter italic uppercase">Analytics <span className="text-primary not-italic text-2xl">Vault</span></h2>
              <p className="text-white/40 text-sm font-medium">Tracking your network performance over time</p>
            </div>
            <div className="glass-panel px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-white/60">
              Cloud Synchronized
            </div>
          </div>
          
          <div className="glass-panel rounded-3xl overflow-hidden">
            <HistoryTable />
          </div>
        </section>
      </main>
    </div>
  );
}
