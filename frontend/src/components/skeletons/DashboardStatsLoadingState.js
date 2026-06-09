import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Skeleton from './Skeleton';
const DashboardStatsLoadingState = () => {
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [1, 2, 3, 4].map((item) => (_jsxs("div", { className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] p-5 backdrop-blur-md shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Skeleton, { className: "h-3 w-28" }), _jsx(Skeleton, { className: "h-7 w-20" })] }), _jsx(Skeleton, { className: "h-12 w-12 rounded-xl" })] }), _jsx(Skeleton, { className: "mt-5 h-3 w-32" })] }, item))) }));
};
export default DashboardStatsLoadingState;
