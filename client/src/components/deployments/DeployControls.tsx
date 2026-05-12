import React from 'react';
import { Copy, RotateCw, ExternalLink } from 'lucide-react';

const DeployControls: React.FC<{
  liveUrl: string;
  onCopy?: () => void;
  onRestart?: () => void;
}> = ({ liveUrl, onCopy, onRestart }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      onCopy && onCopy();
    } catch (e) {
      // noop
    }
  };

  return (
    <div className="flex items-center gap-3">
      <a href={liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-white/6 hover:bg-white/8">
        <ExternalLink className="w-4 h-4" />
        <span className="truncate max-w-[220px]">{liveUrl}</span>
      </a>

      <button onClick={handleCopy} className="p-2 rounded-md copy-btn hover:bg-white/5" aria-label="Copy URL">
        <Copy className="w-4 h-4 text-white/90" />
      </button>

      <button onClick={onRestart} className="flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600/80 hover:bg-rose-600/90 text-white">
        <RotateCw className="w-4 h-4" />
        Restart
      </button>
    </div>
  );
};

export default DeployControls;
