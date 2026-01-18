import { useResults } from "@/hooks/use-results";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, Activity } from "lucide-react";

export function HistoryTable() {
  const { data: results, isLoading } = useResults();

  if (isLoading) {
    return <div className="h-48 w-full animate-pulse bg-muted rounded-2xl" />;
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 bg-card/50 rounded-2xl border border-white/5">
        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-foreground">No test history</h3>
        <p className="text-sm text-muted-foreground">Run your first speed test to see results here.</p>
      </div>
    );
  }

  // Sort by date desc
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  return (
    <div className="rounded-2xl border border-white/5 bg-card/30 overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-xs">Date</th>
              <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-xs text-right">Download</th>
              <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-xs text-right">Upload</th>
              <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-xs text-right">Ping</th>
              <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-xs text-right">Jitter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedResults.map((result) => (
              <tr key={result.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-muted-foreground font-mono">
                  {result.createdAt ? format(new Date(result.createdAt), 'MMM d, HH:mm') : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-primary">
                    <span className="font-bold">{result.downloadSpeed.toFixed(1)}</span>
                    <ArrowDown size={14} className="opacity-50" />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-secondary">
                    <span className="font-bold">{result.uploadSpeed.toFixed(1)}</span>
                    <ArrowUp size={14} className="opacity-50" />
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-foreground">
                  {result.ping} <span className="text-muted-foreground text-xs">ms</span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                  {result.jitter} <span className="text-xs">ms</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
