/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-vscode-theme-kind*="dark"]'],
  content: [
    './src/webview/**/*.{html,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        vscode: {
          bg: 'var(--vscode-editor-background)',
          fg: 'var(--vscode-editor-foreground)',
          card: 'var(--vscode-sideBar-background)',
          border: 'var(--vscode-widget-border, var(--vscode-sideBarSectionHeader-border))',
          accent: 'var(--vscode-button-background)',
          accentHover: 'var(--vscode-button-hoverBackground)',
          muted: 'var(--vscode-descriptionForeground)'
        }
      }
    }
  },
  plugins: []
};
