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
      relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
      ${active 
        ? 'bg-card border-primary/50 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]' 
        : 'bg-card/50 border-white/5 hover:border-white/10'
      }
    `}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
          <Icon size={18} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold font-display tracking-tight ${active ? 'text-primary text-glow' : 'text-foreground'}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground font-medium">{unit}</span>}
      </div>
    </div>
  );
}
