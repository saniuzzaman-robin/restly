/**
 * LocalStorage state manager with default initial collections & environments
 */

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

export const loadInitialState = () => {
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
        },
      ];
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
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage`, err);
  }
};

export { STORAGE_KEYS };
