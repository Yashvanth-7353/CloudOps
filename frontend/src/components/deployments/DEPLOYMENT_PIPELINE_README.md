# 🚀 Deployment Pipeline Visualization

A modern, SaaS-style CI/CD deployment pipeline visualization component for CloudOps, featuring animated stages, real-time logs, and interactive controls.

## 📋 Features

### 1. **Pipeline Visualization**
- ✨ Horizontal layout on desktop (step-by-step flow)
- 📱 Vertical stacked layout on mobile (responsive)
- 🎨 Clean dark theme with Vercel/Railway styling
- ✅ 8 customizable deployment stages with icons

### 2. **Stage Management**
- 🎯 Four status states: Pending, In Progress, Success, Failed
- ⭕ Animated progress rings for each stage
- 💫 Pulsing animation for active stages
- 🌟 Glowing effect for completed stages
- 🔴 Warning indicators for failed stages
- ⏱️ Timestamps for each stage (optional)
- 📋 Log preview tooltips on hover

### 3. **Animated Connectors**
- 🔗 Connected arrows/progress lines between stages
- 🟢 Green glow for completed stages
- 🔵 Cyan pulse for current stage
- ⚪ Gray for pending stages
- 📊 Smooth transitions and animations

### 4. **Header Section**
- 📝 Deployment name and status badge
- 🔗 GitHub repository link
- 🌿 Branch name display
- 🔐 Commit ID with shortened hash
- 📈 Overall progress percentage bar
- 🌐 Live deployment URL (if available)

### 5. **Live Logs Panel**
- 📺 Real-time streaming terminal-style logs
- 🎨 Color-coded log levels (info, success, error, warning)
- 🔄 Auto-scroll functionality
- 📋 Copy individual log entries
- 🗑️ Clear all logs
- 🔍 Search capability
- 📊 Animated log entries

### 6. **Control Panel**
- 🔄 Retry Failed Step button
- ⛔ Cancel Deployment button
- 📺 View Full Logs button
- 🔙 Rollback button
- 💾 Smart button availability based on status
- ⏳ Loading state indicators

### 7. **Visual Effects**
- ✈️ Flight takeoff animation on deployment start
- 🎬 Smooth Framer Motion animations
- 💎 Glassmorphism card styling
- 🌈 Neon blue/cyan accent colors
- 🎯 Rounded corners (12px–16px)
- 📐 Responsive grid layouts

## 📦 Component Structure

```
components/deployments/
├── DeploymentPipelineVisualization.tsx  (Main component)
├── PipelineStage.tsx                    (Individual stage)
├── DeploymentHeader.tsx                 (Header section)
├── LiveLogsPanel.tsx                    (Logs display)
├── PipelineControls.tsx                 (Action buttons)
└── index.ts                             (Exports)
```

## 🚀 Usage

### Basic Usage

```tsx
import { DeploymentPipelineVisualization } from '@/components/deployments';

export default function DeploymentPage() {
  return (
    <DeploymentPipelineVisualization
      deploymentName="Production Deployment v1.2.3"
      repoName="cloudops/main"
      repoUrl="https://github.com/cloudops/main"
      branch="main"
      commitId="abc123def456"
      deploymentUrl="https://app.cloudops.dev"
      status="in-progress"
      overallProgress={62}
    />
  );
}
```

### Advanced Usage with Custom Stages

