import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  trend = 'neutral',
  className 
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 10000000) {
        return `₹${(val / 10000000).toFixed(1)}Cr`;
      } else if (val >= 100000) {
        return `₹${(val / 100000).toFixed(1)}L`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn("p-6 bg-gradient-card border-card-border", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-card-foreground">{formatValue(value)}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground ml-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}