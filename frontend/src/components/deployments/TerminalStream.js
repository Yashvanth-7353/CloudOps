import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
const TerminalStream = ({ logs }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current)
            return;
        const el = ref.current;
        el.scrollTop = el.scrollHeight;
    }, [logs]);
    return (_jsxs("div", { className: "terminal-shell font-jetbrains text-sm", style: { maxHeight: 320, overflow: 'auto' }, ref: ref, children: [_jsx("div", { className: "text-xs text-white/60 mb-2", children: "Live logs" }), _jsx("div", { children: logs.map((ln, idx) => (_jsx("div", { className: "terminal-line text-[13px] text-white/90 leading-[1.35]", children: ln }, idx))) })] }));
};
export default TerminalStream;
