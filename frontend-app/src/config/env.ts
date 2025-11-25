/**
 * Environment configuration helper
 */

interface EnvironmentConfig {
  apiUrl: string;
  apiPrefix: string;
  appName: string;
  appVersion: string;
  enablePlugins: boolean;
  enableAnalytics: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Get environment variable with type safety
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === true;
}

/**
 * Application environment configuration
 */
export const env: EnvironmentConfig = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:3000'),
  apiPrefix: getEnvVar('VITE_API_PREFIX', '/api'),
  appName: getEnvVar('VITE_APP_NAME', 'ENXP Platform'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  enablePlugins: getEnvBoolean('VITE_ENABLE_PLUGINS', true),
  enableAnalytics: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * Get full API URL
 */
export function getApiUrl(path: string = ''): string {
  const base = `${env.apiUrl}${env.apiPrefix}`;
  return path ? `${base}${path.startsWith('/') ? path : `/${path}`}` : base;
}

/**
 * Log environment info (development only)
 */
if (env.isDevelopment) {
  console.log('[ENV]', {
    mode: import.meta.env.MODE,
    apiUrl: env.apiUrl,
    appName: env.appName,
    features: {
      plugins: env.enablePlugins,
      analytics: env.enableAnalytics,
    },
  });
}
