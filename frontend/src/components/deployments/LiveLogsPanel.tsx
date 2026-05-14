import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Copy, Trash2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'error' | 'warning';
  source?: string;
}

interface LiveLogsPanelProps {
  logs: LogEntry[];
  isLoading?: boolean;
  onFullScreen?: () => void;
  onClear?: () => void;
}

const LiveLogsPanel: React.FC<LiveLogsPanelProps> = ({
  logs,
  isLoading = false,
  onFullScreen,
  onClear,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = (log: LogEntry) => {
    navigator.clipboard.writeText(`[${log.timestamp}] ${log.message}`);
    setCopiedIndex(logs.indexOf(log));
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-amber-400';
      default:
        return 'text-cyan-400';
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      case 'warning':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-900 border border-slate-700/50 rounded-lg lg:rounded-xl overflow-hidden flex flex-col h-full max-h-[600px]"
    >
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <motion.div
              className="absolute inset-0 w-2 h-2 bg-cyan-500 rounded-full"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Live Logs</h3>
            <p className="text-xs text-slate-400">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded hover:bg-slate-700/50 transition-colors ${
              autoScroll ? 'text-cyan-400' : 'text-slate-500'
            }`}
            title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m0 0h4m10 0v12m0 0l4-4m0 0h-4"
              />
            </svg>
          </button>

          {onFullScreen && (
            <button
              onClick={onFullScreen}
              className="p-1.5 rounded hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
              title="Full screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          {onClear && (
            <button
              onClick={onClear}
              className="p-1.5 rounded hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Logs Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-slate-900/50 font-mono text-xs"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(15, 23, 42, 0.5) 2px, rgba(15, 23, 42, 0.5) 4px)',
        }}
      >
        <div className="p-4 space-y-1">
          <AnimatePresence>
            {logs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-slate-500 text-center py-8"
              >
                <p>Waiting for logs...</p>
                {isLoading && (
                  <motion.div
                    className="mt-3 flex justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-start gap-2 hover:bg-slate-800/30 px-2 py-1 rounded transition-colors"
                >
                  {/* Timestamp */}
                  <span className="text-slate-500 flex-shrink-0 min-w-fit">
                    {log.timestamp}
                  </span>

                  {/* Icon */}
                  <span className={`flex-shrink-0 mt-0.5 ${getLogColor(log.level)}`}>
                    {getLogIcon(log.level)}
                  </span>

                  {/* Message */}
                  <span className={`flex-1 ${getLogColor(log.level)} break-words`}>
                    {log.message}
                  </span>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(log)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5 hover:bg-slate-700/50 rounded"
                    title="Copy log"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveLogsPanel;
