# Design: VS Code Extension OpenSpec Studio

## Context

See [proposal.md](proposal.md) for motivation and [specs/](specs/) for normative requirements.
The goal is to provide an integrated development experience for OpenSpec directly within VS Code, leveraging the OpenSpec CLI's `--json` interface and presenting state through a modern React + shadcn/ui interface.

## Goals / Non-Goals

**Goals:**
- Provide a responsive, accessible React-based dashboard inside a full VS Code editor tab (`WebviewPanel`).
- Keep dashboard state automatically synchronized with the file system using `vscode.workspace.createFileSystemWatcher`.
- Detect OpenSpec presence and provide a clear onboarding experience when absent.
- Provide a flexible CLI resolution mechanism (local `node_modules`, global PATH, `npx` fallback).
- Enable seamless multi-AI dispatching for OpenSpec workflows (GitHub Copilot Chat, Terminal agent, clipboard fallback).

**Non-Goals:**
- Reimplement OpenSpec CLI domain logic inside TypeScript (the extension consumes OpenSpec CLI output and standard markdown files).
- Host or run standalone LLM models directly inside the extension.

## Decisions

### 1. Editor Tab WebviewPanel (`retainContextWhenHidden: true`)
- **Decision**: Render the primary studio dashboard in a VS Code `WebviewPanel` (editor tab), accessible via status bar item, activity bar command, and command palette. Enable `retainContextWhenHidden: true`.
- **Rationale**: A full editor tab provides sufficient screen space for multi-column layouts, progress bars, and spec inspection. Retaining context avoids re-rendering and losing user scroll/expansion state when switching between code files and the dashboard.
- **Alternatives considered**: Sidebar WebviewView (too narrow for detailed change cards, task lists, and spec hierarchies).

### 2. Frontend Tech Stack: Vite + React + shadcn/ui + Tailwind CSS
- **Decision**: Build the webview application using React 18, Vite as the bundler, Tailwind CSS for styling, and shadcn/ui component patterns (Radix UI primitives).
- **Rationale**: Vite compiles single-bundle assets quickly for VS Code webview consumption with minimal boilerplate. shadcn/ui provides clean, accessible, dark/light theme-aware components that seamlessly match VS Code styling.
- **Alternatives considered**: Vanilla JS / HTML (hard to manage complex interactive state), VS Code Webview UI Toolkit (less flexible and active compared to modern Tailwind/shadcn).

### 3. Bidirectional Typed IPC Bridge
- **Decision**: Define a strongly typed message protocol between the VS Code Extension Host (Node.js) and the React Webview:
  - Host $\rightarrow$ Webview: `StateUpdateMessage` (active changes, specs, archive, CLI status, config), `ToastMessage`.
  - Webview $\rightarrow$ Host: `InitProjectMessage`, `InstallCliMessage`, `RunWorkflowMessage`, `OpenFileMessage`, `SetAiTargetMessage`.
- **Rationale**: Isolates Node.js file system/CLI operations from the browser webview sandbox, maintaining security and predictability.

### 4. Hierarchical CLI Adapter
- **Decision**: Implement a resolution chain:
  1. Workspace local: `<root>/node_modules/.bin/openspec`
  2. Global binary: `which openspec` / PATH
  3. Fallback: `npx --yes openspec`
- **Rationale**: Guarantees zero-config execution even on fresh machines with Node.js installed, while preferring fast local/global binaries when available.

### 5. Multi-AI Target Dispatcher
- **Decision**: Abstract AI interactions into a dispatcher with three primary channels:
  - **GitHub Copilot Chat**: Executes `workbench.action.chat.open` with prefilled prompt strings (e.g. `/opsx-propose ...`, `/opsx-apply <change>`).
  - **Integrated Terminal**: Spawns an interactive terminal for CLI-based agents.
  - **Clipboard Fallback**: Writes prompt to clipboard via `vscode.env.clipboard.writeText` and shows a confirmation toast.
- **Rationale**: Accommodates developers using GitHub Copilot as well as alternative agents (Roo Code, Claude, Aider, Antigravity) without lock-in.

## Risks / Trade-offs

- **[Risk]** GitHub Copilot Chat command `workbench.action.chat.open` may vary across VS Code versions or Copilot extension states.
  - $\rightarrow$ *Mitigation*: Wrap command execution in a try-catch block; if unavailable or Copilot is not installed, automatically fall back to copying the prompt to the clipboard with a user toast.
- **[Risk]** First run of `npx openspec` can introduce latency due to package downloading.
  - $\rightarrow$ *Mitigation*: Show an inline loading skeleton/spinner in the UI and suggest installing `openspec` as a local dev dependency for instant execution.
- **[Risk]** Large workspaces with deep folder structures could slow down file watching.
  - $\rightarrow$ *Mitigation*: Restrict `FileSystemWatcher` specifically to `${workspaceFolder}/openspec/**`.
