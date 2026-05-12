Analytics dashboard components

Components:
- `StatsCards` — top stat summary cards
- `CPUChart`, `MemoryChart` — line/area charts (Recharts)
- `DeployFrequencyChart` — bar chart for deployments
- `MonthlyCostChart` — area chart for monthly cost
- `ApplicationHealth` — pie chart showing health breakdown

Usage example:
```
import AnalyticsPage from '@/pages/Analytics';
```

Notes:
- Components use sample/mock data. Replace with real metrics from your telemetry backend (Prometheus, CloudWatch, etc.).
- Ensure `recharts` is installed in `package.json`.
