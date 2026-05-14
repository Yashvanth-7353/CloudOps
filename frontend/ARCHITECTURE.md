/**
 * DEPLOYMENT PIPELINE VISUALIZATION
 * Component Architecture & Data Flow
 * 
 * This file documents the component structure, props flow, and data relationships.
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │         DEPLOYMENT PIPELINE VISUALIZATION - COMPONENT TREE             │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * DeploymentPipelineVisualization (Main Component)
 * │
 * ├── Motion.div (Animated container)
 * │
 * ├── Flight Animation (Optional)
 * │   └── motion.div with rotation animation
 * │
 * ├── DeploymentHeader
 * │   ├── Title & Commit Message
 * │   ├── Status Badge (animated)
 * │   ├── Progress Bar (gradient, animated)
 * │   ├── Meta Grid (4 cols)
 * │   │   ├── Repository Card
 * │   │   ├── Branch Card
 * │   │   ├── Commit ID Card
 * │   │   └── Live URL Card (optional)
 * │
 * ├── Main Layout Grid (responsive)
 * │   │
 * │   ├── Pipeline Section (2/3 width on desktop)
 * │   │   │
 * │   │   ├── Desktop Pipeline (horizontal)
 * │   │   │   └── Flex container with items-center
 * │   │   │       └── PipelineStage[] (connected with lines)
 * │   │   │           └── For each stage (x8)
 * │   │   │               ├── motion.div (stage container)
 * │   │   │               ├── Indicator Circle (w-16 h-16)
 * │   │   │               │   ├── SVG Progress Ring
 * │   │   │               │   ├── Icon/Status
 * │   │   │               ├── Label
 * │   │   │               ├── Status Text
 * │   │   │               ├── Timestamp (optional)
 * │   │   │               └── Connector Line (to next stage)
 * │   │   │
 * │   │   └── Mobile Pipeline (vertical)
 * │   │       └── Flex column with items-center
 * │   │           └── PipelineStage[] (stacked)
 * │   │
 * │   ├── Controls Section (below pipeline)
 * │   │   └── PipelineControls
 * │   │       ├── Retry Button (if failed)
 * │   │       ├── Cancel Button (if in-progress)
 * │   │       ├── Full Screen Button
 * │   │       ├── Rollback Button (if success)
 * │   │       └── Loading Indicator
 * │   │
 * │   └── Live Logs Panel (1/3 width on desktop)
 * │       └── LiveLogsPanel
 * │           ├── Header
 * │           │   ├── Live indicator (animated)
 * │           │   ├── Log count
 * │           │   └── Action buttons
 * │           │       ├── Auto-scroll toggle
 * │           │       ├── Full screen button
 * │           │       └── Clear button
 * │           │
 * │           ├── Logs Container (scrollable)
 * │           │   └── Log Entry[] (animated)
 * │           │       ├── Timestamp
 * │           │       ├── Level Icon
 * │           │       ├── Message
 * │           │       └── Copy Button
 * │           │
 * │           └── No Logs State
 * │               └── Waiting animation
 * │
 * └── Footer Stats Grid (3 cols)
 *     ├── Status Card
 * │   ├── Completion Card
 *     └── Deployment ID Card
 * 
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                        PROPS FLOW HIERARCHY                             │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * DeploymentPipelineVisualization (Parent)
 * │
 * ├─> DeploymentHeader
 * │   Props:
 * │   • deploymentName: string
 * │   • repoUrl: string
 * │   • repoName: string
 * │   • branch: string
 * │   • commitId: string
 * │   • commitMessage?: string
 * │   • overallProgress: number (0-100)
 * │   • status: StatusType
 * │   • deploymentUrl?: string
 * │
 * ├─> PipelineStage[] (mapped from stages array)
 * │   Props (for each stage):
 * │   • stage: number (index)
 * │   • totalStages: number
 * │   • label: string
 * │   • status: StatusType ('pending' | 'in-progress' | 'success' | 'failed')
 * │   • icon: LucideIcon
 * │   • timestamp?: string
 * │   • logs?: string[]
 * │   • isLast: boolean
 * │
 * ├─> PipelineControls
 * │   Props:
 * │   • status: StatusType
 * │   • onRetry?: () => void
 * │   • onCancel?: () => void
 * │   • onFullScreen?: () => void
 * │   • onRollback?: () => void
 * │   • isLoading?: boolean
 * │
 * └─> LiveLogsPanel
 *     Props:
 *     • logs: LogEntry[]
 *     • isLoading?: boolean
 *     • onFullScreen?: () => void
 *     • onClear?: () => void
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                          DATA STRUCTURES                                │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * interface StageConfig {
 *   label: string;           // "GitHub Commit"
 *   icon: LucideIcon;        // Package from lucide-react
 *   status: StatusType;      // 'pending' | 'in-progress' | 'success' | 'failed'
 *   timestamp?: string;      // "2 sec ago"
 *   logs?: string[];         // ["log message 1", "log message 2"]
 * }
 * 
 * interface LogEntry {
 *   timestamp: string;       // "14:32:01"
 *   message: string;         // "Starting deployment..."
 *   level: LogLevel;         // 'info' | 'success' | 'error' | 'warning'
 *   source?: string;         // "builder" | "docker" | etc
 * }
 * 
 * type StatusType = 'pending' | 'in-progress' | 'success' | 'failed'
 * type LogLevel = 'info' | 'success' | 'error' | 'warning'
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                          STATUS FLOW DIAGRAM                            │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 *          Pending → In Progress → Success ✓
 *                        ↓
 *                      Failed ✗ → Retry → In Progress
 *                                              ↓
 *                                         Success ✓
 * 
 *   Rollback option available after Success
 *   Cancel option available during In Progress or Pending
 * 
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                       COLOR STATUS MAPPING                              │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * Pending:
 *   • Indicator: bg-slate-500/20 border-slate-500
 *   • Icon: text-slate-400
 *   • Text: text-slate-400
 *   • Line: rgb(100, 116, 139) [slate-500]
 * 
 * In Progress (Current):
 *   • Indicator: bg-cyan-500/20 border-cyan-500 (pulsing)
 *   • Icon: text-cyan-400 (rotating)
 *   • Text: text-cyan-400 (bold)
 *   • Glow: shadow-lg shadow-cyan-500/50
 *   • Line: gradient cyan → slate
 * 
 * Success (Completed):
 *   • Indicator: bg-emerald-500/20 border-emerald-500 (glowing)
 *   • Icon: text-emerald-400
 *   • Text: text-emerald-400
 *   • Glow: shadow-lg shadow-emerald-500/30
 *   • Line: rgb(16, 185, 129) [emerald-500]
 *   • Progress Ring: 100% filled
 * 
 * Failed:
 *   • Indicator: bg-red-500/20 border-red-500
 *   • Icon: text-red-400 (AlertCircle instead of normal)
 *   • Text: text-red-400
 *   • Glow: shadow-lg shadow-red-500/30
 *   • Line: rgb(100, 116, 139) [slate-500]
 * 
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                       ANIMATION TIMELINE                                │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * Component Mount:
 *   0.0s  - Container fade-in
 *   0.1s  - Flight animation enters (if deploying)
 *   0.2s  - Header animates in (fade + y-slide)
 *   0.3s  - Pipeline stages begin staggered entrance
 *   0.3s  - Stage 0 enters (fade + y-slide, delay 0.0s)
 *   0.4s  - Stage 1 enters (fade + y-slide, delay 0.1s)
 *   0.5s  - Stage 2 enters (fade + y-slide, delay 0.2s)
 *   ...
 *   0.8s  - Stage 7 enters (fade + y-slide, delay 0.5s)
 *   1.0s  - All stages mounted
 *   1.2s  - Logs panel animates in
 *   1.5s  - Controls animate in
 *   2.0s  - Progress ring animations begin
 *   2.0s+ - Pulse animations begin (infinite for active stages)
 * 
 * Continuous (while in-progress):
 *   Every 2s - Pulse effect on active stage
 *   Every 3s - Flight animation loop
 *   Per log  - Log entry fade-in (200ms)
 * 
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                      RESPONSIVE BREAKPOINTS                             │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * Mobile (<640px):
 *   • Layout: Single column
 *   • Pipeline: Vertical stack
 *   • Logs: Below pipeline
 *   • Buttons: Stacked horizontally (wrap)
 *   • Font: Smaller sizes (xs, sm)
 * 
 * Tablet (640px - 1024px):
 *   • Layout: 2 columns
 *   • Pipeline: Vertical stack
 *   • Logs: Beside pipeline
 *   • Buttons: Row layout
 *   • Font: Medium sizes
 * 
 * Desktop (1024px+):
 *   • Layout: 3 columns (pipeline 2/3, logs 1/3)
 *   • Pipeline: Horizontal flow
 *   • Logs: Fixed right panel
 *   • Buttons: Row layout
 *   • Font: Standard sizes
 * 
 * Max Width: 7xl (80rem = 1280px)
 * 
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                      EVENT FLOW DIAGRAM                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * User Interaction:
 * 
 * Click "Retry Failed Step"
 *   → onRetry() callback triggered
 *   → Parent component handles API call
 *   → Re-fetch deployment data
 *   → Stages update to in-progress
 *   → Logs reset or appended
 *   → Component re-renders
 * 
 * Click "Cancel Deployment"
 *   → Confirmation dialog (recommended)
 *   → onCancel() callback triggered
 *   → Parent sends cancel request
 *   → Status updates to 'cancelled'
 *   → Buttons become inactive
 * 
 * Click "View Full Logs"
 *   → onFullScreenLogs() callback triggered
 *   → Parent opens modal or new page
 *   → Show all logs in full-screen view
 *   → Allow export/download
 * 
 * Click "Rollback"
 *   → Confirmation dialog (recommended)
 *   → onRollback() callback triggered
 *   → Parent sends rollback request
 *   → New deployment starts (shows in-progress)
 *   → Logs reset
 * 
 * Copy Log Entry
 *   → Copy to clipboard
 *   → Show success feedback
 *   → Auto-dismiss after 2s
 * 
 * Auto-scroll Toggle
 *   → Save state (localStorage optional)
 *   → Control scroll position updates
 *   → Disable on manual scroll
 * 
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                    PERFORMANCE CONSIDERATIONS                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * Optimization Strategies:
 * 
 * • SVG Progress Rings:
 *   - Use stroke-dasharray for smooth animation
 *   - No repaint on every frame
 *   - GPU-accelerated transforms
 * 
 * • Log Display:
 *   - Limit to last 100-500 entries
 *   - Batch updates (500ms intervals)
 *   - Virtual scrolling (if needed)
 *   - Use React.memo on LogEntry
 * 
 * • Animations:
 *   - Use CSS transforms (GPU)
 *   - Avoid layout-triggering properties
 *   - Use will-change sparingly
 *   - Reduce particle effects on mobile
 * 
 * • Re-renders:
 *   - Memoize expensive components
 *   - Split into smaller sub-components
 *   - Use useCallback for event handlers
 *   - Avoid inline object creation
 * 
 * • Images/Icons:
 *   - Lucide icons are SVG (lightweight)
 *   - No external images
 *   - CSS-based styling
 * 
 * Benchmarks (target):
 *   • Initial render: < 100ms
 *   • Log addition: < 50ms
 *   • Animation FPS: 60fps
 *   • Memory: < 50MB
 * 
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                      ERROR STATES & HANDLING                            │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * Handled States:
 * 
 * • Failed Stage:
 *   - Icon changes to AlertCircle
 *   - Color turns red
 *   - Text shows "failed"
 *   - Retry button becomes active
 * 
 * • Network Error:
 *   - Show error badge
 *   - Disable action buttons
 *   - Show error message
 *   - Auto-retry optional
 * 
 * • Empty Logs:
 *   - Show "Waiting for logs..." message
 *   - Show loading animation
 *   - No error state
 * 
 * • WebSocket Disconnection:
 *   - Show offline indicator
 *   - Pause updates
 *   - Show reconnect button
 *   - Auto-reconnect after delay
 * 
 * Recovery Options:
 *   - Retry failed step
 *   - Refresh page
 *   - Cancel and restart
 *   - Rollback to previous
 * 
 */

export const ARCHITECTURE = {
  components: 5,
  subComponents: 0,
  totalLines: 2000,
  files: 11,
  documentation: 4,
};
