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
        description: 'Frosted glass on a deep gradient backdrop',
    },
    'glassmorphism-light': {
        id: 'glassmorphism-light',
        style: 'glassmorphism',
        mode: 'light',
        label: 'Glassmorphism Light',
        description: 'Frosted glass on a soft gradient backdrop',
    },
    'sketch-dark': {
        id: 'sketch-dark',
        style: 'sketch',
        mode: 'dark',
        label: 'Sketch Dark',
        description: 'Raw pencil sketches on dark craft paper',
    },
    'sketch-light': {
        id: 'sketch-light',
        style: 'sketch',
        mode: 'light',
        label: 'Sketch Light',
        description: 'Ink drawings on graph paper',
    },
    'cybercore-dark': {
        id: 'cybercore-dark',
        style: 'cybercore',
        mode: 'dark',
        label: 'Cybercore Dark',
        description: 'Neon-lit hacker terminal',
    },
    'cybercore-light': {
        id: 'cybercore-light',
        style: 'cybercore',
        mode: 'light',
        label: 'Cybercore Light',
        description: 'Clean tech interface with neon accents',
    },
    'baroque-dark': {
        id: 'baroque-dark',
        style: 'baroque',
        mode: 'dark',
        label: 'Baroque Dark',
        description: 'Opulent gold on deep velvet',
    },
    'baroque-light': {
        id: 'baroque-light',
        style: 'baroque',
        mode: 'light',
        label: 'Baroque Light',
        description: 'Gilded elegance on ivory marble',
    },
    'shabby-dark': {
        id: 'shabby-dark',
        style: 'shabby',
        mode: 'dark',
        label: 'Shabby Chic Dark',
        description: 'Vintage rose on midnight linen',
    },
    'shabby-light': {
        id: 'shabby-light',
        style: 'shabby',
        mode: 'light',
        label: 'Shabby Chic Light',
        description: 'Faded florals on whitewashed wood',
    },
    'gothic-dark': {
        id: 'gothic-dark',
        style: 'gothic',
        mode: 'dark',
        label: 'Gothic Dark',
        description: 'Medieval arches in deep shadow',
    },
    'gothic-light': {
        id: 'gothic-light',
        style: 'gothic',
        mode: 'light',
        label: 'Gothic Light',
        description: 'Stone cathedral with stained glass',
    },
    'victorian-dark': {
        id: 'victorian-dark',
        style: 'victorian',
        mode: 'dark',
        label: 'Victorian Dark',
        description: 'Mahogany parlor with gilt details',
    },
    'victorian-light': {
        id: 'victorian-light',
        style: 'victorian',
        mode: 'light',
        label: 'Victorian Light',
        description: 'Damask wallpaper and brass accents',
    },
    'cottagecore-dark': {
        id: 'cottagecore-dark',
        style: 'cottagecore',
        mode: 'dark',
        label: 'Cottagecore Dark',
        description: 'Fireside cabin at dusk',
    },
    'cottagecore-light': {
        id: 'cottagecore-light',
        style: 'cottagecore',
        mode: 'light',
        label: 'Cottagecore Light',
        description: 'Sun-dappled garden cottage',
    },
    'pixel-dark': {
        id: 'pixel-dark',
        style: 'pixel',
        mode: 'dark',
        label: 'Pixel Art Dark',
        description: 'Retro CRT monitor glow',
    },
    'pixel-light': {
        id: 'pixel-light',
        style: 'pixel',
        mode: 'light',
        label: 'Pixel Art Light',
        description: 'Game Boy-inspired pastel screen',
    },
    'filigree-dark': {
        id: 'filigree-dark',
        style: 'filigree',
        mode: 'dark',
        label: 'Filigree Dark',
        description: 'Silver thread on black velvet',
    },
    'filigree-light': {
        id: 'filigree-light',
        style: 'filigree',
        mode: 'light',
        label: 'Filigree Light',
        description: 'Gold lacework on cream parchment',
    },
};
