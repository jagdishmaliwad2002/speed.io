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
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Activity size={20} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">SpeedCheck<span className="text-primary">.io</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${status === 'idle' || status === 'complete' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
              {status === 'idle' ? 'Ready' : status === 'complete' ? 'Completed' : 'Testing...'}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        
        {/* Hero Section - The Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center min-h-[500px]">
          
          {/* Left Column - Stats */}
          <div className="space-y-4 order-2 lg:order-1">
            <StatCard 
              label="Ping" 
              value={stats.ping} 
              unit="ms" 
              icon={Wifi} 
              active={status === 'pinging'} 
            />
            <StatCard 
              label="Jitter" 
              value={stats.jitter} 
              unit="ms" 
              icon={Activity} 
              active={status === 'pinging'}
            />
          </div>

          {/* Center Column - Main Interaction */}
          <div className="flex flex-col items-center justify-center space-y-10 order-1 lg:order-2">
            <div className="relative w-full max-w-md">
              {/* Background Glow Effect */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] transition-all duration-1000"
                style={{ 
                  backgroundColor: status === 'uploading' ? 'hsl(var(--secondary)/0.2)' : 'hsl(var(--primary)/0.2)',
                  opacity: status === 'idle' ? 0.2 : 0.6
                }}
              />
              
              <SpeedGauge 
                value={mainGaugeValue} 
                max={100} 
                label={mainGaugeLabel}
                color={mainGaugeColor}
                isActive={status !== 'idle'}
              />
            </div>

            {/* Start Button */}
            <div className="relative z-10">
              {status === 'idle' || status === 'complete' || status === 'error' ? (
                <button
                  onClick={startTest}
                  className="group relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-background border-4 border-primary/20 hover:border-primary text-primary hover:text-background hover:bg-primary transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
                >
                  <span className="font-display font-bold text-2xl tracking-wider">GO</span>
                  <div className="absolute inset-0 rounded-full ring-2 ring-white/10 group-hover:ring-primary/50 scale-110 transition-all duration-500 animate-pulse" />
                </button>
              ) : (
                <button
                  onClick={cancelTest}
                  className="group relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-background border-2 border-destructive/20 hover:border-destructive text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <Square fill="currentColor" size={20} />
                </button>
              )}
            </div>

            {/* Progress Bar (during test) */}
            <div className="w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Right Column - Secondary Stats */}
          <div className="space-y-4 order-3">
            <StatCard 
              label="Download" 
              value={stats.download} 
              unit="Mbps" 
              icon={ArrowDown} 
              active={showDownload}
            />
            <StatCard 
              label="Upload" 
              value={stats.upload} 
              unit="Mbps" 
              icon={ArrowUp} 
              active={showUpload}
            />
          </div>
        </div>

        {/* History Section */}
        <section className="space-y-6 pt-12 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-semibold">Result History</h2>
            <div className="px-4 py-2 rounded-lg bg-card border border-white/5 text-sm text-muted-foreground">
              Last 30 Days
            </div>
          </div>
          <HistoryTable />
        </section>
      </main>
    </div>
  );
}
