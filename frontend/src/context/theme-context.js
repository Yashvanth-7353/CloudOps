import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Theme Context
 * Manages application theme (dark/light mode)
 */
import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = React.useState('dark');
    const [isDark, setIsDark] = React.useState(true);
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        // Update DOM
        if (newTheme === 'dark' || (newTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
        else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
    }, [setTheme]);
    const value = useMemo(() => ({
        theme,
        setTheme,
        isDark,
    }), [theme, setTheme, isDark]);
    return _jsx(ThemeContext.Provider, { value: value, children: children });
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
