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

## 🏷️ Publishing Releases on GitHub with Versioning & Git Tags

The repository includes an automated GitHub Actions workflow (`.github/workflows/release.yml`) that compiles `.dmg` and `.exe` binaries whenever a version tag starting with `v` (e.g. `v1.0.1`, `v1.0.2`) is pushed to GitHub.

### 📋 Complete Release Workflow:

#### Step 1: Bump Version in Code
Ensure the version string matches in both `package.json` and `src-tauri/tauri.conf.json`:
- `package.json`: `"version": "1.0.2"`
- `src-tauri/tauri.conf.json`: `"version": "1.0.2"`

#### Step 2: Commit Version Changes
```bash
git add package.json src-tauri/tauri.conf.json
git commit -m "Bump version to 1.0.2"
git push origin main
```

#### Step 3: Create & Push Git Tag
```bash
# Create local version tag
git tag v1.0.2

# Push tag to GitHub (Triggers automated build & release)
git push origin v1.0.2
```

#### Step 4: Automatic GitHub Release Build
- GitHub Actions will kick off two parallel runners (`macos-latest` & `windows-latest`).
- Within 3–5 minutes, a new release **`Restly v1.0.2`** will automatically be published under **Releases** on your GitHub repository with `Restly_1.0.2_aarch64.dmg` and `Restly_1.0.2_x64-setup.exe` attached!

---

### 🔖 Handy Git Tag Management Commands

| Action | Command |
| :--- | :--- |
| **List all existing tags** | `git tag -l` |
| **Create a new tag** | `git tag v1.0.2` |
| **Push tag to GitHub** | `git push origin v1.0.2` |
| **Delete local tag** | `git tag -d v1.0.2` |
| **Delete remote tag on GitHub** | `git push origin :refs/tags/v1.0.2` |
| **Re-create & push updated tag** | `git tag -d v1.0.2 && git push origin :refs/tags/v1.0.2 && git tag v1.0.2 && git push origin v1.0.2` |

#### 🗑️ How to Delete a Tag Completely (Local & Remote GitHub)
If you created a tag by mistake and want to delete it from both your local computer and GitHub:
```bash
# 1. Delete local tag
git tag -d v1.0.2

# 2. Delete remote tag on GitHub
git push origin :refs/tags/v1.0.2
```

#### 🔄 How to Update a Tag & Re-trigger GitHub Actions
If you pushed a release tag, fixed a bug, and want GitHub Actions to rebuild and replace the release assets for the same version:
```bash
# Delete local and remote tag, re-tag current commit, and push back to GitHub
git tag -d v1.0.2 && git push origin :refs/tags/v1.0.2 && git tag v1.0.2 && git push origin v1.0.2
```

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
