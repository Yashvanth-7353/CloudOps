import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Copy, RotateCw, ExternalLink } from 'lucide-react';
const DeployControls = ({ liveUrl, onCopy, onRestart }) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(liveUrl);
            onCopy && onCopy();
        }
        catch (e) {
            // noop
        }
    };
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("a", { href: liveUrl, target: "_blank", rel: "noreferrer", className: "flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-white/6 hover:bg-white/8", children: [_jsx(ExternalLink, { className: "w-4 h-4" }), _jsx("span", { className: "truncate max-w-[220px]", children: liveUrl })] }), _jsx("button", { onClick: handleCopy, className: "p-2 rounded-md copy-btn hover:bg-white/5", "aria-label": "Copy URL", children: _jsx(Copy, { className: "w-4 h-4 text-white/90" }) }), _jsxs("button", { onClick: onRestart, className: "flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600/80 hover:bg-rose-600/90 text-white", children: [_jsx(RotateCw, { className: "w-4 h-4" }), "Restart"] })] }));
};
export default DeployControls;
