import { jsx as _jsx } from "react/jsx-runtime";
const Skeleton = ({ className = '' }) => {
    return (_jsx("div", { className: `relative overflow-hidden rounded-xl bg-white/6 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent ${className}`, "aria-hidden": "true" }));
};
export default Skeleton;
