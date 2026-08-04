/**
 * LocalStorage state manager with schema migration, QuotaExceededError protection,
 * response payload trimming, & storage pruning.
 */

const STORAGE_VERSION_KEY = 'restly_schema_version';
const CURRENT_STORAGE_VERSION = '1.0.4';

const STORAGE_KEYS = {
  COLLECTIONS: 'aether_collections',
  ENVIRONMENTS: 'aether_environments',
  ACTIVE_ENV_ID: 'aether_active_env_id',
  HISTORY: 'aether_history',
  OPEN_TABS: 'aether_open_tabs',
  ACTIVE_TAB_ID: 'aether_active_tab_id',
};

// Default Sample Environments
const DEFAULT_ENVIRONMENTS = [
  {
    id: 'env-dev',
    name: 'Development',
    variables: [
      { key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
      { key: 'apiKey', value: 'dev_sec_9876543210', enabled: true },
      { key: 'authToken', value: 'bearer_token_xyz_123', enabled: true },
      { key: 'postId', value: '1', enabled: true },
    ],
  },
  {
    id: 'env-prod',
    name: 'Production',
    variables: [
      { key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
      { key: 'apiKey', value: 'prod_live_key_998877', enabled: true },
      { key: 'authToken', value: 'prod_jwt_token_sample', enabled: true },
      { key: 'postId', value: '10', enabled: true },
    ],
  },
];

// Default Sample Collection
const DEFAULT_COLLECTIONS = [
  {
    id: 'col-jsonplaceholder',
    name: 'JSONPlaceholder API',
    description: 'Sample collection with typical CRUD endpoints',
    items: [
      {
        id: 'req-get-posts',
        name: 'Get All Posts',
        method: 'GET',
        url: '{{baseUrl}}/posts',
        params: [{ key: '_limit', value: '5', enabled: true, description: 'Limit items returned' }],
        headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        auth: { type: 'none' },
        body: { mode: 'none', raw: '', json: '' },
      },
      {
        id: 'req-get-single-post',
        name: 'Get Post by ID',
        method: 'GET',
        url: '{{baseUrl}}/posts/{{postId}}',
        params: [],
        headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        auth: { type: 'none' },
        body: { mode: 'none', raw: '', json: '' },
      },
      {
        id: 'req-create-post',
        name: 'Create New Post',
        method: 'POST',
        url: '{{baseUrl}}/posts',
        params: [],
        headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
        auth: { type: 'bearer', token: '{{authToken}}' },
        body: {
          mode: 'json',
          json: JSON.stringify(
            {
              title: 'Aether API Studio Launch',
              body: 'Creating requests with custom environment variables is awesome!',
              userId: 1,
            },
            null,
            2
          ),
        },
      },
      {
        id: 'req-update-post',
        name: 'Update Post',
        method: 'PUT',
        url: '{{baseUrl}}/posts/1',
        params: [],
        headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
        auth: { type: 'none' },
        body: {
          mode: 'json',
          json: JSON.stringify({ id: 1, title: 'Updated Title', body: 'Updated content body', userId: 1 }, null, 2),
        },
      },
      {
        id: 'req-delete-post',
        name: 'Delete Post',
        method: 'DELETE',
        url: '{{baseUrl}}/posts/1',
        params: [],
        headers: [],
        auth: { type: 'none' },
        body: { mode: 'none' },
      },
    ],
  },
];

/**
 * Trims heavy response objects and guarantees loading states are NEVER persisted as true
 */
const sanitizeDataForStorage = (key, data) => {
  if (key === STORAGE_KEYS.HISTORY && Array.isArray(data)) {
    // Keep max 30 history items and trim large response bodies
    return data.slice(0, 30).map((item) => {
      if (item.response?.rawText && item.response.rawText.length > 5000) {
        return {
          ...item,
          response: {
            ...item.response,
            rawText: item.response.rawText.slice(0, 5000) + '\n... [Response truncated for storage]',
            data: typeof item.response.data === 'object' ? null : item.response.data,
          },
        };
      }
      return item;
    });
  }

  if (key === STORAGE_KEYS.OPEN_TABS && Array.isArray(data)) {
    // Sanitize open tabs: FORCE isLoading: false and trim heavy responses
    return data.map((tab) => {
      const sanitizedTab = { ...tab, isLoading: false, isExecuting: false };
      if (sanitizedTab.response?.rawText && sanitizedTab.response.rawText.length > 20000) {
        return {
          ...sanitizedTab,
          response: {
            ...sanitizedTab.response,
            rawText: sanitizedTab.response.rawText.slice(0, 20000) + '\n... [Response truncated for storage]',
          },
        };
      }
      return sanitizedTab;
    });
  }

  return data;
};

/**
 * Prunes old history and heavy response entries from localStorage when quota is exceeded
 */
const pruneLocalStorageQuota = () => {
  try {
    // Clear old history entries
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      if (history.length > 5) {
        const trimmedHistory = history.slice(0, 5).map((h) => ({ ...h, response: null }));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
      } else {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
      }
    }
  } catch (e) {
    console.warn('Unable to prune localStorage:', e);
  }
};

/**
 * Automatic Schema Migration & Data Cleanup Routine
 */
const migrateAndCleanupStorage = () => {
  try {
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (!savedVersion) {
      // First run or upgrading schema: clean heavy caches and stamp current version
      pruneLocalStorageQuota();
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
    } else if (savedVersion !== CURRENT_STORAGE_VERSION) {
      // Version upgrade migration logic
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
    }
  } catch (e) {
    console.warn('Data migration check failed:', e);
  }
};

export const loadInitialState = () => {
  migrateAndCleanupStorage();

  try {
    const savedCollections = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    const collections = savedCollections ? JSON.parse(savedCollections) : DEFAULT_COLLECTIONS;

    const savedEnvironments = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
    const environments = savedEnvironments ? JSON.parse(savedEnvironments) : DEFAULT_ENVIRONMENTS;

    const savedActiveEnvId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ENV_ID) || 'env-dev';

    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const history = savedHistory ? JSON.parse(savedHistory) : [];

    const savedTabs = localStorage.getItem(STORAGE_KEYS.OPEN_TABS);
    let openTabs = savedTabs ? JSON.parse(savedTabs) : [];

    // Fallback if no tabs saved
    if (!openTabs.length) {
      openTabs = [
        {
          id: 'tab-1',
          name: 'New Request',
          method: 'GET',
          url: '{{baseUrl}}/posts/1',
          params: [],
          headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
          auth: { type: 'none' },
          body: { mode: 'none', json: '' },
          isDirty: false,
          isLoading: false,
        },
      ];
    } else {
      // Forcefully reset all loaded tabs to isLoading: false to recover from any crash
      openTabs = openTabs.map((t) => ({ ...t, isLoading: false, isExecuting: false }));
    }

    const activeTabId = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB_ID) || openTabs[0]?.id;

    return {
      collections,
      environments,
      activeEnvId: savedActiveEnvId,
      history,
      openTabs,
      activeTabId,
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return {
      collections: DEFAULT_COLLECTIONS,
      environments: DEFAULT_ENVIRONMENTS,
      activeEnvId: 'env-dev',
      history: [],
      openTabs: [],
      activeTabId: null,
    };
  }
};

export const saveStateItem = (key, data) => {
  try {
    const sanitizedData = sanitizeDataForStorage(key, data);
    const serialized = typeof sanitizedData === 'string' ? sanitizedData : JSON.stringify(sanitizedData);
    localStorage.setItem(key, serialized);
  } catch (err) {
    // Check if error is QuotaExceededError
    if (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014) {
      console.warn(`LocalStorage quota exceeded while saving ${key}. Pruning old history cache...`);
      pruneLocalStorageQuota();
      try {
        const sanitizedData = sanitizeDataForStorage(key, data);
        const serialized = typeof sanitizedData === 'string' ? sanitizedData : JSON.stringify(sanitizedData);
        localStorage.setItem(key, serialized);
      } catch (retryErr) {
        console.warn(`Could not save ${key} even after pruning:`, retryErr);
      }
    } else {
      console.error(`Failed to save ${key} to localStorage:`, err);
    }
  }
};

export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(STORAGE_VERSION_KEY);
    window.location.reload();
  } catch (e) {
    console.error('Failed to clear app storage:', e);
  }
};

export { STORAGE_KEYS };
