# Release Process

This document describes how to build and release GAM as a desktop application.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 24.0.0
- [pnpm](https://pnpm.io/) >= 10.x
- [Git](https://git-scm.com/) installed and on `PATH`
- GitHub repository push access (for tagging and CI)

## Build Scripts

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `pnpm build`       | Build for the current platform (auto-detected)   |
| `pnpm build:mac`   | Build macOS `.dmg` installer                     |
| `pnpm build:win`   | Build Windows `.exe` (NSIS installer + portable) |
| `pnpm build:linux` | Build Linux `.AppImage`                          |
| `pnpm build:all`   | Build for all three platforms (`-mwl`)           |

> [!NOTE]
> Cross-platform builds have limitations. macOS `.dmg` can only be built on macOS. Windows and Linux builds can be cross-compiled in most cases, but native modules may require matching host OS.

## Local Build

To build the app locally for testing:

```bash
# Install dependencies
pnpm install

# Build for your current platform
pnpm build
```

The built artifacts are output to `release/<version>/`:

| Platform | Artifact                      |
| -------- | ----------------------------- |
| macOS    | `GAM-<version>-arm64-mac.dmg` |
| Windows  | `GAM-<version>-Setup.exe`     |
| Linux    | `GAM-<version>.AppImage`      |

## Automated Release (CI/CD)

GAM uses a two-step release process: a local script triggers the release, and GitHub Actions builds the artifacts.

### Step 1 — Run the release script

```bash
# Patch release (1.0.0 → 1.0.1)
pnpm release

# Minor release (1.0.0 → 1.1.0)
pnpm release minor

# Major release (1.0.0 → 2.0.0)
pnpm release major
```

The `scripts/release.js` script does the following automatically:

1. Bumps version in `package.json` (no git tag yet)
2. Generates a changelog entry from recent commits
3. Commits the version bump and changelog
4. Creates a `v<version>` git tag
5. Pushes the commit and tag to `origin`

### Step 2 — GitHub Actions builds the release

Pushing a `v*` tag triggers the `.github/workflows/release.yml` workflow:

1. **Builds** the Electron app on all three platforms (`macos-latest`, `ubuntu-latest`, `windows-latest`)
2. **Publishes** the artifacts as a GitHub Release (`.dmg`, `.AppImage`, `.exe`)
3. **Updates Homebrew** — Bumps the `gam` cask in the `zintaen/homebrew-tap` repository

### Release artifacts

After CI completes, the GitHub Release page will contain:

| Platform | Files                   |
| -------- | ----------------------- |
| macOS    | `.dmg`, `.zip`          |
| Windows  | `.exe` (NSIS installer) |
| Linux    | `.AppImage`             |

## Manual / Pre-release Checklist

Before running `pnpm release`, ensure:

- [ ] All tests pass: `pnpm test`
- [ ] TypeScript compiles cleanly: `npx tsc --noEmit`
- [ ] Local build succeeds: `pnpm build`
- [ ] `docs/CHANGELOG.md` is up to date with notable changes
- [ ] No uncommitted changes: `git status` is clean

## Electron Builder Configuration

The build configuration lives in `package.json` under the `"build"` key:

```json
{
    "build": {
        "appId": "com.github.zintaen.gam",
        "productName": "GAM",
        "asar": true,
        "compression": "maximum",
        "directories": {
            "output": "release/${version}"
        },
        "mac": { "target": ["dmg"] },
        "win": { "target": ["nsis", "portable"] },
        "linux": { "target": ["AppImage"] }
    }
}
```

## Homebrew Installation (macOS)

Once a release is published, macOS users can install via:

```bash
brew tap zintaen/tap
brew install --cask gam
```

---

## 🍌 Support

If GAM saves you time and brainpower, consider fueling its development with a banana!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Banana" height="50">](https://buymeacoffee.com/zintaen)

Or scan the QR Code:

<img src="screenshots/buy-me-a-coffee.png" alt="Buy Me A Banana QR" width="200" style="border-radius: 12px;">
