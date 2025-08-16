// Album art dimensions used throughout the app
export const ALBUM_ART_SIZE = 200;

/**
 * Formats an Apple Music artwork URL with the correct dimensions
 * Handles both template URLs (with {w}, {h}, {f} placeholders) and pre-formatted URLs
 */
export function formatArtworkUrl(url: string): string {
  if (!url) return '';

  // Check if URL contains template placeholders
  if (url.includes('{w}') && url.includes('{h}')) {
    // Replace placeholders with actual dimensions
    return url
      .replace('{w}', String(ALBUM_ART_SIZE))
      .replace('{h}', String(ALBUM_ART_SIZE))
      .replace('{f}', 'jpg');
  }

  // Check if URL already has dimensions (e.g., "100x100bb.jpg")
  const dimensionPattern = /\/(\d+)x(\d+)bb\.jpg$/;
  if (dimensionPattern.test(url)) {
    // Replace existing dimensions with our standard size
    return url.replace(
      dimensionPattern,
      `/${ALBUM_ART_SIZE}x${ALBUM_ART_SIZE}bb.jpg`
    );
  }

  // URL doesn't match expected patterns, return as-is
  console.warn('Unexpected artwork URL format:', url);
  return url;
}