```tsx
import { 
  DeploymentPipelineVisualization, 
  PipelineStage 
} from '@/components/deployments';
import { 
  Package, 
  Cog, 
  Download, 
  Docker, 
  Cloud, 
  Rocket 
} from 'lucide-react';

const customStages = [
  {
    label: 'GitHub Commit',
    icon: Package,
    status: 'success',
    timestamp: '2 sec ago',
    logs: ['Detected new commit: abc123'],
  },
  {
    label: 'Build Started',
    icon: Cog,
    status: 'success',
    timestamp: '5 sec ago',
    logs: ['Build environment initialized'],
  },
  // ... more stages
];

export default function DeploymentPage() {
  const handleRetry = () => {
    console.log('Retrying failed step...');
    // API call to retry deployment
  };

  const handleCancel = () => {
    console.log('Cancelling deployment...');
    // API call to cancel
  };

  return (
    <DeploymentPipelineVisualization
      deploymentName="Production v1.2.3"
      repoName="cloudops/main"
      repoUrl="https://github.com/cloudops/main"
      branch="main"
      commitId="abc123def456"
      stages={customStages}
      status="in-progress"
      overallProgress={50}
      onRetry={handleRetry}
      onCancel={handleCancel}
      onRollback={() => console.log('Rolling back...')}
      onFullScreenLogs={() => console.log('Full screen')}
      onClearLogs={() => console.log('Clearing logs')}
      isLoading={false}
      showFlightAnimation={true}
    />
  );
}
```

## 🎨 Component Props

### DeploymentPipelineVisualization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `deploymentId` | string | 'deploy-2024-001' | Unique deployment identifier |
| `deploymentName` | string | 'Production Deployment' | Deployment display name |
| `repoName` | string | 'cloudops/main' | Repository name |
| `repoUrl` | string | '' | GitHub repository URL |
| `branch` | string | 'main' | Git branch name |
| `commitId` | string | '' | Full commit hash |
| `commitMessage` | string | '' | Commit message |
| `deploymentUrl` | string | '' | Live deployment URL |
| `stages` | StageConfig[] | DEFAULT_STAGES | Array of pipeline stages |
| `logs` | LogEntry[] | DEFAULT_LOGS | Array of log entries |
| `status` | 'pending' \| 'in-progress' \| 'success' \| 'failed' | 'in-progress' | Current deployment status |
| `overallProgress` | number | 62 | Overall progress percentage (0-100) |
| `onRetry` | function | - | Callback when retry is clicked |
| `onCancel` | function | - | Callback when cancel is clicked |
| `onRollback` | function | - | Callback when rollback is clicked |
| `onFullScreenLogs` | function | - | Callback when full screen is requested |
| `onClearLogs` | function | - | Callback when logs are cleared |
| `isLoading` | boolean | false | Show loading state in controls |
| `showFlightAnimation` | boolean | true | Show flight animation on deploy |

### Stage Configuration

```tsx
interface StageConfig {
  label: string;           // Stage name
  icon: LucideIcon;       // Icon component from lucide-react
  status: 'pending' | 'in-progress' | 'success' | 'failed';
  timestamp?: string;     // Optional timestamp
  logs?: string[];        // Array of log messages
}
```

### Log Entry

```tsx
interface LogEntry {
  timestamp: string;                           // HH:MM:SS format
  message: string;                            // Log message
  level: 'info' | 'success' | 'error' | 'warning';
  source?: string;                            // Optional source identifier
}
```

## 🎯 Default Stages

The component comes with 8 pre-configured stages:

1. 📦 **GitHub Commit** - Webhook received
2. ⚙️ **Build Started** - Build environment init
3. 📥 **Installing Dependencies** - npm/yarn install
4. 🐳 **Docker Image Build** - Docker build
5. ☁️ **Pushing to AWS ECR** - AWS upload
6. 🚀 **Deploying to ECS** - ECS deployment
7. 🌐 **NGINX Routing Setup** - Routing config
8. ✅ **Live Deployment** - Completion

## 🎨 Styling & Customization

