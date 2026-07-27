/**
 * Google OAuth 2.0 & Google Drive AppData Sync Engine for API Kit
 */

const DEFAULT_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'restly_workspace.json';

// Local storage key for storing user session and custom client ID
export const GOOGLE_KEYS = {
  CLIENT_ID: 'restly_google_client_id',
  USER_PROFILE: 'restly_google_user',
  ACCESS_TOKEN: 'restly_google_token',
  LAST_SYNC: 'restly_google_last_sync',
};

export const getStoredClientId = () => {
  return localStorage.getItem(GOOGLE_KEYS.CLIENT_ID) || DEFAULT_CLIENT_ID;
};

export const setStoredClientId = (clientId) => {
  if (clientId) {
    localStorage.setItem(GOOGLE_KEYS.CLIENT_ID, clientId);
  } else {
    localStorage.removeItem(GOOGLE_KEYS.CLIENT_ID);
  }
};

/**
 * Request OAuth 2.0 Access Token using Google Identity Services (GIS)
 */
export const requestGoogleLogin = (clientId, callback) => {
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services SDK is not loaded yet.');
  }

  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: `openid profile email ${DRIVE_APPDATA_SCOPE}`,
    callback: async (tokenResponse) => {
      if (tokenResponse.error) {
        callback({ error: tokenResponse.error });
        return;
      }

      const accessToken = tokenResponse.access_token;
      try {
        const userInfo = await fetchUserProfile(accessToken);
        callback({ accessToken, user: userInfo });
      } catch (err) {
        callback({ error: err.message });
      }
    },
  });

  tokenClient.requestAccessToken();
};

/**
 * Fetch Google user profile
 */
export const fetchUserProfile = async (accessToken) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch Google user profile');
  }
  return await res.json();
};

/**
 * Find existing apikit_workspace.json file ID in Google Drive AppData folder
 */
export const findDriveFileId = async (accessToken) => {
  const query = encodeURIComponent(`name='${FILE_NAME}' and 'appDataFolder' in parents and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=appDataFolder&fields=files(id,name,modifiedTime)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive search failed: ${res.statusText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
};

/**
 * Save / Upload API Kit workspace payload to Google Drive AppData
 */
export const saveWorkspaceToGoogleDrive = async (accessToken, workspacePayload) => {
  const fileId = await findDriveFileId(accessToken);
  const content = JSON.stringify(workspacePayload, null, 2);

  if (fileId) {
    // Update existing file
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: content,
      }
    );

    if (!res.ok) throw new Error('Failed to update workspace file on Google Drive');
    return await res.json();
  } else {
    // Create new file in appDataFolder
    const metadata = {
      name: FILE_NAME,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', new Blob([content], { type: 'application/json' }));

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      }
    );

    if (!res.ok) throw new Error('Failed to create workspace file on Google Drive');
    return await res.json();
  }
};

/**
 * Load workspace payload from Google Drive AppData
 */
export const loadWorkspaceFromGoogleDrive = async (accessToken) => {
  const fileId = await findDriveFileId(accessToken);
  if (!fileId) return null;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) throw new Error('Failed to download workspace from Google Drive');
  return await res.json();
};
