/**
 * cURL Command Line Parser
 * Parses cURL strings into structured request objects: { method, url, params, headers, auth, body }
 */

export const parseCurlCommand = (curlString) => {
  if (!curlString || typeof curlString !== 'string') {
    throw new Error('Invalid cURL input');
  }

  let str = curlString.trim();
  if (!str.toLowerCase().startsWith('curl')) {
    throw new Error('Input does not start with cURL command');
  }

  // Sanitize line breaks and multi-line continuation backslashes
  str = str.replace(/\\\r?\n/g, ' ').replace(/\n/g, ' ');

  const result = {
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    auth: { type: 'none' },
    body: { mode: 'none', raw: '', json: '' },
  };

  // Simple token regex matching quoted strings or space-delimited tokens
  const args = [];
  const regex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|(\S+)/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    const token = match[1] ?? match[2] ?? match[3];
    args.push(token);
  }

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    // Method flags: -X, --request
    if (arg === '-X' || arg === '--request') {
      if (args[i + 1]) {
        result.method = args[i + 1].toUpperCase();
        i++;
      }
    }
    // Header flags: -H, --header
    else if (arg === '-H' || arg === '--header') {
      if (args[i + 1]) {
        const headerStr = args[i + 1];
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx !== -1) {
          const key = headerStr.substring(0, colonIdx).trim();
          const value = headerStr.substring(colonIdx + 1).trim();

          // Check if Authorization header
          if (key.toLowerCase() === 'authorization') {
            if (value.toLowerCase().startsWith('bearer ')) {
              result.auth = { type: 'bearer', token: value.substring(7).trim() };
            } else if (value.toLowerCase().startsWith('basic ')) {
              try {
                const decoded = atob(value.substring(6).trim());
                const [u, p] = decoded.split(':');
                result.auth = { type: 'basic', username: u || '', password: p || '' };
              } catch (e) {
                result.headers.push({ key, value, enabled: true });
              }
            } else {
              result.headers.push({ key, value, enabled: true });
            }
          } else {
            result.headers.push({ key, value, enabled: true });
          }
        }
        i++;
      }
    }
    // Basic Auth flag: -u, --user
    else if (arg === '-u' || arg === '--user') {
      if (args[i + 1]) {
        const [u, p] = args[i + 1].split(':');
        result.auth = { type: 'basic', username: u || '', password: p || '' };
        i++;
      }
    }
    // Data flags: -d, --data, --data-raw, --data-binary, --data-urlencode
    else if (
      arg === '-d' ||
      arg === '--data' ||
      arg === '--data-raw' ||
      arg === '--data-binary' ||
      arg === '--data-urlencode'
    ) {
      if (args[i + 1]) {
        const dataVal = args[i + 1];
        // Default method to POST if still GET
        if (result.method === 'GET') {
          result.method = 'POST';
        }

        try {
          JSON.parse(dataVal);
          result.body = {
            mode: 'json',
            json: dataVal,
            raw: dataVal,
          };
        } catch (e) {
          result.body = {
            mode: 'raw',
            raw: dataVal,
            json: '',
          };
        }
        i++;
      }
    }
    // URL target string
    else if (!arg.startsWith('-') && /^https?:\/\//i.test(arg)) {
      result.url = arg;
    } else if (!arg.startsWith('-') && arg.includes('.') && !result.url) {
      result.url = arg.startsWith('http') ? arg : `https://${arg}`;
    }
  }

  // Fallback URL if token matched without protocol
  if (!result.url) {
    const urlArg = args.find((a) => !a.startsWith('-') && a !== 'curl' && (a.includes('http') || a.includes('/')));
    if (urlArg) {
      result.url = urlArg;
    }
  }

  // Parse URL query parameters if present
  if (result.url) {
    try {
      const uObj = new URL(result.url.startsWith('http') ? result.url : `https://${result.url}`);
      const params = [];
      uObj.searchParams.forEach((value, key) => {
        params.push({ key, value, enabled: true });
      });
      if (params.length) {
        result.params = params;
        // strip query string from base url for clean editing
        result.url = `${uObj.origin}${uObj.pathname}`;
      }
    } catch (e) {
      // Keep raw url
    }
  }

  return result;
};
