import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { RequestBuilder } from './components/RequestBuilder';
import { ResponseViewer } from './components/ResponseViewer';
import { SplitResizer } from './components/SplitResizer';
import { Footer } from './components/Footer';
import { EnvironmentModal } from './components/EnvironmentModal';
import { CodeSnippetModal } from './components/CodeSnippetModal';
import { CollectionModal } from './components/CollectionModal';
import { CurlImportModal } from './components/CurlImportModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ConsoleDrawer } from './components/ConsoleDrawer';
import { loadInitialState, saveStateItem, STORAGE_KEYS } from './utils/storage';
import { executeHttpRequest } from './utils/requestExecutor';
import { exportToPostmanFormat } from './utils/postmanFormat';
import {
  requestGoogleLogin,
  saveWorkspaceToGoogleDrive,
  loadWorkspaceFromGoogleDrive,
  GOOGLE_KEYS
} from './utils/googleDriveSync';

export default function App() {
  const [initialData] = useState(loadInitialState);

  const [collections, setCollections] = useState(initialData.collections);
  const [environments, setEnvironments] = useState(initialData.environments);
  const [activeEnvId, setActiveEnvId] = useState(initialData.activeEnvId);
  const [history, setHistory] = useState(initialData.history);

  const [tabs, setTabs] = useState(initialData.openTabs);
  const [activeTabId, setActiveTabId] = useState(initialData.activeTabId);

  // Console Logs State
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('restly_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('restly_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Zoom Level State (default 100%)
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('restly_zoom');
    return saved ? parseInt(saved, 10) : 100;
  });

  useEffect(() => {
    document.documentElement.style.zoom = `${zoomLevel}%`;
    localStorage.setItem('restly_zoom', zoomLevel.toString());
  }, [zoomLevel]);

  // Pane Resizing State
  const [requestPaneHeightPct, setRequestPaneHeightPct] = useState(48);

  // Modals state
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showCurlModal, setShowCurlModal] = useState(false);
  const [collectionModalMode, setCollectionModalMode] = useState(null); // 'create' | 'import' | null
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Google Auth & Drive Sync State
  const [googleUser, setGoogleUser] = useState(() => {
    try {
      const saved = localStorage.getItem(GOOGLE_KEYS.USER_PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [googleToken, setGoogleToken] = useState(() => {
    return localStorage.getItem(GOOGLE_KEYS.ACCESS_TOKEN) || null;
  });

  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem(GOOGLE_KEYS.LAST_SYNC) || null;
  });

  // Active Environment Variables
  const activeEnv = environments.find((e) => e.id === activeEnvId);
  const activeEnvVars = activeEnv?.variables || [];

  // Active Tab
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Save changes to LocalStorage
  useEffect(() => {
    saveStateItem(STORAGE_KEYS.COLLECTIONS, collections);
  }, [collections]);

  useEffect(() => {
    saveStateItem(STORAGE_KEYS.ENVIRONMENTS, environments);
  }, [environments]);

  useEffect(() => {
    saveStateItem(STORAGE_KEYS.ACTIVE_ENV_ID, activeEnvId);
  }, [activeEnvId]);

  useEffect(() => {
    saveStateItem(STORAGE_KEYS.HISTORY, history);
  }, [history]);

  useEffect(() => {
    saveStateItem(STORAGE_KEYS.OPEN_TABS, tabs);
  }, [tabs]);

  useEffect(() => {
    if (activeTabId) {
      saveStateItem(STORAGE_KEYS.ACTIVE_TAB_ID, activeTabId);
    }
  }, [activeTabId]);

  // Google OAuth Login
  const handleGoogleLogin = (clientId, callback) => {
    try {
      requestGoogleLogin(clientId, async (res) => {
        if (res.error) {
          callback({ error: res.error });
          setSyncStatus('error');
          return;
        }

        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        localStorage.setItem(GOOGLE_KEYS.USER_PROFILE, JSON.stringify(res.user));
        localStorage.setItem(GOOGLE_KEYS.ACCESS_TOKEN, res.accessToken);

        // Attempt cloud restore or initial backup
        try {
          setSyncStatus('syncing');
          const cloudData = await loadWorkspaceFromGoogleDrive(res.accessToken);
          if (cloudData) {
            if (cloudData.collections?.length) setCollections(cloudData.collections);
            if (cloudData.environments?.length) setEnvironments(cloudData.environments);
            if (cloudData.history?.length) setHistory(cloudData.history);
            if (cloudData.tabs?.length) setTabs(cloudData.tabs);
            if (cloudData.activeEnvId) setActiveEnvId(cloudData.activeEnvId);
            if (cloudData.activeTabId) setActiveTabId(cloudData.activeTabId);
          } else {
            const payload = {
              collections,
              environments,
              history,
              tabs,
              activeEnvId,
              activeTabId,
              updatedAt: new Date().toISOString(),
            };
            await saveWorkspaceToGoogleDrive(res.accessToken, payload);
          }

          const now = new Date().toISOString();
          setLastSyncTime(now);
          localStorage.setItem(GOOGLE_KEYS.LAST_SYNC, now);
          setSyncStatus('synced');
          callback({ success: true });
        } catch (syncErr) {
          console.error('Google Drive sync error:', syncErr);
          setSyncStatus('error');
          callback({ success: true });
        }
      });
    } catch (err) {
      callback({ error: err.message });
    }
  };

  // Manual Trigger Google Drive Sync
  const handleGoogleSyncNow = async () => {
    if (!googleToken) {
      setShowGoogleModal(true);
      return;
    }

    try {
      setSyncStatus('syncing');
      const payload = {
        collections,
        environments,
        history,
        tabs,
        activeEnvId,
        activeTabId,
        updatedAt: new Date().toISOString(),
      };
      await saveWorkspaceToGoogleDrive(googleToken, payload);
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem(GOOGLE_KEYS.LAST_SYNC, now);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Google Drive sync error:', err);
      setSyncStatus('error');
    }
  };

  // Google Logout
  const handleGoogleLogout = () => {
    setGoogleUser(null);
    setGoogleToken(null);
    localStorage.removeItem(GOOGLE_KEYS.USER_PROFILE);
    localStorage.removeItem(GOOGLE_KEYS.ACCESS_TOKEN);
    setSyncStatus('idle');
  };

  // Tab Handlers
  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
  };

  const handleAddTab = () => {
    const newTab = {
      id: `tab-${Date.now()}`,
      name: 'New Request',
      method: 'GET',
      url: '{{baseUrl}}/posts/1',
      params: [],
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
      auth: { type: 'none' },
      body: { mode: 'none', json: '' },
      isDirty: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId) => {
    if (tabs.length === 1) return;
    const filtered = tabs.filter((t) => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  const handleUpdateActiveTab = (updatedTab) => {
    const targetId = activeTab?.id || activeTabId;
    if (!targetId) return;
    setTabs((prevTabs) =>
      prevTabs.map((t) => (t.id === targetId ? { ...t, ...updatedTab } : t))
    );
  };

  // cURL Import Handler
  const handleImportCurl = (parsedRequest) => {
    if (activeTab) {
      handleUpdateActiveTab({
        method: parsedRequest.method || 'GET',
        url: parsedRequest.url || '',
        params: parsedRequest.params || [],
        headers: parsedRequest.headers || [],
        auth: parsedRequest.auth || { type: 'none' },
        body: parsedRequest.body || { mode: 'none' },
        isDirty: true,
      });
    } else {
      const newTab = {
        id: `tab-${Date.now()}`,
        name: 'Imported cURL',
        ...parsedRequest,
        isDirty: true,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  // Request Execution
  const handleSendRequest = async () => {
    if (!activeTab) return;

    // Set loading
    handleUpdateActiveTab({ isLoading: true });

    const result = await executeHttpRequest(activeTab, activeEnvVars);

    // Update tab with response
    handleUpdateActiveTab({ response: result, isLoading: false });

    // Append to history
    const historyItem = {
      id: `hist-${Date.now()}`,
      method: activeTab.method || 'GET',
      url: result.url || activeTab.url,
      status: result.status,
      statusText: result.statusText,
      durationMs: result.durationMs,
      timestamp: new Date().toISOString(),
      tabConfig: { ...activeTab },
    };
    setHistory([historyItem, ...history.slice(0, 49)]); // Keep last 50

    // Log to Postman Console
    const consoleLog = {
      id: `log-${Date.now()}`,
      method: activeTab.method || 'GET',
      url: result.url || activeTab.url,
      status: result.status,
      statusText: result.statusText,
      durationMs: result.durationMs,
      requestHeaders: result.requestHeaders,
      rawText: result.rawText,
      timestamp: new Date().toISOString(),
    };
    setConsoleLogs((prev) => [consoleLog, ...prev.slice(0, 99)]);
  };

  // Save Request to Collection
  const handleSaveRequest = () => {
    if (!activeTab) return;

    if (activeTab.collectionId) {
      setCollections(
        collections.map((col) => {
          if (col.id === activeTab.collectionId) {
            return {
              ...col,
              items: col.items.map((item) => (item.id === activeTab.id ? { ...activeTab, isDirty: false } : item)),
            };
          }
          return col;
        })
      );
      handleUpdateActiveTab({ isDirty: false });
    } else {
      if (collections.length > 0) {
        const targetCol = collections[0];
        const reqToSave = { ...activeTab, collectionId: targetCol.id, isDirty: false };
        setCollections(
          collections.map((col) =>
            col.id === targetCol.id ? { ...col, items: [...col.items, reqToSave] } : col
          )
        );
        handleUpdateActiveTab({ collectionId: targetCol.id, isDirty: false });
      } else {
        setCollectionModalMode('create');
      }
    }
  };

  // Global Keyboard Shortcuts (Zoom, New Tab, Close Tab, Send, Save, Focus, Import)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      // 1. Zoom In: Cmd + + / Cmd + = / Cmd + NumpadAdd
      if (e.key === '=' || e.key === '+' || e.code === 'NumpadAdd') {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(prev + 10, 180));
        return;
      }

      // 2. Zoom Out: Cmd + - / Cmd + NumpadSubtract
      if (e.key === '-' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(prev - 10, 70));
        return;
      }

      // 3. Zoom Reset: Cmd + 0 / Cmd + Numpad0
      if (e.key === '0' || e.code === 'Numpad0') {
        e.preventDefault();
        setZoomLevel(100);
        return;
      }

      // 4. New Request Tab: Cmd + N
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleAddTab();
        return;
      }

      // 5. Close Current Tab: Cmd + W
      if (e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) {
          handleCloseTab(activeTabId);
        }
        return;
      }

      // 6. Save Request: Cmd + S
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveRequest();
        return;
      }

      // 7. Send Request: Cmd + Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSendRequest();
        return;
      }

      // 8. Focus URL Input: Cmd + K or Cmd + L
      if (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const urlInput = document.getElementById('url-input-bar');
        if (urlInput) {
          urlInput.focus();
          urlInput.select();
        }
        return;
      }

      // 9. Import cURL Modal: Cmd + Shift + I
      if (e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setShowCurlModal(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, activeTab, tabs, collections]);

  // Sidebar Request Selection
  const handleSelectSidebarRequest = (req, collectionId) => {
    const existingTab = tabs.find((t) => t.id === req.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab = { ...req, collectionId, isDirty: false };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  // Sidebar Collection Handlers
  const handleCreateCollection = (newCol) => {
    setCollections([...collections, newCol]);
  };

  const handleCreateRequestInCollection = (collectionId) => {
    const newReq = {
      id: `req-${Date.now()}`,
      name: 'New Request',
      method: 'GET',
      url: '{{baseUrl}}/posts',
      params: [],
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
      auth: { type: 'none' },
      body: { mode: 'none' },
      collectionId,
    };

    setCollections(
      collections.map((col) =>
        col.id === collectionId ? { ...col, items: [...col.items, newReq] } : col
      )
    );

    setTabs([...tabs, newReq]);
    setActiveTabId(newReq.id);
  };

  const handleDeleteCollection = (colId) => {
    setCollections(collections.filter((c) => c.id !== colId));
  };

  const handleDeleteRequest = (reqId, colId) => {
    setCollections(
      collections.map((col) =>
        col.id === colId ? { ...col, items: col.items.filter((i) => i.id !== reqId) } : col
      )
    );
  };

  // History Handler
  const handleSelectHistoryItem = (histItem) => {
    const newTab = {
      ...histItem.tabConfig,
      id: `tab-${Date.now()}`,
      name: `Re: ${histItem.method} ${histItem.url}`,
      isDirty: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  // Import / Export Postman Collections
  const handleImportCollection = (importedCollection) => {
    setCollections([...collections, importedCollection]);
  };

  const handleExportCollection = () => {
    if (!collections.length) return;
    const targetCol = collections[0];
    const postmanJson = exportToPostmanFormat(targetCol);
    const text = JSON.stringify(postmanJson, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${targetCol.name.replace(/\s+/g, '_')}.postman_collection.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        environments={environments}
        activeEnvId={activeEnvId}
        onSelectEnv={(id) => setActiveEnvId(id)}
        onOpenEnvModal={() => setShowEnvModal(true)}
        onImportCollection={() => setCollectionModalMode('import')}
        onExportCollection={handleExportCollection}
        onNewRequest={handleAddTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        googleUser={googleUser}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onTriggerSync={handleGoogleSyncNow}
        onOpenGoogleModal={() => setShowGoogleModal(true)}
        onGoogleLogout={handleGoogleLogout}
      />

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Left Sidebar */}
        <Sidebar
          collections={collections}
          history={history}
          activeRequestId={activeTab?.id}
          onSelectRequest={handleSelectSidebarRequest}
          onCreateCollection={() => setCollectionModalMode('create')}
          onCreateRequestInCollection={handleCreateRequestInCollection}
          onDeleteCollection={handleDeleteCollection}
          onDeleteRequest={handleDeleteRequest}
          onSelectHistoryItem={handleSelectHistoryItem}
          onClearHistory={() => setHistory([])}
        />

        {/* Central Content Area */}
        <main className="content-area">
          {/* Top Multi-Tab Bar */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onAddTab={handleAddTab}
          />

          {/* Request & Response Split Pane with Resizer */}
          {activeTab ? (
            <div className="editor-response-split">
              <RequestBuilder
                request={activeTab}
                onChange={handleUpdateActiveTab}
                onSend={handleSendRequest}
                onSave={handleSaveRequest}
                activeEnv={activeEnv}
                activeEnvVars={activeEnvVars}
                isLoading={activeTab.isLoading}
                heightPct={requestPaneHeightPct}
              />

              {/* Draggable Vertical Splitter */}
              <SplitResizer
                requestHeight={requestPaneHeightPct}
                onResize={(newPct) => setRequestPaneHeightPct(newPct)}
              />

              <ResponseViewer
                response={activeTab.response}
                isLoading={activeTab.isLoading}
              />
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No open request tabs. Click + to create a new request.
            </div>
          )}
        </main>
      </div>

      {/* Bottom Status Bar / Footer */}
      <Footer
        activeEnv={activeEnv}
        collectionsCount={collections.length}
        historyCount={history.length}
        lastResponse={activeTab?.response}
        consoleLogsCount={consoleLogs.length}
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
      />

      {/* Postman Console Drawer */}
      <ConsoleDrawer
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        logs={consoleLogs}
        onClearLogs={() => setConsoleLogs([])}
      />

      {/* Modals */}
      {showEnvModal && (
        <EnvironmentModal
          environments={environments}
          activeEnvId={activeEnvId}
          onSaveEnvironments={(updatedEnvs, selectedId) => {
            setEnvironments(updatedEnvs);
            setActiveEnvId(selectedId);
          }}
          onClose={() => setShowEnvModal(false)}
        />
      )}

      {showCodeModal && activeTab && (
        <CodeSnippetModal
          request={activeTab}
          envVariables={activeEnvVars}
          onClose={() => setShowCodeModal(false)}
        />
      )}

      {showCurlModal && (
        <CurlImportModal
          onImportCurl={handleImportCurl}
          onClose={() => setShowCurlModal(false)}
        />
      )}

      {collectionModalMode && (
        <CollectionModal
          mode={collectionModalMode}
          onCreateCollection={handleCreateCollection}
          onImportCollection={handleImportCollection}
          onClose={() => setCollectionModalMode(null)}
        />
      )}

      {showGoogleModal && (
        <GoogleAuthModal
          user={googleUser}
          onLoginSuccess={handleGoogleLogin}
          onClose={() => setShowGoogleModal(false)}
        />
      )}
    </div>
  );
}
