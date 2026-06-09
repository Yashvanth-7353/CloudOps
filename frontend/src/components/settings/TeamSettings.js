import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Crown, Trash2 } from 'lucide-react';
import { SETTINGS_KEYS, readStoredValue, writeStoredValue } from './settings-storage';
const DEFAULT_TEAM = {
    teamName: 'CloudOps Platform',
    members: [
        { id: 1, name: 'Olivia', role: 'Admin' },
        { id: 2, name: 'Marcus', role: 'Developer' },
    ],
};
const TeamSettings = () => {
    const stored = readStoredValue(SETTINGS_KEYS.TEAM, DEFAULT_TEAM);
    const [teamName, setTeamName] = useState(stored.teamName);
    const [members, setMembers] = useState(stored.members);
    const [memberName, setMemberName] = useState('');
    const [memberRole, setMemberRole] = useState('Developer');
    const persist = (nextTeamName, nextMembers) => {
        setTeamName(nextTeamName);
        setMembers(nextMembers);
        writeStoredValue(SETTINGS_KEYS.TEAM, { teamName: nextTeamName, members: nextMembers });
    };
    const addMember = () => {
        if (!memberName.trim())
            return;
        const nextMembers = [...members, { id: Date.now(), name: memberName.trim(), role: memberRole.trim() || 'Member' }];
        persist(teamName, nextMembers);
        setMemberName('');
        setMemberRole('Developer');
    };
    const removeMember = (id) => {
        persist(teamName, members.filter((member) => member.id !== id));
    };
    return (_jsxs(motion.section, { whileHover: { y: -4 }, className: "rounded-2xl border border-white/8 bg-[rgba(10,14,24,0.62)] backdrop-blur-md p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)]", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 mb-5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Team settings" }), _jsx("p", { className: "text-sm text-white/60", children: "Manage workspace members and roles." })] }), _jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 text-fuchsia-300", children: _jsx(Users, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("input", { value: teamName, onChange: (e) => persist(e.target.value, members), className: "w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-white outline-none focus:border-fuchsia-400/50" }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsx("input", { value: memberName, onChange: (e) => setMemberName(e.target.value), placeholder: "Member name", className: "w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-white outline-none focus:border-fuchsia-400/50" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { value: memberRole, onChange: (e) => setMemberRole(e.target.value), placeholder: "Role", className: "w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-white outline-none focus:border-fuchsia-400/50" }), _jsx("button", { type: "button", onClick: addMember, className: "rounded-xl bg-fuchsia-500/15 px-4 py-3 text-sm font-medium text-fuchsia-100", children: "Add" })] })] }), _jsx("div", { className: "space-y-2 text-sm text-white/80", children: members.map((member, index) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-3", children: [_jsxs("span", { children: [member.name, " - ", member.role] }), _jsxs("div", { className: "flex items-center gap-2", children: [index === 0 ? _jsx(Crown, { className: "h-4 w-4 text-amber-300" }) : _jsx(UserPlus, { className: "h-4 w-4 text-cyan-300" }), _jsx("button", { type: "button", onClick: () => removeMember(member.id), className: "rounded-lg bg-white/6 p-2 text-white/70 hover:bg-white/10", "aria-label": "Remove member", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }, member.id))) })] })] }));
};
export default TeamSettings;
