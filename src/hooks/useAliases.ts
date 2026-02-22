import { useCallback, useEffect, useState } from 'react';

import type { I_GitAlias } from '#/types';

import { isTauri, tauriAPI } from '#/lib/tauri';

type T_Scope = 'global' | 'local' | 'all';

// Mock API for browser-based development
const mockAliases: I_GitAlias[] = [];

const mockAPI = {
    getAliases: async (_scope: T_Scope) => {
        // Try to use the real API if available
        return { success: true, data: mockAliases };
    },
    addAlias: async (
        name: string,
        command: string,
        scope: 'global' | 'local',
        localPath?: string,
    ) => {
        mockAliases.push({ name, command, scope, localPath });

        return { success: true };
    },
    updateAlias: async (
        oldName: string,
        name: string,
        command: string,
        scope: 'global' | 'local',
        localPath?: string,
    ) => {
        const idx = mockAliases.findIndex(a => a.name === oldName);

        if (idx !== -1) {
            mockAliases[idx] = { name, command, scope, localPath };
        }

        return { success: true };
    },
    deleteAlias: async (name: string, _scope: 'global' | 'local', _localPath?: string) => {
        const idx = mockAliases.findIndex(a => a.name === name);

        if (idx !== -1) {
            mockAliases.splice(idx, 1);
        }

        return { success: true };
    },
};

function getAPI() {
    return isTauri ? tauriAPI : mockAPI;
}

export function useAliases() {
    const [aliases, setAliases] = useState<I_GitAlias[]>([]);
    const [loading, setLoading] = useState(true);
    const [scope, setScope] = useState<T_Scope>('all');
    const [error, setError] = useState<string | null>(null);

    const fetchAliases = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const api = getAPI();
            const result = await api.getAliases(scope);

            if ('success' in result && result.success && result.data) {
                setAliases(result.data);
            }
            else if ('success' in result && !result.success) {
                setError((result as any).error || 'Failed to fetch aliases');
                setAliases([]);
            }
        }
        catch (err: any) {
            setError(err.message || 'Failed to fetch aliases');
            setAliases([]);
        }
        finally {
            setLoading(false);
        }
    }, [scope]);

    useEffect(() => {
        fetchAliases();
    }, [fetchAliases]);

    const addAlias = useCallback(
        async (name: string, command: string, aliasScope: 'global' | 'local', localPath?: string) => {
            const api = getAPI();
            const result = await api.addAlias(name, command, aliasScope, localPath);

            if ('success' in result && !result.success) {
                throw new Error((result as any).error || 'Failed to add alias');
            }
            await fetchAliases();
        },
        [fetchAliases],
    );

    const updateAlias = useCallback(
        async (
            oldName: string,
            name: string,
            command: string,
            aliasScope: 'global' | 'local',
            localPath?: string,
        ) => {
            const api = getAPI();
            const result = await api.updateAlias(oldName, name, command, aliasScope, localPath);

            if ('success' in result && !result.success) {
                throw new Error((result as any).error || 'Failed to update alias');
            }

            await fetchAliases();
        },
        [fetchAliases],
    );

    const deleteAlias = useCallback(
        async (name: string, aliasScope: 'global' | 'local', localPath?: string) => {
            const api = getAPI();
            const result = await api.deleteAlias(name, aliasScope, localPath);

            if ('success' in result && !result.success) {
                throw new Error((result as any).error || 'Failed to delete alias');
            }

            await fetchAliases();
        },
        [fetchAliases],
    );

    return {
        aliases,
        loading,
        error,
        scope,
        setScope,
        fetchAliases,
        addAlias,
        updateAlias,
        deleteAlias,
    };
}
