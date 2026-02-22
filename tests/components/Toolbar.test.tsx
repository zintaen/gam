import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Toolbar } from '#/components/Toolbar';

describe('toolbar', () => {
    const mockHandlers = {
        onScopeChange: vi.fn(),
        onAdd: vi.fn(),
        onImport: vi.fn(),
        onExport: vi.fn(),
        onSelectFolder: vi.fn(),
        onClearFolder: vi.fn(),
    };

    const defaultProps = {
        scope: 'global' as const,
        aliasCount: 5,
        ...mockHandlers,
    };

    it('renders scope tabs (All, Global, Local)', () => {
        render(<Toolbar {...defaultProps} />);
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('🌐 Global')).toBeInTheDocument();
        expect(screen.getByText('📁 Local')).toBeInTheDocument();
    });

    it('renders New Alias button', () => {
        render(<Toolbar {...defaultProps} />);
        expect(screen.getByText('New Alias')).toBeInTheDocument();
    });

    it('calls onScopeChange when switching tabs', async () => {
        render(<Toolbar {...defaultProps} />);
        const user = userEvent.setup();
        await user.click(screen.getByText('All'));
        expect(mockHandlers.onScopeChange).toHaveBeenCalledWith('all');
    });

    it('calls onAdd when New Alias is clicked', async () => {
        render(<Toolbar {...defaultProps} />);
        const user = userEvent.setup();
        await user.click(screen.getByText('New Alias'));
        expect(mockHandlers.onAdd).toHaveBeenCalled();
    });

    it('shows Data dropdown menu with Import and Export', async () => {
        render(<Toolbar {...defaultProps} />);
        const user = userEvent.setup();
        await user.click(screen.getByText(/Data/));
        expect(screen.getByText('↓ Import')).toBeInTheDocument();
        expect(screen.getByText('↑ Export')).toBeInTheDocument();
    });

    it('calls onImport when Import is clicked from dropdown', async () => {
        render(<Toolbar {...defaultProps} />);
        const user = userEvent.setup();
        await user.click(screen.getByText(/Data/));
        await user.click(screen.getByText('↓ Import'));
        expect(mockHandlers.onImport).toHaveBeenCalled();
    });

    it('calls onExport when Export is clicked from dropdown', async () => {
        render(<Toolbar {...defaultProps} />);
        const user = userEvent.setup();
        await user.click(screen.getByText(/Data/));
        await user.click(screen.getByText('↑ Export'));
        expect(mockHandlers.onExport).toHaveBeenCalled();
    });

    it('disables Export when alias count is 0', async () => {
        render(<Toolbar {...defaultProps} aliasCount={0} />);
        const user = userEvent.setup();
        await user.click(screen.getByText(/Data/));
        const exportBtn = screen.getByText('↑ Export');
        expect(exportBtn).toBeDisabled();
    });

    it('shows folder selector UI when scope is local', () => {
        render(<Toolbar {...defaultProps} scope="local" localPath="/my/repo" />);
        expect(screen.getByText('repo')).toBeInTheDocument();
    });

    it('does not show folder selector when scope is global', () => {
        render(<Toolbar {...defaultProps} scope="global" />);
        expect(screen.queryByTitle('Select folder')).not.toBeInTheDocument();
    });

    it('calls onClearFolder when clear button is clicked in local scope', async () => {
        render(<Toolbar {...defaultProps} scope="local" localPath="/my/repo" />);
        const user = userEvent.setup();
        const clearBtn = screen.getByTitle('Clear folder filter');
        await user.click(clearBtn);
        expect(mockHandlers.onClearFolder).toHaveBeenCalled();
    });

    it('calls onSelectFolder when folder icon is clicked', async () => {
        render(<Toolbar {...defaultProps} scope="local" />);
        const user = userEvent.setup();
        const selectBtn = screen.getByTitle('Select folder');
        await user.click(selectBtn);
        expect(mockHandlers.onSelectFolder).toHaveBeenCalled();
    });
});
