import { motion } from "framer-motion";

interface SpeedGaugeProps {
  value: number; // Current value to display
  max?: number; // Max scale of the gauge
  label: string;
  color?: string;
  isActive: boolean;
}

export function SpeedGauge({ 
  value, 
  max = 100, 
  label, 
  color = "hsl(var(--primary))",
  isActive 
}: SpeedGaugeProps) {
  const percentage = Math.min(value / max, 1);
  const radius = 120;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (percentage * circumference);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[400px] aspect-[2/1] overflow-visible">
      {/* Dynamic Glow Effect */}
      <motion.div 
        className="absolute inset-0 blur-[80px] opacity-20 transition-all duration-700"
        animate={{ 
          backgroundColor: color,
          scale: isActive ? [1, 1.1, 1] : 1,
          opacity: isActive ? [0.2, 0.4, 0.2] : 0.1
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <svg 
        viewBox="0 0 300 180" 
        className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track with Glass look */}
        <path
          d="M 30 150 A 120 120 0 0 1 270 150"
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          className="text-white/5"
          strokeLinecap="round"
        />

        {/* Active Progress - Neon Glowing Path */}
        <motion.path
          d="M 30 150 A 120 120 0 0 1 270 150"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", bounce: 0, duration: 1.5 }}
          filter="url(#neonGlow)"
          className="drop-shadow-[0_0_8px_hsla(var(--primary),0.8)]"
        />

        {/* Glossy Needle */}
        <motion.g
          style={{ originX: "150px", originY: "150px" }}
          animate={{ rotate: (percentage * 180) - 90 }}
          transition={{ type: "spring", damping: 12, stiffness: 90 }}
        >
          <line
            x1="150" y1="150"
            x2="150" y2="35"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            className="drop-shadow-[0_0_5px_white]"
          />
          <circle cx="150" cy="150" r="8" fill="white" className="drop-shadow-[0_0_5px_white]" />
          <circle cx="150" cy="150" r="4" fill="hsl(var(--background))" />
        </motion.g>
      </svg>

      <div className="absolute bottom-[-10px] flex flex-col items-center">
        <motion.span 
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-1"
        >
          {label}
        </motion.span>
        <div className="flex items-baseline gap-1">
          <span className="text-7xl font-black tracking-tighter text-glow bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl">
            {value.toFixed(value < 10 ? 1 : 0)}
          </span>
          <span className="text-xl font-bold text-white/30 italic">Mbps</span>
        </div>
      </div>
    </div>
  );
}
