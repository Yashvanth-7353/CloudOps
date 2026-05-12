Feedback states for CloudOps

Included states:
- No repositories connected
- Deployment failed
- Analytics unavailable
- No deployment history
- AWS connection error

Design notes:
- Built with a shared `FeedbackState` wrapper for consistent layout and CTA behavior.
- Supports dark mode, glassmorphism, and animated entrance transitions.
- Intended for empty states, error states, and recoverable data-loading failures.

Usage:
```
import { NoRepositoriesState } from '@/components/feedback';
```
