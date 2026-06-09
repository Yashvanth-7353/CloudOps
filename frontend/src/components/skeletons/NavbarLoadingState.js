import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Skeleton from './Skeleton';
const NavbarLoadingState = () => {
    return (_jsxs("div", { className: "flex items-center gap-4 rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] px-4 py-3 backdrop-blur-md shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsx(Skeleton, { className: "h-10 w-10 rounded-full" }), _jsx(Skeleton, { className: "h-4 w-40 flex-1" }), _jsx(Skeleton, { className: "h-10 w-10 rounded-xl" }), _jsx(Skeleton, { className: "h-10 w-10 rounded-xl" }), _jsx(Skeleton, { className: "h-10 w-28 rounded-xl" })] }));
};
export default NavbarLoadingState;
