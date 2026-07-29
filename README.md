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

## 🛠️ Resolving "App is Damaged" on macOS (Gatekeeper Quarantine)

When installing locally built unsigned `.app` bundles on macOS, macOS Gatekeeper may show a warning saying:
> **"Restly.app is damaged and can't be opened. You should move it to the Trash."**

This is **not an app crash or code bug**. It occurs because local binaries are not signed with a paid Apple Developer certificate, causing macOS Gatekeeper to assign a `com.apple.quarantine` extended file attribute to the `.app` bundle.

### 💡 Quick Fix Command:
Run this command in your terminal to remove the Gatekeeper quarantine flag:

```bash
# Remove quarantine from installed app in /Applications
xattr -cr /Applications/Restly.app

# Or use the npm helper script:
npm run mac:unquarantine
```

After running this command, double-clicking **Restly.app** will launch smoothly with zero warnings!

---

## 🔄 Data Storage & Schema Migration

Restly includes automatic schema versioning (`restly_schema_version`) and response payload sanitization:

- **Automatic Migration**: `storage.js` runs `migrateAndCleanupStorage()` on boot to ensure stored tab state, collections, and environments match current schema definitions.
- **Quota Protection**: Heavy API response payloads (`rawText > 5KB`) stored in local history or open tabs are automatically sanitized to prevent `QuotaExceededError`.
- **Clean Slate Reset**: Invoke `clearAllStorage()` if you ever need to reset app cache and start with fresh initial defaults.

---

## 📦 Exporting Desktop Installers (`.dmg` & `.exe`)

To compile standalone native installer packages for macOS and Windows, run:

```bash
npm run tauri:build
```

### 🍏 Exporting macOS `.dmg` & `.app`
Run `npm run tauri:build` on a **macOS machine**. Tauri will bundle your app into native macOS binaries:

- **`.dmg` Installer**: `src-tauri/target/release/bundle/dmg/Restly_1.0.3_x64.dmg`
- **`.app` Executable**: `src-tauri/target/release/bundle/macos/Restly.app`

### 🪟 Exporting Windows `.exe` & `.msi`
Run `npm run tauri:build` on a **Windows machine**. Tauri will generate:

- **`.exe` NSIS Installer**: `src-tauri/target/release/bundle/nsis/Restly_1.0.3_x64-setup.exe`
- **`.msi` Windows Installer**: `src-tauri/target/release/bundle/msi/Restly_1.0.3_x64_en-US.msi`
