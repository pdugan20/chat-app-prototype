// Album art dimensions used throughout the app
const ALBUM_ART_SIZE = 200;

/**
 * Formats an Apple Music artwork URL with the correct dimensions
 */
export function formatArtworkUrl(url: string): string {
  if (!url) return '';

  let formattedUrl = url;

  // Check if URL contains template placeholders
  if (url.includes('{w}') && url.includes('{h}')) {
    // Replace placeholders with actual dimensions
    formattedUrl = url
      .replace('{w}', String(ALBUM_ART_SIZE))
      .replace('{h}', String(ALBUM_ART_SIZE))
      .replace('{f}', 'jpg');
  } else {
    // Check if URL already has dimensions (e.g., "100x100bb.jpg")
    const dimensionPattern = /\/(\d+)x(\d+)bb\.jpg$/;
    if (dimensionPattern.test(url)) {
      // Replace existing dimensions with our standard size
      formattedUrl = url.replace(
        dimensionPattern,
        `/${ALBUM_ART_SIZE}x${ALBUM_ART_SIZE}bb.jpg`
      );
    } else {
      // URL doesn't match an Apple template, so use it as-is.
      formattedUrl = url;
    }
  }

  // Native iOS image requests do not need a CORS proxy. Returning Apple's
  // CDN URL directly avoids relying on an unrelated Cloudinary account.
  return formattedUrl;
}
