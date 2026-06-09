import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DashboardLayout } from '@/components/layout';
import StatsCards from '@/components/analytics/StatsCards';
import CPUChart from '@/components/analytics/CPUChart';
import MemoryChart from '@/components/analytics/MemoryChart';
import DeployFrequencyChart from '@/components/analytics/DeployFrequencyChart';
import MonthlyCostChart from '@/components/analytics/MonthlyCostChart';
import ApplicationHealth from '@/components/analytics/ApplicationHealth';
export default function AnalyticsPage() {
    return (_jsx(DashboardLayout, { children: _jsx("main", { className: "space-y-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: "Analytics" }), _jsx("p", { className: "text-white/60", children: "Cluster and application metrics across deployments." })] }), _jsx(StatsCards, {}), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx(CPUChart, {}), _jsx(MemoryChart, {})] }), _jsxs("div", { className: "space-y-4", children: [_jsx(DeployFrequencyChart, {}), _jsx(MonthlyCostChart, {}), _jsx(ApplicationHealth, {})] })] })] }) }) }));
}
