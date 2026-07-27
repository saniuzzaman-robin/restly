/**
 * Postman Collection v2.1 Import and Export Transformer
 */

export const parsePostmanCollection = (jsonContent) => {
  let parsed;
  try {
    parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
  } catch (e) {
    throw new Error('Invalid JSON format');
  }

  const collectionName = parsed.info?.name || 'Imported Collection';
  const collectionDesc = parsed.info?.description || '';

  const transformItem = (item) => {
    // If folder
    if (item.item && Array.isArray(item.item)) {
      return {
        id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: item.name || 'Folder',
        isFolder: true,
        items: item.item.map(transformItem),
      };
    }

    // Individual request
    const req = item.request || {};
    const method = typeof req === 'string' ? 'GET' : (req.method || 'GET');
    
    // Parse URL
    let rawUrl = '';
    if (typeof req.url === 'string') {
      rawUrl = req.url;
    } else if (req.url && req.url.raw) {
      rawUrl = req.url.raw;
    }

    // Convert params
    const params = [];
    if (req.url && Array.isArray(req.url.query)) {
      req.url.query.forEach((q) => {
        params.push({
          key: q.key || '',
          value: q.value || '',
          enabled: q.disabled !== true,
          description: q.description || '',
        });
      });
    }

    // Convert headers
    const headers = [];
    if (Array.isArray(req.header)) {
      req.header.forEach((h) => {
        headers.push({
          key: h.key || '',
          value: h.value || '',
          enabled: h.disabled !== true,
          description: h.description || '',
        });
      });
    }

    // Auth
    let auth = { type: 'none' };
    if (req.auth) {
      if (req.auth.type === 'bearer' && Array.isArray(req.auth.bearer)) {
        const tokenObj = req.auth.bearer.find((b) => b.key === 'token');
        auth = { type: 'bearer', token: tokenObj ? tokenObj.value : '' };
      } else if (req.auth.type === 'basic' && Array.isArray(req.auth.basic)) {
        const u = req.auth.basic.find((b) => b.key === 'username')?.value || '';
        const p = req.auth.basic.find((b) => b.key === 'password')?.value || '';
        auth = { type: 'basic', username: u, password: p };
      }
    }

    // Body
    let body = { mode: 'none', raw: '', json: '' };
    if (req.body) {
      const mode = req.body.mode || 'none';
      if (mode === 'raw') {
        const rawContent = req.body.raw || '';
        body = {
          mode: 'json',
          json: rawContent,
          raw: rawContent,
        };
      }
    }

    return {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: item.name || 'Request',
      method,
      url: rawUrl,
      params,
      headers,
      auth,
      body,
    };
  };

  const items = Array.isArray(parsed.item) ? parsed.item.map(transformItem) : [];

  return {
    id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: collectionName,
    description: collectionDesc,
    items,
  };
};

export const exportToPostmanFormat = (collection) => {
  const transformItemToPostman = (item) => {
    if (item.isFolder) {
      return {
        name: item.name,
        item: (item.items || []).map(transformItemToPostman),
      };
    }

    const headers = (item.headers || [])
      .filter((h) => h.key)
      .map((h) => ({
        key: h.key,
        value: h.value || '',
        type: 'text',
        disabled: h.enabled === false,
      }));

    const query = (item.params || [])
      .filter((p) => p.key)
      .map((p) => ({
        key: p.key,
        value: p.value || '',
        disabled: p.enabled === false,
      }));

    let body = undefined;
    if (item.body && item.body.mode !== 'none') {
      if (item.body.mode === 'json') {
        body = {
          mode: 'raw',
          raw: item.body.json || '',
          options: { raw: { language: 'json' } },
        };
      } else if (item.body.mode === 'raw') {
        body = {
          mode: 'raw',
          raw: item.body.raw || '',
        };
      }
    }

    return {
      name: item.name || 'Request',
      request: {
        method: item.method || 'GET',
        header: headers,
        url: {
          raw: item.url || '',
          query: query.length ? query : undefined,
        },
        body: body,
      },
    };
  };

  return {
    info: {
      _postman_id: collection.id,
      name: collection.name,
      description: collection.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: (collection.items || []).map(transformItemToPostman),
  };
};
