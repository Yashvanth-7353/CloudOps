Settings components for CloudOps

Sections included:
- Profile settings
- GitHub integration
- AWS credentials
- Environment variables
- Notification preferences
- Team settings
- Security settings
- Connected repositories (in page layout)

Implementation notes:
- The UI uses glassmorphism cards, responsive grids, and motion-enhanced hover states.
- Environment variables support add/edit/delete interactions.
- Toggle switches are built with local React state.
- AWS keys are masked by default to emphasize secure API key management.

Usage:
```
import SettingsPage from '@/pages/Settings';
```
