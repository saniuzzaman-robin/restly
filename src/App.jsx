import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { RequestBuilder } from './components/RequestBuilder';
import { ResponseViewer } from './components/ResponseViewer';
import { EnvironmentModal } from './components/EnvironmentModal';
import { EnvironmentEditorTab } from './components/EnvironmentEditorTab';
import { CollectionModal } from './components/CollectionModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { SaveRequestModal } from './components/SaveRequestModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { SplitResizer } from './components/SplitResizer';
import { SidebarResizer } from './components/SidebarResizer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { ConsoleDrawer } from './components/ConsoleDrawer';

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

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const [collections, setCollections] = useState(initialState.collections);
  const [environments, setEnvironments] = useState(initialState.environments);
  const [activeEnvId, setActiveEnvId] = useState(initialState.activeEnvId);
  const [history, setHistory] = useState(initialState.history);
  const [tabs, setTabs] = useState(initialState.openTabs);
  const [activeTabId, setActiveTabId] = useState(initialState.activeTabId);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // UI Modals
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [collectionModalMode, setCollectionModalMode] = useState(null); // 'create' | 'import' | null
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

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

  // Resizable Sidebar & Splitter
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('restly_sidebar_width');
    return saved ? parseInt(saved, 10) : 280;
  });

  const handleSidebarResize = (newWidth) => {
    setSidebarWidth(newWidth);
    localStorage.setItem('restly_sidebar_width', newWidth.toString());
  };

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

  // Global Keyboard Shortcuts (Full App Zoom In/Out, New Tab, Close Tab, Save, Console Drawer)
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
      // 7. Toggle Postman Console Drawer (Cmd + J or Cmd + Option + C)
      else if (key.toLowerCase() === 'j' || (e.altKey && key.toLowerCase() === 'c')) {
        e.preventDefault();
        setIsConsoleOpen((prev) => !prev);
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
      url: '',
      params: [],
      headers: [],
      auth: { type: 'none' },
      body: { mode: 'none', json: '', raw: '' },
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

  // Rename Tab Inline
  const handleRenameTab = (tabId, newName) => {
    setTabs((prevTabs) =>
      prevTabs.map((t) => {
        if (t.id === tabId) {
          if (t.name === newName) return t; // Unchanged, preserve isDirty state
          return { ...t, name: newName, isDirty: true };
        }
        return t;
      })
    );

    // Also update name in collections if saved
    setCollections((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        items: col.items.map((item) => (item.id === tabId ? { ...item, name: newName } : item)),
      }))
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

  // Open Save Request Modal
  const handleSaveRequest = () => {
    if (!activeTab) return;
    setShowSaveModal(true);
  };

  // Confirm Save Request Modal Submission
  const handleConfirmSaveRequest = (updatedReq) => {
    const savedSnapshot = JSON.parse(JSON.stringify(updatedReq));
    savedSnapshot.isDirty = false;
    savedSnapshot.savedState = JSON.parse(JSON.stringify(updatedReq));

    // Update Collections
    let collectionFound = false;
    const updatedCols = collections.map((col) => {
      if (col.id === updatedReq.collectionId) {
        collectionFound = true;
        const existingIdx = col.items.findIndex((item) => item.id === updatedReq.id);
        if (existingIdx >= 0) {
          const newItems = [...col.items];
          newItems[existingIdx] = savedSnapshot;
          return { ...col, items: newItems };
        }
        return { ...col, items: [...col.items, savedSnapshot] };
      }
      return col;
    });

    if (!collectionFound && updatedReq.collectionId) {
      updatedCols.push({
        id: updatedReq.collectionId,
        name: 'My Collection',
        items: [savedSnapshot],
      });
    }

    setCollections(updatedCols);
    handleUpdateActiveTab(savedSnapshot);
    setShowSaveModal(false);
  };

  // Revert Request Changes to Last Saved State
  const handleRevertRequest = () => {
    if (!activeTab) return;

    if (activeTab.savedState) {
      handleUpdateActiveTab({
        ...activeTab.savedState,
        isDirty: false,
      });
      return;
    }

    // Check collections for matching saved item
    for (const col of collections) {
      const match = col.items.find((item) => item.id === activeTab.id);
      if (match) {
        handleUpdateActiveTab({
          ...match,
          isDirty: false,
          savedState: JSON.parse(JSON.stringify(match)),
        });
        return;
      }
    }

    // Fallback: clear dirty flag
    handleUpdateActiveTab({ isDirty: false });
  };

  // Sidebar Request Select
  const handleSelectSidebarRequest = (req) => {
    const existingTab = tabs.find((t) => t.id === req.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab = { ...req, isDirty: false, isLoading: false, savedState: JSON.parse(JSON.stringify(req)) };
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
    const newColId = `col-${Date.now()}`;
    const newCol = {
      id: newColId,
      name,
      description: description || '',
      items: [],
    };
    setCollections([...collections, newCol]);
    setCollectionModalMode(null);
    return newColId;
  };

  const handleCreateRequestInCollection = (collectionId) => {
    const newReq = {
      id: `req-${Date.now()}`,
      collectionId,
      name: 'New Request',
      method: 'GET',
      url: '',
      params: [],
      headers: [],
      auth: { type: 'none' },
      body: { mode: 'none', json: '', raw: '' },
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

  const handleOpenEnvTab = (env) => {
    const tabId = `env-tab-${env.id}`;
    const existing = tabs.find((t) => t.id === tabId);
    if (existing) {
      setActiveTabId(tabId);
      return;
    }

    const envTab = {
      id: tabId,
      type: 'environment',
      envId: env.id,
      name: env.name,
    };

    setTabs([...tabs, envTab]);
    setActiveTabId(tabId);
  };

  const handleCreateEnv = () => {
    const newEnv = {
      id: `env-${Date.now()}`,
      name: `New Environment ${environments.length + 1}`,
      variables: [
        { key: 'baseUrl', value: 'https://api.example.com', enabled: true },
        { key: 'apiKey', value: 'secret_key_123', enabled: true },
      ],
    };

    const updated = [...environments, newEnv];
    setEnvironments(updated);
    if (!activeEnvId) {
      setActiveEnvId(newEnv.id);
    }
    handleOpenEnvTab(newEnv);
  };

  const handleUpdateEnvironment = (updatedEnv) => {
    setEnvironments((prev) =>
      prev.map((e) => (e.id === updatedEnv.id ? updatedEnv : e))
    );
    setTabs((prev) =>
      prev.map((t) =>
        t.id === `env-tab-${updatedEnv.id}` ? { ...t, name: updatedEnv.name } : t
      )
    );
  };

  const handleDeleteEnvironment = (envId) => {
    const updated = environments.filter((e) => e.id !== envId);
    setEnvironments(updated);
    if (activeEnvId === envId) {
      setActiveEnvId(updated.length > 0 ? updated[0].id : null);
    }
    const tabId = `env-tab-${envId}`;
    handleCloseTab(tabId);
  };

  const handleDuplicateEnvironment = (env) => {
    const dupEnv = {
      id: `env-${Date.now()}`,
      name: `${env.name} (Copy)`,
      variables: JSON.parse(JSON.stringify(env.variables || [])),
    };
    setEnvironments([...environments, dupEnv]);
    handleOpenEnvTab(dupEnv);
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
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
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
            width={sidebarWidth}
            collections={collections}
            environments={environments}
            activeEnvId={activeEnvId}
            history={history}
            activeRequestId={activeTab?.id}
            onSelectRequest={handleSelectSidebarRequest}
            onCreateCollection={() => setCollectionModalMode('create')}
            onCreateRequestInCollection={handleCreateRequestInCollection}
            onDeleteCollection={handleDeleteCollection}
            onDeleteRequest={handleDeleteRequest}
            onSelectEnv={(envId) => setActiveEnvId(envId)}
            onOpenEnvTab={handleOpenEnvTab}
            onCreateEnv={handleCreateEnv}
            onDeleteEnv={handleDeleteEnvironment}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={() => setHistory([])}
          />

          {/* Draggable Horizontal Sidebar Resizer */}
          <SidebarResizer
            width={sidebarWidth}
            onResize={handleSidebarResize}
          />

          {/* Central Content Area */}
          <main className="content-area">
            {/* Top Multi-Tab Bar with Double-Click Inline Renaming */}
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={handleSelectTab}
              onCloseTab={handleCloseTab}
              onAddTab={handleAddTab}
              onRenameTab={handleRenameTab}
            />

            {/* Render Environment Tab vs Request Tab */}
            {activeTab ? (
              activeTab.type === 'environment' ? (
                (() => {
                  const targetEnv = environments.find((e) => e.id === activeTab.envId);
                  if (!targetEnv) {
                    return (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Environment profile not found or deleted.
                      </div>
                    );
                  }
                  return (
                    <EnvironmentEditorTab
                      environment={targetEnv}
                      isActiveEnv={targetEnv.id === activeEnvId}
                      onSetActiveEnv={() => setActiveEnvId(targetEnv.id)}
                      onUpdateEnvironment={handleUpdateEnvironment}
                      onDeleteEnvironment={() => handleDeleteEnvironment(targetEnv.id)}
                      onDuplicateEnvironment={() => handleDuplicateEnvironment(targetEnv)}
                    />
                  );
                })()
              ) : (
                <div className="editor-response-split">
                  <RequestBuilder
                    request={activeTab}
                    onChange={handleUpdateActiveTab}
                    onSend={handleSendRequest}
                    onCancel={() => handleCancelRequest(activeTab.id)}
                    onSave={handleSaveRequest}
                    onRevert={handleRevertRequest}
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
              )
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No open tabs. Click <strong>+</strong> to create a new request or select an environment from the sidebar.
              </div>
            )}
          </main>
        </div>

        {/* Postman Console Drawer */}
        <ConsoleDrawer
          isOpen={isConsoleOpen}
          onClose={() => setIsConsoleOpen(false)}
          logs={consoleLogs}
          onClearLogs={() => setConsoleLogs([])}
        />

        {/* Bottom Status Bar / Footer */}
        <Footer
          activeEnv={activeEnv}
          collectionsCount={collections.length}
          historyCount={history.length}
          lastResponse={activeTab?.response}
          consoleLogsCount={consoleLogs.length}
          isConsoleOpen={isConsoleOpen}
          onToggleConsole={() => setIsConsoleOpen((prev) => !prev)}
        />

        {/* Modals */}
        {showSaveModal && activeTab && (
          <SaveRequestModal
            request={activeTab}
            collections={collections}
            onClose={() => setShowSaveModal(false)}
            onSave={handleConfirmSaveRequest}
            onCreateCollection={(name) => handleCreateCollection(name, '')}
          />
        )}

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

        <BackupRestoreModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
