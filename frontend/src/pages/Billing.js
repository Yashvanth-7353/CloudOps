import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DashboardLayout } from '@/components/layout';
import CostSummaryCards from '@/components/billing/CostSummaryCards';
import CostBreakdownChart from '@/components/billing/CostBreakdownChart';
import CostPredictionChart from '@/components/billing/CostPredictionChart';
import CostSuggestions from '@/components/billing/CostSuggestions';
export default function BillingPage() {
    return (_jsx(DashboardLayout, { children: _jsx("main", { className: "space-y-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: "Billing & Cost Analysis" }), _jsx("p", { className: "text-white/60", children: "AWS cost breakdown, trends, and optimization opportunities." })] }), _jsx(CostSummaryCards, {}), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx(CostBreakdownChart, {}), _jsx(CostPredictionChart, {})] }), _jsxs("div", { className: "space-y-4", children: [_jsx(CostSuggestions, {}), _jsxs("div", { className: "backdrop-blur-md bg-[rgba(12,16,26,0.6)] border border-white/6 rounded-xl p-4", children: [_jsx("h3", { className: "text-sm font-semibold text-white mb-2", children: "Usage Analytics" }), _jsx("div", { className: "text-sm text-white/70", children: "Top services by spend, hourly usage, and anomalous billing events will appear here." })] })] })] })] }) }) }));
}
