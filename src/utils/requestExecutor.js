/**
 * HTTP Request Execution Engine using Fetch API with variable resolution,
 * multipart form files, binary payload support, cookie parsing,
 * Postman request settings (timeout, redirects, URL auto-encoding),
 * Native Local Node.js Proxy Engine for zero CORS restrictions,
 * and request cancellation support via AbortSignal.
 */
import { resolveVariables } from './variableResolver';

export const executeHttpRequest = async (requestConfig, envVariables = [], storedCookies = [], externalSignal = null) => {
  const startTime = performance.now();
  const settings = requestConfig.settings || {};

  // Initialize AbortController
  const controller = new AbortController();

  // If external AbortSignal is provided (e.g. user clicked Cancel), listen to it
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    // 1. Resolve variables in URL
    let resolvedUrl = resolveVariables(requestConfig.url || '', envVariables).trim();

    if (!resolvedUrl) {
      throw new Error('URL is required');
    }

    if (!/^https?:\/\//i.test(resolvedUrl)) {
      resolvedUrl = 'https://' + resolvedUrl;
    }

    // Auto-encode URL if enabled in settings (default true)
    if (settings.autoEncodeUrl !== false) {
      try {
        resolvedUrl = encodeURI(resolvedUrl);
      } catch (e) {
        // Fallback to original
      }
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

    // Auto-inject matching stored domain cookies if Cookie header not manually specified
    if (!headersObj['Cookie'] && !headersObj['cookie'] && storedCookies?.length) {
      const hostname = urlObj.hostname;
      const matchingCookies = storedCookies.filter((c) => !c.domain || hostname.endsWith(c.domain) || c.domain.endsWith(hostname));
      if (matchingCookies.length > 0) {
        headersObj['Cookie'] = matchingCookies.map((c) => `${c.name}=${c.value}`).join('; ');
      }
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
        const rawType = requestConfig.body?.rawType || 'json';
        fetchBody = resolveVariables(requestConfig.body?.raw || requestConfig.body?.json || '', envVariables);
        if (!headersObj['Content-Type'] && !headersObj['content-type']) {
          if (rawType === 'json') headersObj['Content-Type'] = 'application/json';
          else if (rawType === 'javascript') headersObj['Content-Type'] = 'application/javascript';
          else if (rawType === 'html') headersObj['Content-Type'] = 'text/html';
          else if (rawType === 'xml') headersObj['Content-Type'] = 'application/xml';
          else headersObj['Content-Type'] = 'text/plain';
        }
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
              const key = resolveVariables(item.key, envVariables);
              if (item.type === 'file' && item.fileObj) {
                formData.append(key, item.fileObj);
              } else {
                formData.append(key, resolveVariables(item.value || '', envVariables));
              }
            }
          });
        }
        fetchBody = formData;
      } else if (bodyMode === 'binary' && requestConfig.body?.binaryFile?.fileObj) {
        fetchBody = requestConfig.body.binaryFile.fileObj;
        if (!headersObj['Content-Type']) {
          headersObj['Content-Type'] = requestConfig.body.binaryFile.type || 'application/octet-stream';
        }
      } else if (bodyMode === 'graphql') {
        let parsedVars = {};
        if (requestConfig.body?.graphqlVariables) {
          try {
            parsedVars = JSON.parse(resolveVariables(requestConfig.body.graphqlVariables, envVariables));
          } catch (e) {
            // invalid json variables
          }
        }
        const payload = {
          query: resolveVariables(requestConfig.body?.graphqlQuery || '', envVariables),
          variables: parsedVars,
        };
        fetchBody = JSON.stringify(payload);
        if (!headersObj['Content-Type']) {
          headersObj['Content-Type'] = 'application/json';
        }
      }
    }

    // 6. Handle Request Timeout with AbortController
    let timeoutId = null;

    if (settings.requestTimeoutMs > 0) {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, settings.requestTimeoutMs);
    }

    // 7. Execute Fetch Request with Native Local Node.js Proxy Fallback
    const targetUrl = urlObj.toString();
    const fetchOptions = {
      method,
      headers: headersObj,
      body: fetchBody,
      signal: controller.signal,
      redirect: settings.followRedirects === false ? 'manual' : 'follow',
    };

    let response;
    let usedCorsProxy = false;

    try {
      response = await fetch(targetUrl, fetchOptions);
    } catch (directErr) {
      // If direct fetch failed due to CORS / Network restriction and was NOT cancelled by user or timeout
      if (directErr.name !== 'AbortError' && !controller.signal.aborted) {
        // Retry exclusively using Native Local Node.js Dev Server Proxy (/api-proxy)
        try {
          const localProxyUrl = `/api-proxy?url=${encodeURIComponent(targetUrl)}`;
          response = await fetch(localProxyUrl, fetchOptions);
          usedCorsProxy = true;
        } catch (localProxyErr) {
          throw directErr;
        }
      } else {
        throw directErr;
      }
    }

    if (timeoutId) clearTimeout(timeoutId);

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    // 8. Parse Response Headers & Cookies
    const responseHeaders = [];
    const parsedCookies = [];

    response.headers.forEach((value, key) => {
      responseHeaders.push({ key, value });
      if (key.toLowerCase() === 'set-cookie') {
        const parts = value.split(';');
        const [nameValue] = parts;
        if (nameValue) {
          const [cName, cVal] = nameValue.split('=');
          parsedCookies.push({
            name: cName?.trim(),
            value: cVal?.trim(),
            domain: urlObj.hostname,
            path: '/',
            raw: value,
          });
        }
      }
    });

    if (usedCorsProxy) {
      responseHeaders.push({ key: 'X-Restly-CORS-Bypass', value: 'Active via Native Local Proxy' });
    }

    // 9. Read Response Body & Compute Size
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
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      cookies: parsedCookies,
      data: parsedJson !== null ? parsedJson : rawText,
      rawText,
      isJson,
      durationMs,
      sizeBytes,
      url: targetUrl,
      requestHeaders: headersObj,
      usedCorsProxy,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    const isUserCancelled = externalSignal?.aborted || (err.name === 'AbortError' && settings.requestTimeoutMs === 0);
    let errorMessage = err.message || 'Network error or CORS policy restriction';

    if (isUserCancelled) {
      errorMessage = 'Request cancelled by user';
    } else if (err.name === 'AbortError') {
      errorMessage = `Request timed out after ${settings.requestTimeoutMs} ms.`;
    } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
      errorMessage = 'Failed to fetch. This may be caused by a CORS restriction on the target server, invalid URL, or network disconnection.';
    }

    return {
      success: false,
      status: 0,
      statusText: isUserCancelled ? 'Cancelled' : (err.name === 'AbortError' ? 'Request Timeout' : 'Network Error / CORS'),
      errorMessage,
      headers: [],
      cookies: [],
      data: null,
      rawText: errorMessage,
      isJson: false,
      isCancelled: isUserCancelled,
      durationMs,
      sizeBytes: 0,
      url: requestConfig.url || '',
      requestHeaders: {},
      timestamp: new Date().toISOString(),
    };
  }
};
