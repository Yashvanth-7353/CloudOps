import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Skeleton from './Skeleton';
const RepositoryCardSkeleton = () => {
    return (_jsxs("div", { className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-4 shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Skeleton, { className: "h-11 w-11 rounded-xl" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-36" }), _jsx(Skeleton, { className: "h-3 w-24" })] })] }), _jsx(Skeleton, { className: "h-8 w-20 rounded-lg" })] }), _jsxs("div", { className: "mt-5 flex items-center justify-between gap-3", children: [_jsx(Skeleton, { className: "h-3 w-28" }), _jsx(Skeleton, { className: "h-3 w-16" })] })] }));
};
export default RepositoryCardSkeleton;
