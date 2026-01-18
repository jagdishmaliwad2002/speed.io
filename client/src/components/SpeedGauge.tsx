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
  // Normalize value to 0-1 range for stroke calc
  const percentage = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 120; // Radius 120
  const strokeDashoffset = circumference - (percentage * (circumference / 2)); // Only show half circle

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[300px] aspect-[2/1] overflow-hidden">
      {/* SVG Gauge */}
      <svg 
        viewBox="0 0 300 160" 
        className="w-full h-full overflow-visible"
      >
        {/* Background Arc */}
        <path
          d="M 30 150 A 120 120 0 0 1 270 150"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Value Arc */}
        <motion.path
          d="M 30 150 A 120 120 0 0 1 270 150"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference} // Initial hidden
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ 
            filter: isActive ? `drop-shadow(0 0 10px ${color})` : "none" 
          }}
        />
        
        {/* Ticks/Decorations */}
        <text x="30" y="175" className="fill-muted-foreground text-xs font-mono">0</text>
        <text x="270" y="175" className="fill-muted-foreground text-xs font-mono text-end">{max}+</text>
      </svg>

      {/* Central Display */}
      <div className="absolute bottom-0 flex flex-col items-center translate-y-2">
        <div className="flex items-baseline gap-2">
          <motion.span 
            className="text-6xl font-display font-bold tracking-tighter"
            initial={{ opacity: 0.5 }}
            animate={{ 
              opacity: isActive ? 1 : 0.7,
              scale: isActive ? 1.05 : 1
            }}
            style={{ color: isActive ? color : 'hsl(var(--foreground))' }}
          >
            {value.toFixed(1)}
          </motion.span>
          <span className="text-xl font-medium text-muted-foreground">Mbps</span>
        </div>
        <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}
