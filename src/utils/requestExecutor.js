/**
 * HTTP Request Execution Engine using Fetch API with environment variable resolution
 */
import { resolveVariables } from './variableResolver';

export const executeHttpRequest = async (requestConfig, envVariables = []) => {
  const startTime = performance.now();

  try {
    // 1. Resolve variables in URL
    let resolvedUrl = resolveVariables(requestConfig.url, envVariables).trim();

    if (!resolvedUrl) {
      throw new Error('URL is required');
    }

    if (!/^https?:\/\//i.test(resolvedUrl)) {
      resolvedUrl = 'https://' + resolvedUrl;
    }

    // 2. Build Query Parameters
    const urlObj = new URL(resolvedUrl);
    if (Array.isArray(requestConfig.params)) {
      requestConfig.params.forEach((param) => {
        if (param.enabled !== false && param.key) {
          const resolvedKey = resolveVariables(param.key, envVariables);
          const resolvedVal = resolveVariables(param.value || '', envVariables);
          urlObj.searchParams.append(resolvedKey, resolvedVal);
        }
      });
    }

    // 3. Build Headers
    const headersObj = {};
    if (Array.isArray(requestConfig.headers)) {
      requestConfig.headers.forEach((h) => {
        if (h.enabled !== false && h.key) {
          headersObj[resolveVariables(h.key, envVariables)] = resolveVariables(h.value || '', envVariables);
        }
      });
    }

    // 4. Handle Authentication
    const auth = requestConfig.auth || { type: 'none' };
    if (auth.type === 'bearer' && auth.token) {
      const resolvedToken = resolveVariables(auth.token, envVariables);
      headersObj['Authorization'] = `Bearer ${resolvedToken}`;
    } else if (auth.type === 'basic' && (auth.username || auth.password)) {
      const u = resolveVariables(auth.username || '', envVariables);
      const p = resolveVariables(auth.password || '', envVariables);
      const creds = btoa(`${u}:${p}`);
      headersObj['Authorization'] = `Basic ${creds}`;
    } else if (auth.type === 'apikey' && auth.key && auth.value) {
      const k = resolveVariables(auth.key, envVariables);
      const v = resolveVariables(auth.value, envVariables);
      if (auth.addTo === 'query') {
        urlObj.searchParams.append(k, v);
      } else {
        headersObj[k] = v;
      }
    }

    // 5. Build Request Body
    let fetchBody = null;
    const method = (requestConfig.method || 'GET').toUpperCase();

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const bodyMode = requestConfig.body?.mode || 'none';

      if (bodyMode === 'json') {
        const rawJson = requestConfig.body?.json || '';
        fetchBody = resolveVariables(rawJson, envVariables);
        if (!headersObj['Content-Type'] && !headersObj['content-type']) {
          headersObj['Content-Type'] = 'application/json';
        }
      } else if (bodyMode === 'raw') {
        fetchBody = resolveVariables(requestConfig.body?.raw || '', envVariables);
      } else if (bodyMode === 'urlencoded') {
        const urlParams = new URLSearchParams();
        if (Array.isArray(requestConfig.body?.urlencoded)) {
          requestConfig.body.urlencoded.forEach((item) => {
            if (item.enabled !== false && item.key) {
              urlParams.append(
                resolveVariables(item.key, envVariables),
                resolveVariables(item.value || '', envVariables)
              );
            }
          });
        }
        fetchBody = urlParams;
        if (!headersObj['Content-Type']) {
          headersObj['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      } else if (bodyMode === 'formdata') {
        const formData = new FormData();
        if (Array.isArray(requestConfig.body?.formdata)) {
          requestConfig.body.formdata.forEach((item) => {
            if (item.enabled !== false && item.key) {
              formData.append(
                resolveVariables(item.key, envVariables),
                resolveVariables(item.value || '', envVariables)
              );
            }
          });
        }
        fetchBody = formData;
      }
    }

    // 6. Execute Request
    const response = await fetch(urlObj.toString(), {
      method,
      headers: headersObj,
      body: fetchBody,
    });

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    // 7. Parse Response Headers
    const responseHeaders = [];
    response.headers.forEach((value, key) => {
      responseHeaders.push({ key, value });
    });

    // 8. Read Body & Calculate Size
    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();
    const sizeBytes = new Blob([rawText]).size;

    let parsedJson = null;
    let isJson = false;

    if (contentType.includes('application/json') || (rawText.trim().startsWith('{') || rawText.trim().startsWith('['))) {
      try {
        parsedJson = JSON.parse(rawText);
        isJson = true;
      } catch (e) {
        // Not valid JSON
      }
    }

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: parsedJson !== null ? parsedJson : rawText,
      rawText,
      isJson,
      durationMs,
      sizeBytes,
      url: urlObj.toString(),
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    let errorMessage = err.message || 'Network error or CORS policy restriction';
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      errorMessage = 'Failed to fetch. This may be caused by a CORS restriction on the target server, invalid URL, or network disconnection.';
    }

    return {
      success: false,
      status: 0,
      statusText: 'Network Error / CORS',
      errorMessage,
      headers: [],
      data: null,
      rawText: errorMessage,
      isJson: false,
      durationMs,
      sizeBytes: 0,
      url: requestConfig.url,
      timestamp: new Date().toISOString(),
    };
  }
};
