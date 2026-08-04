import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { RequestBuilder } from './components/RequestBuilder';
import { ResponseViewer } from './components/ResponseViewer';
import { EnvironmentModal } from './components/EnvironmentModal';
import { CollectionModal } from './components/CollectionModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { SplitResizer } from './components/SplitResizer';
import { ErrorBoundary } from './components/ErrorBoundary';

import { loadInitialState, saveStateItem, STORAGE_KEYS } from './utils/storage';
import { executeHttpRequest } from './utils/requestExecutor';
import {
  saveWorkspaceToGoogleDrive,
  GOOGLE_KEYS,
} from './utils/googleDriveSync';

const loadStoredCookies = () => {
  try {
    const saved = localStorage.getItem('restly_cookies');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export function App() {
  // Load initial persistent state
  const initialState = loadInitialState();

  const [collections, setCollections] = useState(initialState.collections);
  const [environments, setEnvironments] = useState(initialState.environments);
  const [activeEnvId, setActiveEnvId] = useState(initialState.activeEnvId);
  const [history, setHistory] = useState(initialState.history);
  const [tabs, setTabs] = useState(initialState.openTabs);
  const [activeTabId, setActiveTabId] = useState(initialState.activeTabId);
  const [consoleLogs, setConsoleLogs] = useState([]);

  // UI Modals
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [collectionModalMode, setCollectionModalMode] = useState(null); // 'create' | 'import' | null
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Application Zoom Level (70% - 150%, Auto-default to 110% on XL Viewports >= 1920px width)
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('restly_zoom_level');
    if (saved) return parseFloat(saved);
    if (typeof window !== 'undefined' && window.innerWidth >= 1920) {
      return 110;
    }
    return 100;
  });

  // Google Sync State
  const [googleUser, setGoogleUser] = useState(() => {
    const saved = localStorage.getItem(GOOGLE_KEYS.USER_PROFILE);
    return saved ? JSON.parse(saved) : null;
  });
  const [googleToken, setGoogleToken] = useState(() => {
    return localStorage.getItem(GOOGLE_KEYS.ACCESS_TOKEN) || null;
  });
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem(GOOGLE_KEYS.LAST_SYNC) || null;
  });

  // Resizable Splitter
  const [requestPaneHeightPct, setRequestPaneHeightPct] = useState(48);

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('aether_theme') || 'dark');

  // Active AbortControllers Map for Cancel Request functionality
  const activeAbortControllers = useRef(new Map());

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aether_theme', theme);
  }, [theme]);

  // Apply Full Application Zoom Scaling across all components, buttons, tabs, fonts, & inputs
  useEffect(() => {
    const zoomRatio = zoomLevel / 100;
    document.documentElement.style.setProperty('--app-zoom', zoomRatio.toString());
  }, [zoomLevel]);

  // Dynamic Window Resize Listener (Triggers 110% zoom in real-time when viewport >= 1920px)
  useEffect(() => {
    const handleResize = () => {
      const saved = localStorage.getItem('restly_zoom_level');
      if (!saved) {
        if (window.innerWidth >= 1920) {
          setZoomLevel(110);
        } else {
          setZoomLevel(100);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Error & Rejection Recovery Listener to prevent stuck loading states
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('Global Application Error Caught:', event);
      // Reset all tabs loading state to recover UI
      setTabs((prevTabs) => prevTabs.map((t) => ({ ...t, isLoading: false, isExecuting: false })));
    };

    const handleUnhandledRejection = (event) => {
      console.warn('Global Unhandled Promise Rejection Caught:', event.reason);
      setTabs((prevTabs) => prevTabs.map((t) => ({ ...t, isLoading: false, isExecuting: false })));
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active Environment
  const activeEnv = environments.find((e) => e.id === activeEnvId);
  const activeEnvVars = activeEnv?.variables || [];

  // Active Tab
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Global Keyboard Shortcuts (Full App Zoom In/Out, New Tab, Close Tab, Save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      const key = e.key;

      // 1. Zoom In (Cmd + + or Cmd + =)
      if (key === '+' || key === '=') {
        e.preventDefault();
        const nextZoom = Math.min(150, Math.round(zoomLevel + 10));
        setZoomLevel(nextZoom);
        localStorage.setItem('restly_zoom_level', nextZoom.toString());
      }
      // 2. Zoom Out (Cmd + -)
      else if (key === '-') {
        e.preventDefault();
        const nextZoom = Math.max(70, Math.round(zoomLevel - 10));
        setZoomLevel(nextZoom);
        localStorage.setItem('restly_zoom_level', nextZoom.toString());
      }
      // 3. Reset Zoom (Cmd + 0)
      else if (key === '0') {
        e.preventDefault();
        setZoomLevel(100);
        localStorage.removeItem('restly_zoom_level');
      }
      // 4. Save Request (Cmd + S)
      else if (key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveRequest();
      }
      // 5. New Request Tab (Cmd + T)
      else if (key.toLowerCase() === 't') {
        e.preventDefault();
        handleAddTab();
      }
      // 6. Close Current Tab (Cmd + W)
      else if (key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) {
          handleCloseTab(activeTabId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, activeTab, zoomLevel]);

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
      if (!window.google?.accounts?.id) {
        if (callback) callback({ error: 'Google Identity SDK loading or blocked.' });
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            try {
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const profile = JSON.parse(jsonPayload);
              const userObj = {
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
              };

              setGoogleUser(userObj);
              setGoogleToken(response.credential);
              localStorage.setItem(GOOGLE_KEYS.USER_PROFILE, JSON.stringify(userObj));
              localStorage.setItem(GOOGLE_KEYS.ACCESS_TOKEN, response.credential);

              if (callback) callback(userObj);
            } catch (e) {
              console.error('Failed to parse Google ID token', e);
              if (callback) callback({ error: 'Failed to parse Google account profile.' });
            }
          }
        },
      });

      window.google.accounts.id.prompt();
    } catch (err) {
      console.error('Google login error:', err);
      if (callback) callback({ error: err.message });
    }
  };

  // Google Drive Manual Sync Now
  const handleGoogleSyncNow = async () => {
    if (!googleToken) return;
    setSyncStatus('syncing');

    try {
      const payload = {
        collections,
        environments,
        activeEnvId,
        history,
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
      isLoading: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId) => {
    if (tabs.length === 1) return;
    // Abort active request if tab is closed while sending
    if (activeAbortControllers.current.has(tabId)) {
      activeAbortControllers.current.get(tabId).abort();
      activeAbortControllers.current.delete(tabId);
    }
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
        isLoading: false,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  // Cancel Active HTTP Request
  const handleCancelRequest = (tabId) => {
    const targetTabId = tabId || activeTab?.id;
    if (!targetTabId) return;

    if (activeAbortControllers.current.has(targetTabId)) {
      activeAbortControllers.current.get(targetTabId).abort();
      activeAbortControllers.current.delete(targetTabId);
    }

    setTabs((prevTabs) =>
      prevTabs.map((t) =>
        t.id === targetTabId
          ? {
              ...t,
              isLoading: false,
              response: {
                success: false,
                status: 0,
                statusText: 'Cancelled',
                errorMessage: 'Request cancelled by user',
                isCancelled: true,
                rawText: 'Request cancelled by user',
              },
            }
          : t
      )
    );
  };

  // Request Execution
  const handleSendRequest = async () => {
    if (!activeTab) return;
    const targetTabId = activeTab.id;

    // Create and register AbortController
    const controller = new AbortController();
    activeAbortControllers.current.set(targetTabId, controller);

    // Set loading
    handleUpdateActiveTab({ isLoading: true });

    try {
      const storedCookies = loadStoredCookies();
      const result = await executeHttpRequest(activeTab, activeEnvVars, storedCookies, controller.signal);

      // Update tab with response
      handleUpdateActiveTab({ response: result, isLoading: false });

      // Append to history if not cancelled
      if (!result.isCancelled) {
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
        setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
      }

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
    } catch (err) {
      console.error('Unexpected Exception inside handleSendRequest:', err);
      handleUpdateActiveTab({
        isLoading: false,
        response: {
          success: false,
          status: 0,
          statusText: 'Execution Error',
          errorMessage: err.message || 'An unexpected error occurred during request execution',
          rawText: err.stack || err.message,
        },
      });
    } finally {
      activeAbortControllers.current.delete(targetTabId);
    }
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
        const newCol = {
          id: `col-${Date.now()}`,
          name: 'My Collection',
          items: [{ ...activeTab, collectionId: `col-${Date.now()}`, isDirty: false }],
        };
        setCollections([...collections, newCol]);
        handleUpdateActiveTab({ collectionId: newCol.id, isDirty: false });
      }
    }
  };

  // Sidebar Request Select
  const handleSelectSidebarRequest = (req) => {
    const existingTab = tabs.find((t) => t.id === req.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab = { ...req, isDirty: false, isLoading: false };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  // Sidebar History Item Select
  const handleSelectHistoryItem = (hist) => {
    if (hist.tabConfig) {
      const newTab = {
        ...hist.tabConfig,
        id: `tab-${Date.now()}`,
        name: `History: ${hist.method} ${hist.url}`,
        isDirty: false,
        isLoading: false,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  // Collection CRUD
  const handleCreateCollection = (name, description) => {
    const newCol = {
      id: `col-${Date.now()}`,
      name,
      description,
      items: [],
    };
    setCollections([...collections, newCol]);
    setCollectionModalMode(null);
  };

  const handleCreateRequestInCollection = (collectionId) => {
    const newReq = {
      id: `req-${Date.now()}`,
      collectionId,
      name: 'New Request',
      method: 'GET',
      url: '{{baseUrl}}/posts/1',
      params: [],
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
      auth: { type: 'none' },
      body: { mode: 'none', json: '' },
      isDirty: false,
      isLoading: false,
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

  const handleDeleteRequest = (colId, reqId) => {
    setCollections(
      collections.map((col) =>
        col.id === colId ? { ...col, items: col.items.filter((i) => i.id !== reqId) } : col
      )
    );
  };

  // Environment CRUD
  const handleSaveEnvironments = (updatedEnvs) => {
    setEnvironments(updatedEnvs);
  };

  // Export Collection JSON
  const handleExportCollection = (colId) => {
    const target = collections.find((c) => c.id === colId) || collections[0];
    if (!target) return;
    const blob = new Blob([JSON.stringify(target, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${target.name.toLowerCase().replace(/\s+/g, '-')}-collection.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ErrorBoundary>
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
                  onCancel={() => handleCancelRequest(activeTab.id)}
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
        <footer className="app-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>RESTLY Studio • Active Env: <strong>{activeEnv?.name || 'No Environment'}</strong></span>
            <span>|</span>
            <span>Zoom: <strong>{zoomLevel}%</strong></span>
            <span>|</span>
            <span>Tabs Open: {tabs.length}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {googleUser && (
              <span style={{ color: 'var(--text-muted)' }}>
                Sync: {syncStatus === 'synced' ? '✓ Google Drive Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Idle'}
              </span>
            )}
            <span>Online Mode</span>
          </div>
        </footer>

        {/* Modals */}
        <EnvironmentModal
          isOpen={showEnvModal}
          onClose={() => setShowEnvModal(false)}
          environments={environments}
          onSave={handleSaveEnvironments}
        />

        {collectionModalMode && (
          <CollectionModal
            mode={collectionModalMode}
            onClose={() => setCollectionModalMode(null)}
            onCreateCollection={handleCreateCollection}
            onImportCollection={(importedCol) => {
              setCollections([...collections, importedCol]);
              setCollectionModalMode(null);
            }}
          />
        )}

        {showGoogleModal && (
          <GoogleAuthModal
            user={googleUser}
            onClose={() => setShowGoogleModal(false)}
            onLoginSuccess={handleGoogleLogin}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
