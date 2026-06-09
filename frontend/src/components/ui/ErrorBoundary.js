import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
class ErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                hasError: false,
                error: null,
            }
        });
        Object.defineProperty(this, "reset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({ hasError: false, error: null });
            }
        });
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("main", { className: "page-shell page-shell--wide py-20", children: _jsxs("section", { className: "glass-elevated p-8 rounded-3xl border border-border max-w-3xl mx-auto text-center", children: [_jsx("h1", { className: "text-3xl font-semibold text-white mb-4", children: "Something went wrong" }), _jsx("p", { className: "text-text-secondary mb-6", children: "An unexpected error occurred. Refresh the page or try again using the button below." }), _jsx("button", { type: "button", className: "btn btn-secondary", onClick: this.reset, children: "Retry" })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