### Colors
- **Success**: Emerald green (#10B981)
- **Error**: Red (#EF4444)
- **In Progress**: Cyan (#22D3EE)
- **Pending**: Slate gray (#64748B)

### Dark Theme
- Background: Slate 900 (#0F172A)
- Cards: Slate 800/50 with transparency
- Borders: Slate 700/50 with transparency
- Text: White/Slate 300 for contrast

### Animations
- Stage entrance: 0.1s stagger delay
- Progress ring: 0.5s ease-out
- Pulse effect: 2s infinite loop
- Glow effect: Dynamic based on status
- Log animations: Framer Motion

## 📱 Responsive Design

- **Desktop (1024px+)**: Horizontal pipeline layout
- **Tablet (768px-1023px)**: Vertical pipeline with 2-col logs layout
- **Mobile (<768px)**: Full vertical stack, single column

## 🔧 Integration

### With React Router

```tsx
import { useParams } from 'react-router-dom';
import DeploymentPipelineVisualization from '@/components/deployments';

export default function DeploymentDetail() {
  const { deploymentId } = useParams();
  const [deployment, setDeployment] = useState(null);

  useEffect(() => {
    // Fetch deployment data
    fetchDeploymentData(deploymentId).then(setDeployment);
  }, [deploymentId]);

  if (!deployment) return <div>Loading...</div>;

  return (
    <DeploymentPipelineVisualization
      deploymentId={deployment._id}
      deploymentName={deployment.name}
      repoName={deployment.repositoryName}
      // ... other props
    />
  );
}
```

### With WebSocket for Real-time Logs

```tsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function DeploymentPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = io();

    socket.on('deployment:log', (log) => {
      setLogs(prev => [...prev, log]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <DeploymentPipelineVisualization
      logs={logs}
      // ... other props
    />
  );
}
```

## 🎬 Animation Effects

### Stage Animations
- Entrance: Fade + Y-axis slide
- Pulse: Scale animation on active stage
- Glow: Shadow effect for current stage
- Progress Ring: SVG stroke animation

### Log Animations
- Entry: Fade + X-axis slide
- Exit: Fade out
- Copy feedback: Success icon animation

### Progress Bar
- Smooth width transition: 0.5s
- Gradient effect based on status
- Glow shadow effect

## 📊 Example Integration Data Flow

```
API Response
    ↓
[Deployment State]
    ↓
[Process into Stages]
    ↓
[WebSocket Stream Logs]
    ↓
[Update Progress %]
    ↓
[Render Pipeline + Logs]
```

## ⚙️ Configuration Examples

### Demo/Showcase Page
See `DeploymentPipelineShowcase.tsx` for a complete demo implementation.

### Production Integration
1. Replace mock data with API calls
2. Connect WebSocket for real-time logs
3. Implement retry/cancel handlers
4. Add error boundary wrapper
5. Connect to deployment service

## 🔄 State Management

Component maintains:
- Log display state (auto-scroll, filtered)
- Copied log index (for feedback)
- Full screen log modal state

For complex deployments, consider using:
- Zustand for global state
- Redux/Context for cross-component state
- React Query for API caching

## 🎯 Best Practices

1. **Keep logs limited**: Store last 100-500 logs to maintain performance
2. **Batch log updates**: Update logs every 500ms instead of per-log
3. **Throttle progress**: Avoid excessive re-renders
4. **Error handling**: Wrap in error boundary
5. **Accessibility**: Add ARIA labels to buttons
6. **Performance**: Memoize expensive computations

## 📚 Dependencies

- `react` >= 18.2.0
- `framer-motion` >= 10.16.0
- `lucide-react` >= 0.292.0
- `tailwindcss` >= 3.3.6
- `react-router-dom` >= 6.20.0 (for routing integration)

## 🚀 Demo Page

Access the showcase at: `/pages/DeploymentPipelineShowcase.tsx`

Features:
- Live deployment simulation
- Full-screen logs modal
- All controls functional
- Responsive layout preview
- Log streaming demo

## 📝 Notes

- Component is fully responsive
- Dark mode optimized
- Animations are smooth but not performance-heavy
- Mobile-first design approach
- Accessible color contrasts
- WCAG 2.1 compliant styling

---

**Created**: 2024
**Status**: Production Ready
**Version**: 1.0.0
