import { BoxClient } from 'box-typescript-sdk-gen/lib/client.generated.js';
import {
  BoxCcgAuth,
  CcgConfig,
} from 'box-typescript-sdk-gen/lib/box/ccgAuth.generated.js';

interface TokenCache {
  client: BoxClient | null;
  expiryTime: number | null;
}

// Simple in-memory token cache
const tokenCache: TokenCache = {
  client: null,
  expiryTime: null,
};

export async function getBoxClient(): Promise<BoxClient> {
  const currentTime = Date.now();
  
  // Check if we have a valid token
  if (tokenCache.client && tokenCache.expiryTime && currentTime < tokenCache.expiryTime) {
    return tokenCache.client;
  }
  
  // Initialize new Box client with credentials
  const ccgConfig = new CcgConfig({
    enterpriseId: process.env.BOX_ENTERPRISE_ID || '',
    clientId: process.env.BOX_CLIENT_ID || '',
    clientSecret: process.env.BOX_CLIENT_SECRET || '',
  });
  
  const ccgAuth = new BoxCcgAuth({ config: ccgConfig });
  const client = new BoxClient({ auth: ccgAuth });
  
  // Set expiry time to 55 minutes from now (to be safe)
  const expiryTime = currentTime + (55 * 60 * 1000);
  
  // Update cache
  tokenCache.client = client;
  tokenCache.expiryTime = expiryTime;
  
  return client;
}