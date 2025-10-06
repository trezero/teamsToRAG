import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Acquires an OAuth2 access token based on configured auth mode
 * @param {Function} onDeviceCodeCallback - Called when device code is ready (for delegated flow)
 * @returns {Promise<string>} Access token
 */
export async function getAccessToken(onDeviceCodeCallback = null) {
  const authMode = process.env.AUTH_MODE || 'application';

  if (authMode === 'delegated') {
    return getAccessTokenDelegated(onDeviceCodeCallback);
  } else {
    return getAccessTokenApplication();
  }
}

/**
 * Acquires an OAuth2 access token using client credentials flow (application permissions)
 * @returns {Promise<string>} Access token
 */
async function getAccessTokenApplication() {
  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET } = process.env;

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'Missing required environment variables for application auth: TENANT_ID, CLIENT_ID, CLIENT_SECRET'
    );
  }

  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  });

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to acquire token: ${error.response.data.error_description || error.response.data.error}`
      );
    }
    throw new Error(`Failed to acquire token: ${error.message}`);
  }
}

/**
 * Acquires an OAuth2 access token using device code flow (delegated permissions)
 * @param {Function} onDeviceCodeCallback - Called with device code info for user to complete auth
 * @returns {Promise<string>} Access token
 */
async function getAccessTokenDelegated(onDeviceCodeCallback = null) {
  const { TENANT_ID, CLIENT_ID } = process.env;

  if (!TENANT_ID || !CLIENT_ID) {
    throw new Error(
      'Missing required environment variables for delegated auth: TENANT_ID, CLIENT_ID'
    );
  }

  // Step 1: Request device code
  const deviceCodeUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/devicecode`;

  const deviceCodeParams = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'https://graph.microsoft.com/ChatMessage.Read https://graph.microsoft.com/Chat.Read https://graph.microsoft.com/ChannelMessage.Read.All https://graph.microsoft.com/User.Read offline_access',
  });

  let deviceCodeData;
  try {
    const deviceCodeResponse = await axios.post(deviceCodeUrl, deviceCodeParams, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    deviceCodeData = deviceCodeResponse.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to request device code: ${error.response.data.error_description || error.response.data.error}`
      );
    }
    throw new Error(`Failed to request device code: ${error.message}`);
  }

  // Notify caller about device code (so they can display it to user)
  if (onDeviceCodeCallback) {
    onDeviceCodeCallback({
      userCode: deviceCodeData.user_code,
      verificationUrl: deviceCodeData.verification_uri,
      message: deviceCodeData.message,
      expiresIn: deviceCodeData.expires_in,
    });
  }

  // Step 2: Poll for token
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const interval = deviceCodeData.interval * 1000 || 5000; // Convert to milliseconds
  const expiresAt = Date.now() + (deviceCodeData.expires_in * 1000);

  while (Date.now() < expiresAt) {
    await new Promise((resolve) => setTimeout(resolve, interval));

    const tokenParams = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      device_code: deviceCodeData.device_code,
    });

    try {
      const tokenResponse = await axios.post(tokenUrl, tokenParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return tokenResponse.data.access_token;
    } catch (error) {
      if (error.response) {
        const errorCode = error.response.data.error;

        // These errors mean we should keep polling
        if (errorCode === 'authorization_pending' || errorCode === 'slow_down') {
          continue;
        }

        // Any other error means we should stop
        const errorDescription = error.response.data.error_description || errorCode;

        // Provide helpful message for common configuration errors
        if (errorCode === 'AADSTS7000218' || errorDescription.includes('client_assertion')) {
          throw new Error(
            `Azure AD configuration error: The app registration must allow public client flows.\n\n` +
            `To fix this:\n` +
            `1. Go to Azure Portal → Azure AD → App registrations → Your app\n` +
            `2. Click 'Authentication' in the left menu\n` +
            `3. Scroll to 'Advanced settings' → 'Allow public client flows'\n` +
            `4. Set to 'Yes' and click Save\n\n` +
            `Original error: ${errorDescription}`
          );
        }

        throw new Error(`Failed to acquire token: ${errorDescription}`);
      }
      // Network error - keep trying
      continue;
    }
  }

  throw new Error('Device code expired. Authentication timed out.');
}
