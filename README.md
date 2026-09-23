# OpenSpec Studio for VS Code

[![CI](https://github.com/marc2016/OpenSpec-Studio/actions/workflows/ci.yml/badge.svg)](https://github.com/marc2016/OpenSpec-Studio/actions/workflows/ci.yml)
[![Release](https://github.com/marc2016/OpenSpec-Studio/actions/workflows/release.yml/badge.svg)](https://github.com/marc2016/OpenSpec-Studio/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Interactive visual dashboard and multi-AI workflow studio for [OpenSpec](https://github.com/FauxPilot/openspec) in VS Code.

## Features

- 📊 **Interactive Studio Dashboard**: Full editor-tab dashboard presenting active changes, task checklists, progress metrics, and durable specifications.
- ⚡ **Multi-AI Workflow Dispatcher**: Trigger OpenSpec workflows (`Propose`, `Explore`, `Apply`, `Sync`, `Archive`) directly into GitHub Copilot Chat, the integrated terminal, or clipboard.
- 🚀 **Automated Workspace Detection & Onboarding**: Automatically detects `openspec/` directories or guides you through 1-click initialization and local CLI installation.
- 📖 **Durable Specs Explorer**: Browse system capabilities, requirements, and scenarios in a structured view.
- 🗄️ **Archived History**: Keep track of archived changes and milestones.

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run **`OpenSpec: Open Studio Dashboard`**.
3. Or click **OpenSpec Studio** in the Activity Bar or Status Bar.

## Development

```bash
# Install dependencies
npm install

# Compile extension and webview
npm run build

# Run unit tests
npm test

# Package VSIX
npm run package
```

## License

MIT © [Marc Lammers](https://github.com/marc2016)
