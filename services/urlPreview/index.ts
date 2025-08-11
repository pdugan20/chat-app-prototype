// Export all public types and services
export * from './types';
export { urlPreviewService } from './URLPreviewService';
export { previewRegistry } from './registry/PreviewRegistry';

// Export parsers
export { appleMusicParser } from './parsers/AppleMusicParser';

// Initialize the service with default parsers
import { urlPreviewService } from './URLPreviewService';
import { appleMusicParser } from './parsers/AppleMusicParser';

// Register default parsers
urlPreviewService.registerParser(appleMusicParser);
