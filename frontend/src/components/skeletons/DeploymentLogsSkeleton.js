import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Skeleton from './Skeleton';
const DeploymentLogsSkeleton = () => {
    return (_jsxs("div", { className: "rounded-2xl border border-white/8 bg-[rgba(8,12,20,0.8)] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.45)]", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-40" }), _jsx(Skeleton, { className: "h-3 w-28" })] }), _jsx(Skeleton, { className: "h-9 w-36 rounded-lg" })] }), _jsx("div", { className: "mt-5 space-y-3 rounded-xl border border-emerald-400/10 bg-black/40 p-4 font-jetbrains", children: [1, 2, 3, 4, 5].map((row) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Skeleton, { className: "h-2.5 w-2.5 rounded-full" }), _jsx(Skeleton, { className: "h-3 w-full" })] }, row))) }), _jsxs("div", { className: "mt-5 grid gap-3 md:grid-cols-3", children: [_jsx(Skeleton, { className: "h-16 rounded-xl" }), _jsx(Skeleton, { className: "h-16 rounded-xl" }), _jsx(Skeleton, { className: "h-16 rounded-xl" })] })] }));
};
export default DeploymentLogsSkeleton;
