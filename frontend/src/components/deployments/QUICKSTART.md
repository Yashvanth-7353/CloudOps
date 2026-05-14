# 🚀 Deployment Pipeline Visualization - Quick Start

Get up and running with the Deployment Pipeline Visualization in 5 minutes!

## 📦 What's Included

```
components/deployments/
├── DeploymentPipelineVisualization.tsx    (Main component)
├── PipelineStage.tsx                      (Stage component)
├── DeploymentHeader.tsx                   (Header info)
├── LiveLogsPanel.tsx                      (Live logs)
├── PipelineControls.tsx                   (Action buttons)
├── index.ts                               (Barrel export)
├── DEPLOYMENT_PIPELINE_README.md          (Full docs)
├── INTEGRATION_GUIDE.ts                   (Integration examples)
└── styles.reference.ts                    (Styling guide)

pages/
└── DeploymentPipelineShowcase.tsx         (Demo page)
```

## ⚡ Quick Start

### 1. **Import the Component**

```tsx
import { DeploymentPipelineVisualization } from '@/components/deployments';
```

### 2. **Basic Usage (30 seconds)**

```tsx
export default function DeploymentPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <DeploymentPipelineVisualization
        deploymentName="My App v1.0"
        repoName="myapp/main"
        repoUrl="https://github.com/myapp/main"
        branch="main"
        commitId="abc123def456"
        status="in-progress"
        overallProgress={50}
      />
    </div>
  );
}
```

### 3. **With Real Data**

```tsx
import { useEffect, useState } from 'react';
import { DeploymentPipelineVisualization } from '@/components/deployments';

export default function DeploymentDetail() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch from your API
    fetch(`/api/deployments/${id}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <DeploymentPipelineVisualization
      deploymentName={data.name}
      repoName={data.repo}
      repoUrl={data.repoUrl}
      branch={data.branch}
      commitId={data.commit}
      status={data.status}
      overallProgress={data.progress}
      logs={data.logs}
      onRetry={() => console.log('Retry')}
      onCancel={() => console.log('Cancel')}
    />
  );
}
```

### 4. **With WebSocket (Real-time)**

```tsx
import { useEffect, useState } from 'react';
import { DeploymentPipelineVisualization } from '@/components/deployments';
import io from 'socket.io-client';

export default function LiveDeployment({ deploymentId }) {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const socket = io();
    
    socket.emit('watch-deployment', { deploymentId });

    socket.on('log', (log) => {
      setLogs(prev => [...prev, log]);
    });

    socket.on('status', (newStatus) => {
      setStatus(newStatus);
    });

    return () => socket.disconnect();
  }, [deploymentId]);

  return (
    <DeploymentPipelineVisualization
      logs={logs}
      status={status}
    />
  );
}
```

## 🎨 Customization Examples

### Custom Stages

```tsx
import { Package, Cog, Docker, Rocket } from 'lucide-react';

const customStages = [
  {
    label: 'GitHub Commit',
    icon: Package,
    status: 'success',
    timestamp: '10:30:01',
  },
  {
    label: 'Build',
    icon: Cog,
    status: 'in-progress',
  },
  {
    label: 'Docker',
    icon: Docker,
    status: 'pending',
  },
  {
    label: 'Deploy',
    icon: Rocket,
    status: 'pending',
  },
];

<DeploymentPipelineVisualization
  stages={customStages}
  // ... other props
/>
```

### Custom Colors (via Tailwind)

The component uses semantic color classes that you can override:
- Success: `emerald-500`
- Error: `red-500`
- In Progress: `cyan-500`
- Warning: `amber-500`

### Handle Actions

```tsx
<DeploymentPipelineVisualization
  onRetry={async () => {
    await fetch('/api/deployments/retry', { method: 'POST' });
  }}
  onCancel={async () => {
    await fetch('/api/deployments/cancel', { method: 'POST' });
  }}
  onRollback={async () => {
    await fetch('/api/deployments/rollback', { method: 'POST' });
  }}
