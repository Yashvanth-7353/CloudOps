Reusable loading skeletons for CloudOps

Components:
- `Skeleton` - base shimmer primitive
- `RepositoryCardSkeleton` - repository card loading state
- `AnalyticsChartSkeleton` - chart placeholder for analytics dashboards
- `DeploymentLogsSkeleton` - terminal-style deployment loading state
- `NavbarLoadingState` - top navigation loading state
- `DashboardStatsLoadingState` - stats card loading state

Usage:
```
import { RepositoryCardSkeleton } from '@/components/skeletons';
```

Notes:
- Built for dark mode and glassmorphism surfaces.
- Uses a shimmer animation via Tailwind arbitrary animation utilities.
- Designed to be swapped in while async data is loading.
