import { useState, useEffect } from 'react';

/**
 * Hook to manage dark mode theme.
 * Persists to localStorage and updates the logical HTML class.
 * @returns {{ isDark: boolean, toggleTheme: () => void }}
 */
export const useTheme = () => {
    const [isDark, setIsDark] = useState(() => {
        // Check local storage or system preference
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return { isDark, toggleTheme };
};
