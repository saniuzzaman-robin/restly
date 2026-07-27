/**
 * Resolves dynamic {{variableName}} tokens in strings using an environment object or list.
 */

export const resolveVariables = (str, envVariables = {}) => {
  if (!str || typeof str !== 'string') return str;

  // Handle case where envVariables is an array of { key, value, enabled }
  let varMap = {};
  if (Array.isArray(envVariables)) {
    envVariables.forEach((v) => {
      if (v.enabled !== false && v.key) {
        varMap[v.key] = v.value ?? '';
      }
    });
  } else if (typeof envVariables === 'object' && envVariables !== null) {
    varMap = envVariables;
  }

  // Replace {{varName}}
  return str.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    return varMap[key] !== undefined ? varMap[key] : match;
  });
};

/**
 * Extracts all {{variableName}} tokens present in a text string.
 */
export const extractVariableTokens = (str) => {
  if (!str || typeof str !== 'string') return [];
  const matches = str.match(/\{\{\s*([\w.-]+)\s*\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/[\{\}\s]/g, ''))));
};
