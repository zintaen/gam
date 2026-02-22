import { useCallback, useEffect, useState } from 'react';

import { THEME_STORAGE_KEY } from '#/lib/constants';

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);

        if (stored === 'dark' || stored === 'light') {
            return stored;
        }

        return 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(t => (t === 'light' ? 'dark' : 'light'));
    }, []);

    return { theme, toggleTheme };
}
