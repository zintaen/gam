/** App-level constants — single source of truth for magic strings and values. */

import type { I_ThemeConfig, T_ThemeId } from '#/types';

export const APP_VERSION = '1.0.0';
export const THEME_STORAGE_KEY = 'gam-theme';
export const TOAST_DURATION_MS = 4000;
export const SEARCH_DEBOUNCE_MS = 300;
export const SUPPORT_URL = 'https://buymeacoffee.com/zintaen';

export const DEFAULT_THEME_ID: T_ThemeId = 'glassmorphism-dark';

export const THEME_REGISTRY: Record<T_ThemeId, I_ThemeConfig> = {
    'glassmorphism-dark': {
        id: 'glassmorphism-dark',
        style: 'glassmorphism',
        mode: 'dark',
        label: 'Glassmorphism Dark',
        description: 'Frosted glass panels on a deep gradient backdrop',
    },
    'glassmorphism-light': {
        id: 'glassmorphism-light',
        style: 'glassmorphism',
        mode: 'light',
        label: 'Glassmorphism Light',
        description: 'Frosted glass panels on a soft gradient backdrop',
    },
    'notebook-dark': {
        id: 'notebook-dark',
        style: 'notebook',
        mode: 'dark',
        label: 'Notebook Dark',
        description: 'Handwritten notebook with dark paper and cream ink',
    },
    'notebook-light': {
        id: 'notebook-light',
        style: 'notebook',
        mode: 'light',
        label: 'Notebook Light',
        description: 'Classic handwritten notebook on warm cream paper',
    },
    'ide-dark': {
        id: 'ide-dark',
        style: 'ide',
        mode: 'dark',
        label: 'IDE Dark',
        description: 'VS Code-inspired dark developer theme',
    },
    'ide-light': {
        id: 'ide-light',
        style: 'ide',
        mode: 'light',
        label: 'IDE Light',
        description: 'Clean minimal SaaS-style light interface',
    },
};
