import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Skeleton from './Skeleton';
const AnalyticsChartSkeleton = () => {
    return (_jsxs("div", { className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-36" }), _jsx(Skeleton, { className: "h-3 w-20" })] }), _jsx(Skeleton, { className: "h-3 w-16" })] }), _jsx("div", { className: "mt-5 grid grid-cols-6 gap-2 items-end h-56", children: [34, 48, 22, 60, 40, 72].map((height, index) => (_jsx(Skeleton, { className: "rounded-t-xl", style: { height: `${height}%` } }, index))) }), _jsxs("div", { className: "mt-4 flex gap-3", children: [_jsx(Skeleton, { className: "h-3 w-20" }), _jsx(Skeleton, { className: "h-3 w-24" })] })] }));
};
export default AnalyticsChartSkeleton;
