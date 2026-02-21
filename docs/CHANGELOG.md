# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-02-20

### Added

- **Alias Library** — Browse 270+ predefined Git aliases from [GitAlias/gitalias](https://github.com/GitAlias/gitalias) directly inside the Create/Edit form.
- **Library Picker UI** — Searchable, category-filterable modal with animated alias cards matching the notebook aesthetic.
- **Multi-Line Command Support** — Command field uses a `<textarea>` to accommodate complex shell-function aliases.
- **Alias Suggestions** — 5 intelligent schemes (semantic, abbreviation, vowel removal, first-letter combination, smart truncation) generate alias name candidates when creating new aliases.
- **Suggestion Chips UI** — Clickable pill-shaped chips in the Create Alias form showing suggested names with scheme icons.
- **Conflict Detection** — Suggestions automatically filter out names already taken by existing aliases.
- **Telemetry Ranking (⭐)** — Natively processes `~/.zsh_history` and `~/.bash_history` on Mac/Linux to statistically rank your most frequently utilized Git aliases. Toggle the ranking column globally!
- **Multi-Repository Tracking** — The `All` Scope now correctly multiplexes Local aliases entirely, interpolating their target repositories explicitly onto the table scopes.
- **Clear Active Folder** — Use the `[✕]` toggle on the Toolbar to safely deselect your targeted repository to fluidly pull from the global workspace without bounds.
- **Alias Management** — Create, edit, and delete Git aliases through a professional GUI.
- **Searchable List** — Sortable table with instant filtering by name or command.
- **Scope Toggle** — Switch between Global, Local, and All alias scopes.
- **Clickable Folders** — Natively open specific Local Repositories directly to macOS/OSX Finder via clickable scope badges.
- **Duplicate Safety** — Modifying a Global Alias and re-assigning it to Local space natively registers as a duplication to protect the original configuration.
- **Command Validation** — Real-time warnings for dangerous patterns (`push --force`, `rm -rf`, `reset --hard`, shell commands).
- **Live Preview** — See the resulting `git <alias>` command as you type.
- **Import / Export** — Share alias collections as JSON files with schema validation.
- **Documentation Suite** — Comprehensive `docs/` repository including a User Manual, Changelog, Contributing guidelines, and Release guide.
- **Premium UI** — Glassmorphism, gradient accents, smooth micro-animations, Inter + JetBrains Mono typography with a fluid Light/Dark mode switcher.
- **Responsive Fluidity** — Complete modal and dialog scaling functionality to prevent truncation on 13" laptop screens.
- **Keyboard Shortcuts** — ⌘F to search, Escape to close modals.
- **Security** — Context isolation, no Node integration in renderer, `execFile` for all subprocess calls.
- **Unit Tests** — 82 tests across 8 suites covering GitService, suggestions, alias library, components, and type definitions.

### Changed

- **Create Alias Form** — Command field now appears above the name field so suggestions can react to command input. "📚 Browse Alias Library" button added above command/name fields.
- **UX Scopes** — Removed tracking metrics and auto-backups out of core Electron binary to simplify release vector.

### New Files

- `src/services/gitalias-library.ts` — 270+ aliases embedded as static data with search, category, and get-all APIs
- `src/components/AliasLibraryPicker.tsx` — Library picker modal component
- `src/services/suggestion-service.ts` — 5 suggestion schemes with priority ranking
- `src/components/SuggestionChips.tsx` — Suggestion chip UI component
- `tests/gitalias-library.test.ts` — Library service unit tests
- `tests/suggestion-service.test.ts` — 18 tests for suggestion service

---

## 🍌 Support

If GAM saves you time and brainpower, consider fueling its development with a banana!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Banana" height="50">](https://buymeacoffee.com/zintaen)

Or scan the QR Code:

<img src="screenshots/buy-me-a-coffee.png" alt="Buy Me A Banana QR" width="200" style="border-radius: 12px;">
