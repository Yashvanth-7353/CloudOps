import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navbar from './Navbar';
import Footer from './Footer';
const Layout = ({ children, showNavbar = true, className = '', }) => {
    return (_jsxs("div", { className: "relative z-10 min-h-screen flex flex-col", children: [showNavbar && _jsx(Navbar, {}), _jsx("main", { className: `page-shell page-shell--wide flex-1 ${className}`, children: children }), _jsx(Footer, {})] }));
};
export default Layout;
