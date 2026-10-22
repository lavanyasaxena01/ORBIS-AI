/**
 * Resolves browser-accessible HTTP URLs for satellite and raster image assets.
 * Handles relative public paths, backend base URLs, and data URLs.
 */
export function getAssetUrl(url?: string | null): string {
  if (!url) return '';
  
  // Data URLs and full URLs
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Base API URL if configured
  const apiBaseUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    : '';

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return apiBaseUrl ? `${apiBaseUrl}${cleanPath}` : cleanPath;
}

export function logImageError(context: string, failedUrl: string, error?: unknown): void {
  if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
    console.error(
      `[ORBIS AI Satellite Pipeline Error] Failed to load image in ${context}: "${failedUrl}"`,
      error
    );
  }
}
