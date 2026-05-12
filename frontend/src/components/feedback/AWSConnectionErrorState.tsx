import React from 'react';
import { CloudOff, RefreshCw, KeyRound } from 'lucide-react';
import FeedbackState from './FeedbackState';

const AWSConnectionErrorState: React.FC = () => {
  return (
    <FeedbackState
      tone="error"
      icon={CloudOff}
      title="AWS connection error"
      description="CloudOps could not reach your AWS account. Check credentials, region settings, and IAM permissions, then reconnect to continue deployments."
      actions={[
        { label: 'Reconnect AWS', href: '/settings' },
        { label: 'Retry', onClick: () => window.location.reload(), variant: 'secondary' },
      ]}
      illustration={
        <div className="mx-auto flex items-center gap-3 text-white/50">
          <div className="rounded-2xl border border-rose-400/15 bg-rose-500/10 p-4 text-rose-100">
            <CloudOff className="h-6 w-6" />
          </div>
          <RefreshCw className="h-5 w-5" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-cyan-200">
            <KeyRound className="h-6 w-6" />
          </div>
        </div>
      }
    />
  );
};

export default AWSConnectionErrorState;
