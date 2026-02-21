# GAM - User Manual

GAM (Git Alias Manager) is your dedicated centralized dashboard for commanding Git aliases.
This manual breaks down the system's core features step-by-step.

## 1. Navigating the Alias List

The core interface displays a data-table of all your tracked Git aliases.

![GAM Dashboard Dashboard Overview](screenshots/dashboard.png)

- **Global & Local Workspaces**: Using the toolbar pill-switch, you can view your `Global` aliases (stored in `~/.gitconfig`), your `Local` repository aliases (stored in your `.git/config`), or `All` concurrently.
- **Un-Selecting Constrained Folders**: By clicking the `[✕]` clear button right next to the active repository badge on the Toolbar, GAM will seamlessly unchain its active scope constraint and effortlessly multiplex _every_ cached Local Repository alias uniformly on the interface!
- **Historical Telemetry Ranking (⭐)**: Clicking the `⭐` column inside the table headers natively triggers the Rank Sorting engine. GAM will securely process your OS Shell history (`~/.zsh_history`) to statistically rank your most executed commands and drift them dynamically to the top over time.
- **Searching**: Use the top-right search box (Shortcut `⌘+F` or `Ctrl+F`) to instantly filter the list by Alias Name or Command string.
- **Clickable Scope Links**: Every Local alias in the table displays its target repository name in the Scope column. Clicking the name natively opens that folder inside your OS (like macOS Finder).

## 2. Creating & Editing Aliases

To mount new aliases, click the **+ Add Alias** button in the Toolbar.

![GAM Alias Creation Form with Suggestion Chips](screenshots/alias-form.png)

- **Command Input**: Write out your full Git command minus the keyword `git`. GAM's intelligent live preview shows you exactly how the final call translates.
- **Alias Naming**: Pick a fast shortcut to execute it natively.
- **Intelligent Suggestions**: As you type out a complex Git Command, GAM automatically suggests robust names via five generation algorithms (Semantic Analysis, Abbreviation parsing, Vowel stripping, Acronyms, and Truncation). Click any Suggestion Pill to adopt it.
- **Safe Evaluation**: The dashboard will block you from assigning dangerous OS shell operations like `rm -rf` inside Git strings.

### Duplicating Instead of Overriding

If you open a `Global` Alias via the **Edit (Pencil)** icon, and change the radio-target scope to `Local`, clicking save will safely spawn a _duplicate_ bound to the Local repository context instead of overriding your universal configuration.

## 2.5 Alias Library

Don't know what aliases to create? GAM ships with **270+ predefined Git aliases** from the [GitAlias](https://github.com/GitAlias/gitalias) open-source project.

- **Browse Library**: Click the **📚 Browse Alias Library** button in the Create/Edit form to open the library picker.
- **Search**: Type in the search box to filter aliases by name, command, or description.
- **Category Chips**: Click category chips (e.g. `branch`, `commit`, `log`, `workflow`) to filter by function area.
- **One-Click Selection**: Click any alias card to populate both the command and name fields. The name remains editable so you can customize it.
- **Multi-Line Commands**: The command field is a textarea that supports multi-line commands — useful for complex shell-function aliases from the library.

## 3. Data Portability

GAM ensures your configurations are portable.

- Using the **Data Dropdown** in the Navbar, you can **Export** your entire workspace of aliases into a structured `.json` file schema.
- To sync up your new workstation, click **Import** to ingest raw `.json` maps.

## 4. Light/Dark Mode

Clicking the Sun/Moon icon on the Titlebar toggles the dashboard aesthetics smoothly between the neon-styled premium Dark Theme glassmorphism shell and a readable Light Theme.

---

## 🍌 Support

If GAM saves you time and brainpower, consider fueling its development with a banana!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Banana" height="50">](https://buymeacoffee.com/zintaen)

Or scan the QR Code below:

<img src="screenshots/buy-me-a-coffee.png" alt="Buy Me A Banana QR" width="200" style="border-radius: 12px; margin-top: 10px;">