/>
```

## 📱 Responsive Design

The component automatically adapts:

- **Desktop (1024px+)**: Horizontal pipeline
- **Tablet (768px-1023px)**: Vertical pipeline with 2-col layout
- **Mobile (<768px)**: Full vertical stack

No extra configuration needed!

## 🎬 Animations

- **Stage entrance**: Staggered fade + slide
- **Progress ring**: Smooth SVG animation
- **Pulse effect**: Active stage glow
- **Log entries**: Smooth fade-in
- **Flight animation**: Auto-plays on deploy start

## 🔌 Integration Checklist

- [ ] Import component
- [ ] Pass required props
- [ ] Setup API/WebSocket
- [ ] Add event handlers
- [ ] Style wrapper (dark background)
- [ ] Test on mobile
- [ ] Add error boundary
- [ ] Connect real data

## 🐛 Common Issues

### **Issue**: Logs not showing up
**Solution**: Ensure logs array format: `{ timestamp, message, level }`

### **Issue**: Animation stuttering
**Solution**: Reduce number of simultaneous animations or check GPU acceleration

### **Issue**: Mobile layout broken
**Solution**: Ensure parent container has full width: `className="w-full"`

### **Issue**: WebSocket not connecting
**Solution**: Check CORS settings and socket.io configuration on backend

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_PIPELINE_README.md` | Full component documentation |
| `INTEGRATION_GUIDE.ts` | Backend integration examples |
| `styles.reference.ts` | Styling constants and color scheme |
| `DeploymentPipelineShowcase.tsx` | Demo/showcase page |

## 🎯 Props Reference

### Essential Props
```tsx
deploymentName: string           // "Production v1.0"
repoName: string                 // "cloudops/main"
repoUrl: string                  // GitHub URL
branch: string                   // "main"
commitId: string                 // Full commit hash
status: StatusType               // 'in-progress' | 'success' | 'failed' | 'pending'
```

### Optional Props
```tsx
logs?: LogEntry[]                // Array of log entries
stages?: StageConfig[]           // Custom stages
overallProgress?: number         // 0-100
onRetry?: () => void
onCancel?: () => void
onRollback?: () => void
onFullScreenLogs?: () => void
isLoading?: boolean
```

## 🚀 Deploy to Production

1. **Ensure dark mode is active** in your app
2. **Configure dark bg**: Add dark background to parent container
3. **Test real-time updates**: With WebSocket streaming
4. **Monitor performance**: With React DevTools Profiler
5. **Add error boundaries**: Wrap in error boundary component
6. **Test on all devices**: Desktop, tablet, mobile

## 💡 Pro Tips

✅ **Use WebSocket**: Don't poll; use Socket.io for real-time updates
✅ **Limit logs**: Keep last 100-500 logs for performance
✅ **Batch updates**: Update logs every 500ms instead of per-log
✅ **Cache deployments**: Use React Query for better caching
✅ **Auto-refresh**: Refresh deployment status every 10 seconds
✅ **Error recovery**: Show error state and allow retry
✅ **Loading state**: Show skeleton while data loads
✅ **Accessibility**: Test with screen readers

## 🔗 Next Steps

1. **View the demo**: Visit `/demo/deployment-pipeline`
2. **Read full docs**: See `DEPLOYMENT_PIPELINE_README.md`
3. **Integration**: Follow `INTEGRATION_GUIDE.ts`
4. **Customize**: Adjust colors in `styles.reference.ts`
5. **Test**: Run tests with your test data

## 📞 Support

For issues or questions:
1. Check `DEPLOYMENT_PIPELINE_README.md` FAQ section
2. Review integration examples in `INTEGRATION_GUIDE.ts`
3. Check styling reference in `styles.reference.ts`
4. View demo at `DeploymentPipelineShowcase.tsx`

---

**Happy Deploying!** 🚀
