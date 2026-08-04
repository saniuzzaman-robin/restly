/**
 * Postman-Architecture HTTP Request Execution Engine
 *
 * Desktop Mode (macOS / Windows):
 * Routes 100% of HTTP execution through Native Rust Sockets via 'execute_native_http' (reqwest).
 * Completely bypasses WebKit/Chromium browser engine, CORS policies, Origin headers, and SSL restrictions.
 *
 * Web Mode (Local Dev / Web):
 * Uses standard Fetch API with local Node.js proxy fallback (/api-proxy).
 */
import { resolveVariables } from './variableResolver';
import { invoke } from '@tauri-apps/api/core';

export const executeHttpRequest = async (requestConfig, envVariables = [], storedCookies = [], externalSignal = null) => {
  const startTime = performance.now();
  const settings = requestConfig.settings || {};

  // Initialize AbortController
  const controller = new AbortController();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  const method = (requestConfig.method || 'GET').toUpperCase();
  const headersObj = {};
  let fetchBody = null;
  let targetUrl = '';

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
        if (param.enabled !== false && param.key && param.key.trim()) {
          const resolvedKey = resolveVariables(param.key.trim(), envVariables);
          const resolvedVal = resolveVariables(param.value || '', envVariables);
          urlObj.searchParams.append(resolvedKey, resolvedVal);
        }
      });
    }

    targetUrl = urlObj.toString();

    // 3. Build Headers
    if (Array.isArray(requestConfig.headers)) {
      requestConfig.headers.forEach((h) => {
        if (h.enabled !== false && h.key && h.key.trim()) {
          const resolvedKey = resolveVariables(h.key.trim(), envVariables);
          const resolvedVal = resolveVariables(h.value || '', envVariables);
          headersObj[resolvedKey] = resolvedVal;
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
      const k = resolveVariables(auth.key.trim(), envVariables);
      const v = resolveVariables(auth.value, envVariables);
      if (auth.addTo === 'query') {
        urlObj.searchParams.append(k, v);
        targetUrl = urlObj.toString();
      } else {
        headersObj[k] = v;
      }
    }

    // 5. Build Request Body
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
                resolveVariables(item.key.trim(), envVariables),
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
              const key = resolveVariables(item.key.trim(), envVariables);
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

    // 7. Postman-style Execution: Route 100% through Native Rust Sockets in Desktop App
    try {
      let tauriBody = fetchBody;
      if (tauriBody instanceof URLSearchParams) {
        tauriBody = tauriBody.toString();
      } else if (tauriBody && typeof tauriBody === 'object' && !(tauriBody instanceof ArrayBuffer) && !(tauriBody instanceof Uint8Array)) {
        if (tauriBody instanceof FormData) {
          const params = new URLSearchParams();
          for (const [k, v] of tauriBody.entries()) {
            if (typeof v === 'string') params.append(k, v);
          }
          tauriBody = params.toString();
        } else {
          tauriBody = JSON.stringify(tauriBody);
        }
      }

      const nativeRes = await invoke('execute_native_http', {
        req: {
          url: targetUrl,
          method,
          headers: headersObj,
          body: tauriBody || null,
          timeout_ms: settings.requestTimeoutMs || 30000,
        },
      });

      if (timeoutId) clearTimeout(timeoutId);

      let parsedJson = null;
      let isJson = false;
      const rawText = nativeRes.raw_text || '';

      if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        try {
          parsedJson = JSON.parse(rawText);
          isJson = true;
        } catch (e) {
          // Not valid JSON
        }
      }

      return {
        success: nativeRes.status >= 200 && nativeRes.status < 400,
        status: nativeRes.status,
        statusText: nativeRes.status_text,
        headers: nativeRes.headers || [],
        cookies: [],
        data: parsedJson !== null ? parsedJson : rawText,
        rawText,
        isJson,
        durationMs: nativeRes.duration_ms,
        sizeBytes: new Blob([rawText]).size,
        url: targetUrl,
        method,
        requestHeaders: headersObj,
        requestBody: typeof fetchBody === 'string' ? fetchBody : (fetchBody ? String(fetchBody) : null),
        timestamp: new Date().toISOString(),
      };
    } catch (nativeErr) {
      const isWebBrowser = typeof window !== 'undefined' && !window.__TAURI_INTERNALS__ && !window.__TAURI__;
      if (!isWebBrowser) {
        console.error('Native Rust HTTP Engine Execution Error:', nativeErr);
        return {
          success: false,
          status: 0,
          statusText: 'Native Request Error',
          errorMessage: typeof nativeErr === 'string' ? nativeErr : (nativeErr?.message || JSON.stringify(nativeErr)),
          headers: [],
          cookies: [],
          data: null,
          rawText: typeof nativeErr === 'string' ? nativeErr : (nativeErr?.message || JSON.stringify(nativeErr)),
          isJson: false,
          durationMs: 0,
          sizeBytes: 0,
          url: targetUrl,
          method,
          requestHeaders: headersObj,
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Web Fallback for browser execution in local dev server
    const fetchOptions = {
      method,
      headers: headersObj,
      body: fetchBody,
      signal: controller.signal,
      redirect: settings.followRedirects === false ? 'manual' : 'follow',
    };

    let response;
    let usedCorsProxy = false;
    const isViteDev = typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;

    try {
      response = await fetch(targetUrl, fetchOptions);
    } catch (directErr) {
      if (isViteDev && directErr.name !== 'AbortError' && !controller.signal.aborted) {
        const localProxyUrl = `/api-proxy?url=${encodeURIComponent(targetUrl)}`;
        response = await fetch(localProxyUrl, fetchOptions);
        usedCorsProxy = true;
      } else {
        throw directErr;
      }
    }

    if (timeoutId) clearTimeout(timeoutId);

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    const responseHeaders = [];
    if (response.headers && typeof response.headers.forEach === 'function') {
      response.headers.forEach((value, key) => {
        responseHeaders.push({ key, value });
      });
    }

    const rawText = await response.text();
    const sizeBytes = new Blob([rawText]).size;

    let parsedJson = null;
    let isJson = false;

    if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
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
      cookies: [],
      data: parsedJson !== null ? parsedJson : rawText,
      rawText,
      isJson,
      durationMs,
      sizeBytes,
      url: targetUrl,
      method,
      requestHeaders: headersObj,
      requestBody: typeof fetchBody === 'string' ? fetchBody : (fetchBody ? String(fetchBody) : null),
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
      url: targetUrl || requestConfig.url || '',
      method,
      requestHeaders: headersObj,
      requestBody: typeof fetchBody === 'string' ? fetchBody : (fetchBody ? String(fetchBody) : null),
      timestamp: new Date().toISOString(),
    };
  }
};
