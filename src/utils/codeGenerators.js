/**
 * Code Snippet Generator for cURL, JS (Fetch / Axios), Python, Go
 */
import { resolveVariables } from './variableResolver';

export const generateCodeSnippet = (requestConfig, language = 'curl', envVariables = []) => {
  const url = resolveVariables(requestConfig.url || '', envVariables);
  const method = (requestConfig.method || 'GET').toUpperCase();

  // Params
  let fullUrl = url;
  if (Array.isArray(requestConfig.params) && requestConfig.params.length > 0) {
    const activeParams = requestConfig.params.filter((p) => p.enabled !== false && p.key);
    if (activeParams.length) {
      try {
        const uObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        activeParams.forEach((p) => {
          uObj.searchParams.append(
            resolveVariables(p.key, envVariables),
            resolveVariables(p.value || '', envVariables)
          );
        });
        fullUrl = uObj.toString();
      } catch (e) {
        // Fallback simple concat
        const queryStr = activeParams
          .map((p) => `${encodeURIComponent(resolveVariables(p.key, envVariables))}=${encodeURIComponent(resolveVariables(p.value || '', envVariables))}`)
          .join('&');
        fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryStr}`;
      }
    }
  }

  // Headers
  const headers = [];
  if (Array.isArray(requestConfig.headers)) {
    requestConfig.headers.forEach((h) => {
      if (h.enabled !== false && h.key) {
        headers.push({
          key: resolveVariables(h.key, envVariables),
          value: resolveVariables(h.value || '', envVariables),
        });
      }
    });
  }

  // Auth headers
  const auth = requestConfig.auth || { type: 'none' };
  if (auth.type === 'bearer' && auth.token) {
    headers.push({ key: 'Authorization', value: `Bearer ${resolveVariables(auth.token, envVariables)}` });
  } else if (auth.type === 'basic') {
    const creds = btoa(`${resolveVariables(auth.username || '', envVariables)}:${resolveVariables(auth.password || '', envVariables)}`);
    headers.push({ key: 'Authorization', value: `Basic ${creds}` });
  } else if (auth.type === 'apikey' && auth.addTo === 'header' && auth.key) {
    headers.push({ key: resolveVariables(auth.key, envVariables), value: resolveVariables(auth.value || '', envVariables) });
  }

  // Body
  let bodyStr = '';
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    if (requestConfig.body?.mode === 'json') {
      bodyStr = resolveVariables(requestConfig.body?.json || '', envVariables);
    } else if (requestConfig.body?.mode === 'raw') {
      bodyStr = resolveVariables(requestConfig.body?.raw || '', envVariables);
    }
  }

  switch (language) {
    case 'curl':
      return generateCurl(method, fullUrl, headers, bodyStr);
    case 'javascript-fetch':
      return generateJsFetch(method, fullUrl, headers, bodyStr);
    case 'javascript-axios':
      return generateJsAxios(method, fullUrl, headers, bodyStr);
    case 'python':
      return generatePython(method, fullUrl, headers, bodyStr);
    case 'go':
      return generateGo(method, fullUrl, headers, bodyStr);
    default:
      return generateCurl(method, fullUrl, headers, bodyStr);
  }
};

const generateCurl = (method, url, headers, body) => {
  let cmd = `curl --location --request ${method} '${url}'`;
  headers.forEach((h) => {
    cmd += ` \\\n  --header '${h.key}: ${h.value}'`;
  });
  if (body) {
    cmd += ` \\\n  --data-raw '${body.replace(/'/g, "'\\''")}'`;
  }
  return cmd;
};

const generateJsFetch = (method, url, headers, body) => {
  const headersObj = {};
  headers.forEach((h) => { headersObj[h.key] = h.value; });

  let code = `const myHeaders = new Headers();\n`;
  headers.forEach((h) => {
    code += `myHeaders.append("${h.key}", "${h.value}");\n`;
  });

  code += `\nconst requestOptions = {\n  method: "${method}",\n  headers: myHeaders,\n`;
  if (body) {
    code += `  body: JSON.stringify(${body.trim().startsWith('{') ? body : JSON.stringify(body)}),\n`;
  }
  code += `  redirect: "follow"\n};\n\n`;
  code += `fetch("${url}", requestOptions)\n  .then((response) => response.json())\n  .then((result) => console.log(result))\n  .catch((error) => console.error(error));`;
  return code;
};

const generateJsAxios = (method, url, headers, body) => {
  const headersObj = {};
  headers.forEach((h) => { headersObj[h.key] = h.value; });

  let code = `import axios from 'axios';\n\n`;
  code += `const config = {\n  method: '${method.toLowerCase()}',\n  url: '${url}',\n`;
  if (headers.length) {
    code += `  headers: ${JSON.stringify(headersObj, null, 4)},\n`;
  }
  if (body) {
    code += `  data: ${body.trim().startsWith('{') ? body : JSON.stringify(body)}\n`;
  }
  code += `};\n\naxios.request(config)\n  .then((response) => {\n    console.log(JSON.stringify(response.data));\n  })\n  .catch((error) => {\n    console.error(error);\n  });`;
  return code;
};

const generatePython = (method, url, headers, body) => {
  const headersObj = {};
  headers.forEach((h) => { headersObj[h.key] = h.value; });

  let code = `import requests\nimport json\n\n`;
  code += `url = "${url}"\n`;
  if (body) {
    code += `payload = json.dumps(${body.trim().startsWith('{') ? body : JSON.stringify(body)})\n`;
  } else {
    code += `payload = {}\n`;
  }
  code += `headers = ${JSON.stringify(headersObj, null, 2)}\n\n`;
  code += `response = requests.request("${method}", url, headers=headers, data=payload)\n\n`;
  code += `print(response.text)`;
  return code;
};

const generateGo = (method, url, headers, body) => {
  let code = `package main\n\nimport (\n  "fmt"\n  "net/http"\n  "io"\n`;
  if (body) code += `  "strings"\n`;
  code += `)\n\nfunc main() {\n  url := "${url}"\n  method := "${method}"\n\n`;
  if (body) {
    code += `  payload := strings.NewReader(\`${body}\`)\n`;
    code += `  client := &http.Client{}\n`;
    code += `  req, err := http.NewRequest(method, url, payload)\n`;
  } else {
    code += `  client := &http.Client{}\n`;
    code += `  req, err := http.NewRequest(method, url, nil)\n`;
  }
  code += `  if err != nil {\n    fmt.Println(err)\n    return\n  }\n`;

  headers.forEach((h) => {
    code += `  req.Header.Add("${h.key}", "${h.value}")\n`;
  });

  code += `\n  res, err := client.Do(req)\n  if err != nil {\n    fmt.Println(err)\n    return\n  }\n  defer res.Body.Close()\n\n`;
  code += `  body, err := io.ReadAll(res.Body)\n  if err != nil {\n    fmt.Println(err)\n    return\n  }\n  fmt.Println(string(body))\n}`;
  return code;
};
