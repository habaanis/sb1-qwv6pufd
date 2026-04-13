/**
 * Scroll utility function with offset for sticky headers
 *
 * @param elementId - The ID of the element to scroll to (without #)
 * @param offset - Offset in pixels (default: 100px for header height)
 */
export function scrollToWithOffset(elementId: string, offset = 100) {
  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`Element with id "${elementId}" not found`);
    return;
  }

  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/**
 * Scroll to element after a delay (useful for route changes)
 *
 * @param elementId - The ID of the element to scroll to
 * @param offset - Offset in pixels
 * @param delay - Delay in milliseconds (default: 150ms)
 */
export function scrollToWithOffsetDelayed(
  elementId: string,
  offset = 100,
  delay = 150
) {
  setTimeout(() => {
    scrollToWithOffset(elementId, offset);
  }, delay);
}

/**
 * Extract anchor from hash (removes # prefix)
 *
 * @param hash - Window location hash (e.g., "#section-name")
 * @returns The anchor ID without # prefix
 */
export function getAnchorFromHash(hash: string): string | null {
  if (!hash || hash.length <= 1) return null;
  return hash.substring(1);
}
