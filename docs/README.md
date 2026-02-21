<div align="center">

# GAM — Git Alias Manager

**A professional desktop GUI for managing Git aliases across Windows, Linux, and macOS.**

[![GitHub Stars](https://img.shields.io/github/stars/zintaen/gam?style=social)](https://github.com/zintaen/gam)

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron-47848F.svg?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)

<br/>

<img src="screenshots/dashboard.png" width="720" alt="GAM Dashboard" />

</div>

---

## ✨ Features

| Feature                           | Description                                                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 🔍 **Searchable Alias List**      | Sort by name, command, or scope. Filter with ⌘F instant search.                                                                           |
| 🏆 **Usage Ranking**              | Aliases ranked by a smart scoring algorithm — prioritizes recently and frequently used commands.                                          |
| 📚 **Alias Library**              | Browse 270+ predefined aliases from [GitAlias](https://github.com/GitAlias/gitalias). Search, filter by category, and add with one click. |
| 💡 **Alias Suggestions**          | Auto-generates alias name candidates using 5 intelligent schemes when creating new aliases.                                               |
| ✏️ **Create & Edit**              | Modal form with real-time validation, live command preview, and smart suggestions.                                                        |
| 🗑 **Safe Delete**                | Confirmation dialog before every destructive action.                                                                                      |
| ⚠️ **Dangerous Command Warnings** | Flags `push --force`, `rm -rf`, `reset --hard`, and shell aliases.                                                                        |
| 🌐 **Scope Toggle**               | Switch between Global, Local, and All scopes.                                                                                             |
| 📦 **Import / Export**            | Share alias collections as JSON files.                                                                                                    |
| 🛡 **Auto-Backup**                | Backs up `~/.gitconfig` before every write operation.                                                                                     |
| ⌨️ **Keyboard Shortcuts**         | ⌘F to search, Escape to close modals.                                                                                                     |
| 🚀 **Ultra Modern UI**            | Deep space gradients, dynamic glassmorphism, animated glow effects, and smooth micro-animations.                                          |

---

## 🧠 Ranking Algorithm

GAM uses a scoring algorithm (inspired by [alman](https://github.com/vaibhav-mattoo/alman/)) to rank aliases by how useful they are to you:

```
Score = TimeMultiplier × Length^(3/5) × Frequency
```

### Time-Based Multipliers

| Recency  | Multiplier |
| -------- | ---------- |
| ≤ 1 hour | 4.0×       |
| ≤ 1 day  | 2.0×       |
| ≤ 1 week | 0.5×       |
| > 1 week | 0.25×      |

- **Frequency** — More frequently used aliases score higher
- **Recency** — Recently used aliases get a significant boost
- **Length** — Longer commands score slightly higher (saving more keystrokes)
- **Auto-Reset** — When total score exceeds 70,000, all frequencies are halved to prevent inflation

Toggle between **A-Z** (alphabetical) and **🏆 Rank** sorting in the alias list. Usage is tracked automatically when you copy an alias command.

---

## 🎯 Alias Suggestion Schemes

When creating a new alias, type your command first and GAM will suggest alias names using 5 intelligent strategies:

| Scheme                    | Example             | Result              |
| ------------------------- | ------------------- | ------------------- |
| 🎯 **Semantic**           | `checkout`          | `co`                |
| ✂️ **Abbreviation**       | `log oneline graph` | `log`               |
| 🔤 **Vowel Removal**      | `checkout`          | `chc`               |
| 🔡 **First-Letter Combo** | `checkout branch`   | `cbranch`           |
| 📏 **Smart Truncation**   | `checkout`          | `ch`, `che`, `chec` |

Suggestions automatically filter out names that conflict with your existing aliases and are sorted by effectiveness. Click any suggestion chip to use it.

---

## 📸 Screenshots

<div align="center">

| Dashboard                                           | Create Alias                                         |
| --------------------------------------------------- | ---------------------------------------------------- |
| <img src="screenshots/dashboard.png" width="400" /> | <img src="screenshots/alias-form.png" width="400" /> |

</div>

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 24.0.0
- [pnpm](https://pnpm.io/) >= 10.x
- [Git](https://git-scm.com/) installed and on `PATH`

### Installation

```bash
# Clone the repository
git clone https://github.com/zintaen/gam.git
cd gam

# Install dependencies
pnpm install

# Start the app in development mode
pnpm dev
```

The Electron window opens automatically.

---

## 🧪 Testing

```bash
# Run all tests (82 tests)
pnpm test

# Run with coverage report
pnpm test -- --coverage

# Run in watch mode
pnpm test:watch
```

**Test coverage (8 suites, 82 tests):**

| Suite                        | Tests | Covers                                                   |
| ---------------------------- | ----- | -------------------------------------------------------- |
| `git-service.test.ts`        | 18    | Alias parsing, command/name validation                   |
| `types.test.ts`              | 7     | TypeScript interface verification                        |
| `suggestion-service.test.ts` | 18    | All 5 suggestion schemes, conflict filtering, edge cases |
| `gitalias-library.test.ts`   | 11    | Library data integrity, search, category filtering       |
| `file-service.test.ts`       | 5     | JSON import and export flows                             |
| `App.test.tsx`               | 2     | Main application integration layout                      |
| `AliasForm.test.tsx`         | 13    | Form validation, library picker, textarea, edit mode     |
| `AliasList.test.tsx`         | 6     | Table rendering, sort/filter logic, scope interactions   |

---

## 🏗 Architecture

```
gam/
├── electron/                # Electron main process
│   ├── main.ts              # Window creation, app lifecycle
│   ├── preload.ts           # Secure IPC bridge (contextBridge)
│   ├── ipc-handlers.ts      # IPC channel registry
│   └── services/
│       ├── git-service.ts   # Git config CLI wrapper (CRUD)
│       ├── backup-service.ts # .gitconfig backup/restore
│       └── file-service.ts  # JSON import/export
├── src/                     # React renderer process
│   ├── App.tsx              # Main app shell
│   ├── index.css            # Design system (notebook theme, micro-animations)
│   ├── components/
│   │   ├── AliasList.tsx    # Sortable table (A-Z / Rank modes)
│   │   ├── AliasForm.tsx    # Create/edit with suggestion chips & library picker
│   │   ├── AliasLibraryPicker.tsx # Browse & search 270+ predefined aliases
│   │   ├── SuggestionChips.tsx # Clickable alias name suggestions
│   │   ├── SearchBar.tsx    # Instant search
│   │   ├── Toolbar.tsx      # Scope toggle & actions
│   │   ├── ConfirmDialog.tsx # Deletion confirmation
│   │   ├── StatusBar.tsx    # Footer status
│   │   └── Toast.tsx        # Notifications
│   ├── services/
│   │   ├── suggestion-service.ts  # Alias name generation
│   │   └── gitalias-library.ts    # 270+ predefined aliases from GitAlias
│   ├── hooks/               # React hooks
│   └── types/               # Shared TypeScript types
├── electron/
│   └── services/
│       ├── git-service.ts       # Git CLI operations
│       ├── file-service.ts      # Import/export file I/O
│       └── ranking-service.ts   # Usage scoring & ranking
└── tests/                   # Unit tests (Vitest)
```

### How It Works

GAM delegates all Git operations to the `git config` CLI rather than manually parsing `.gitconfig` files. This approach is:

- **Reliable** — Git handles all parsing edge cases (includes, conditionals)
- **Safe** — Uses `execFile` (not `exec`) to prevent command injection
- **Isolated** — Renderer process has no direct Node.js access (`contextIsolation: true`)

The suggestion service runs in the renderer process. The ranking and git services run in the main Electron process with secure IPC bridging.

---

## 📚 Documentation

| Document                                   | Description                                            |
| ------------------------------------------ | ------------------------------------------------------ |
| 📖 [User Manual](./MANUAL.md)              | Full walkthrough of every feature                      |
| 📋 [Changelog](./CHANGELOG.md)             | Version history and release notes                      |
| 🚀 [Releasing](./RELEASING.md)             | Build scripts, CI/CD pipeline, and release checklist   |
| 🤝 [Contributing](./CONTRIBUTING.md)       | How to contribute, coding standards, and PR guidelines |
| 📜 [Code of Conduct](./CODE_OF_CONDUCT.md) | Community expectations                                 |

---

## 🍌 Support

If GAM saves you time and brainpower, give it a star on [GitHub](https://github.com/zintaen/gam), and consider fueling its development with a banana!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Banana" height="50">](https://buymeacoffee.com/zintaen)

Or scan the QR Code:

<img src="screenshots/buy-me-a-coffee.png" alt="Buy Me A Banana QR" width="200" style="border-radius: 12px;">

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) — Cross-platform desktop framework
- [React](https://react.dev/) — UI component library
- [Vite](https://vite.dev/) — Lightning-fast dev server
- [Vitest](https://vitest.dev/) — Unit testing framework
- [GitAlias](https://github.com/GitAlias/gitalias) — Curated collection of 270+ Git aliases powering the Alias Library
- [alman](https://github.com/vaibhav-mattoo/alman/) — Inspiration for ranking algorithm & alias suggestion schemes

---
