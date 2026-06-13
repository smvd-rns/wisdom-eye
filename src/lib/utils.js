/**
 * Formats image URLs, specifically converting Google Drive share links
 * into direct public thumbnail URLs. This serves direct images to <img> tags
 * without utilizing Vercel's server-side image optimization quota.
 * 
 * @param {string} url - The original image URL
 * @param {number} width - The requested width for resizing (default 600)
 * @returns {string} The formatted direct image URL
 */
export function formatImageUrl(url, width = 600) {
  if (!url || typeof url !== 'string') return '';

  // Handle Google Drive links
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    // Match /file/d/[FILE_ID]
    const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    let fileId = matchD ? matchD[1] : null;

    if (!fileId) {
      // Match ?id=[FILE_ID] or &id=[FILE_ID]
      const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      fileId = matchId ? matchId[1] : null;
    }

    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
    }
  }

  return url;
}
