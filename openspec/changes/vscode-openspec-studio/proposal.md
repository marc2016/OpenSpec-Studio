# Proposal: VS Code Extension OpenSpec Studio

## Why

OpenSpec manages specification-driven workflows and changes via a CLI and markdown files. However, developers working inside VS Code currently have to switch to the terminal or manually browse files to track change progress, inspect specs, and run workflow phases.

OpenSpec Studio brings OpenSpec natively into VS Code through an interactive, visual dashboard inside an editor tab. It detects whether a project uses OpenSpec, provides guided onboarding and initialization when it does not, visually presents active changes, archived history, and durable specs, and seamlessly connects workflow actions to AI coding assistants (such as GitHub Copilot, Roo Code/Cline, and terminal agents).

## What Changes

- Add a VS Code extension package (`vscode-openspec-studio`) containing extension host logic and a modern React + shadcn/ui webview.
- Add automatic workspace detection for `./openspec/` directories with an Onboarding screen when absent.
- Provide a full-featured Studio Dashboard in an editor tab (`WebviewPanel`) showing:
  - Active changes with task progress bars, artifacts, and direct AI actions.
  - Durable capability specs explorer (specs, requirements, scenarios).
  - Archived changes history.
- Provide top workflow action buttons (`Propose`, `Explore`, `Apply`, `Sync`, `Archive`) integrated with a Multi-AI Dispatcher (GitHub Copilot Chat query, terminal agent, or clipboard fallback).
- Provide a dual CLI adapter supporting local `./node_modules/.bin/openspec`, global `openspec` binary, and `npx openspec` fallback with one-click project initialization and installation.

## Capabilities

### New Capabilities
- `workspace-detector`: Detect presence of OpenSpec directory in active workspace, track file system changes to update dashboard state reactively, and render onboarding state if uninitialized.
- `studio-dashboard`: Editor-tab webview dashboard built with React and shadcn/ui displaying active changes, progress metrics, durable specs, and change archives.
- `workflow-orchestrator`: Execute OpenSpec workflow actions and dispatch prompts/commands to multiple AI assistants (GitHub Copilot, terminal agents, clipboard).
- `cli-adapter`: Resolve, execute, and install OpenSpec CLI via local binary, global PATH, or npx fallback.

### Modified Capabilities
<!-- None: This is the initial capability set for the OpenSpec Studio VS Code extension. -->

## Impact
- Creates the VS Code extension architecture (manifest, extension host, webview build pipeline with Vite, React, Tailwind CSS, and shadcn/ui).
- Integrates with VS Code Chat API (`workbench.action.chat.open`) and terminal execution.
- No breaking changes to existing OpenSpec CLI or schemas.
