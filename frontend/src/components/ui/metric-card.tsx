import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Skeleton } from './skeleton';

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  loading?: boolean;
  className?: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  loading,
  className,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        className={cn(
          'group relative overflow-hidden border-border bg-card transition-all duration-base hover:border-primary/30 hover:shadow-md dark:hover:shadow-glow',
          className
        )}
      >
        <div className="absolute inset-0 bg-primary opacity-0 transition-opacity duration-base group-hover:opacity-[0.02] dark:group-hover:opacity-[0.04]" />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground/80">{description}</p>
              )}
              <div className="mt-3">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <motion.p
                    key={value}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-3xl font-bold tracking-tight text-foreground"
                  >
                    {value}
                  </motion.p>
                )}
              </div>
              {trend && !loading && (
                <p
                  className={cn(
                    'mt-1 text-xs font-medium',
                    trend.positive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.value}
                </p>
              )}
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
