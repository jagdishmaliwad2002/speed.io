import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  active?: boolean;
}

export function StatCard({ label, value, unit, icon: Icon, active }: StatCardProps) {
  return (
    <div className={`
      relative overflow-hidden rounded-3xl p-8 transition-all duration-500 glass-panel
      ${active 
        ? 'ring-2 ring-primary/40 shadow-[0_0_50px_-12px_hsla(var(--primary),0.3)] scale-105 z-10' 
        : 'hover:scale-[1.02] opacity-80 hover:opacity-100'
      }
    `}>
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</span>
        <div className={`p-3 rounded-2xl transition-colors duration-500 ${active ? 'bg-primary text-background shadow-[0_0_20px_hsla(var(--primary),0.5)]' : 'bg-white/5 text-white/40'}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 relative z-10">
        <span className={`text-4xl font-black font-display tracking-tighter transition-colors duration-500 ${active ? 'text-white' : 'text-white/80'}`}>
          {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value}
        </span>
        {unit && <span className="text-xs text-white/30 font-black uppercase tracking-widest italic">{unit}</span>}
      </div>

      {/* Background Icon Watermark */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.03] text-white pointer-events-none">
        <Icon size={120} strokeWidth={1} />
      </div>
    </div>
  );
}
