import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useState } from 'react';
const ToastContext = createContext({
    notify: () => { },
});
export const useToast = () => useContext(ToastContext);
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);
    const notify = useCallback((toast) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((current) => [...current, { id, ...toast }]);
        window.setTimeout(() => removeToast(id), 4200);
    }, [removeToast]);
    return (_jsxs(ToastContext.Provider, { value: { notify }, children: [children, _jsx("div", { className: "toast-viewport", role: "status", "aria-live": "polite", children: toasts.map((toast) => (_jsxs("div", { className: `toast toast-${toast.variant}`, role: "alert", children: [_jsxs("div", { className: "toast-content", children: [_jsx("strong", { className: "toast-title", children: toast.title }), toast.message && _jsx("p", { className: "toast-description", children: toast.message })] }), _jsx("button", { type: "button", className: "toast-close", onClick: () => removeToast(toast.id), "aria-label": "Dismiss notification", children: "\u00D7" })] }, toast.id))) })] }));
};
