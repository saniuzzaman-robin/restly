# Restly — Modern API Workspace & Client

**Restly** is a fast, modern, light/dark themed API workspace & client built with React 19, Vite, and Tauri v2. Sync your collections directly with Google Drive or run locally as a native desktop application with zero CORS restrictions.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Rust**: Installed via `rustup` for desktop builds (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)

### Web Development
```bash
# 1. Install dependencies
npm install

# 2. Start local web dev server
npm run dev

# 3. Build production web bundle
npm run build
```

---

## 💻 Native Desktop Application (Tauri v2)

Restly runs as a native cross-platform desktop application on **macOS** and **Windows**.

### Live Desktop Development
```bash
npm run tauri:dev
```
This compiles the Rust backend and launches Restly in a native desktop window with live reload enabled.

---

## 📦 Exporting Desktop Installers (`.dmg` & `.exe`)

To compile standalone native installer packages for macOS and Windows, run:

```bash
npm run tauri:build
```

### 🍏 Exporting macOS `.dmg` & `.app`
Run `npm run tauri:build` on a **macOS machine**. Tauri will bundle your app into native macOS binaries:

- **`.dmg` Installer**: `src-tauri/target/release/bundle/dmg/Restly_1.0.0_x64.dmg` *(or `aarch64` for Apple Silicon)*
- **`.app` Executable**: `src-tauri/target/release/bundle/macos/Restly.app`

### 🪟 Exporting Windows `.exe` & `.msi`
Run `npm run tauri:build` on a **Windows machine** *(or via a Windows CI runner)*. Tauri will generate:

- **`.exe` NSIS Installer**: `src-tauri/target/release/bundle/nsis/Restly_1.0.0_x64-setup.exe`
- **`.msi` Windows Installer**: `src-tauri/target/release/bundle/msi/Restly_1.0.0_x64_en-US.msi`

> 💡 **Cross-Platform Building Tip**: To build both `.dmg` and `.exe` binaries automatically without owning both OS machines, use **GitHub Actions**. On every tag release, GitHub Actions builds macOS (`macos-latest`) and Windows (`windows-latest`) installers in parallel and attaches them directly to your GitHub Releases page!

---

## 🏷️ Publishing Releases on GitHub with Versioning

The repository includes an automated GitHub Actions workflow (`.github/workflows/release.yml`) that compiles `.dmg` and `.exe` binaries whenever a version tag is pushed.

### How to Create & Publish a Versioned Release:

1. **Update Version** in `package.json` and `src-tauri/tauri.conf.json` (e.g. `"1.0.0"` -> `"1.0.1"`).
2. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Release v1.0.1"
   ```
3. **Create & Push Version Tag**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. **Automatic Build & Release**:
   - GitHub Actions will kick off two parallel runners: `macos-latest` (building `.dmg` and `.app`) and `windows-latest` (building `.exe` and `.msi`).
   - Within 3 to 5 minutes, a new release named **`Restly v1.0.1`** will automatically appear under **Releases** on your GitHub repository with all download links attached!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd` / `Ctrl` + `N` | Open **New Request Tab** |
| `Cmd` / `Ctrl` + `W` | **Close Current Active Tab** |
| `Cmd` / `Ctrl` + `Enter` | **Send Active API Request** |
| `Cmd` / `Ctrl` + `S` | **Save Request** to Collection |
| `Cmd` / `Ctrl` + `K` *(or `L`)* | **Focus URL Address Bar** & highlight text |
| `Cmd` / `Ctrl` + `Shift` + `I` | Open **cURL Import Modal** |
| `Cmd` / `Ctrl` + `+` | **Zoom In** |
| `Cmd` / `Ctrl` + `-` | **Zoom Out** |
| `Cmd` / `Ctrl` + `0` | **Reset Zoom (100%)** |

---

## 🛠️ Features

- 📑 **Multi-Tab Workspace**: Work with multiple API requests simultaneously.
- 🎨 **Sleek Light & Dark Themes**: Hand-crafted dark/light theme tokens with smooth transitions.
- ☁️ **Google Drive Workspace Sync**: Directly back up and restore your collections, environments, tabs, and history to your private Google Drive (`appDataFolder`).
- 🚫 **Zero CORS Blocks**: Desktop mode bypasses browser CORS restrictions so you can query any localhost or external API.
- 📜 **cURL & Code Generator**: Paste cURL strings directly into the URL bar or inline import panel, and export snippets in Fetch, Axios, Python, and Curl.
