import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { },
});
const THEME_STORAGE_KEY = 'cloudops-theme';
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    useEffect(() => {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(storedTheme ?? systemPreference);
    }, []);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);
    const value = useMemo(() => ({
        theme,
        toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }), [theme]);
    return _jsx(ThemeContext.Provider, { value: value, children: children });
};
export const useTheme = () => useContext(ThemeContext);
