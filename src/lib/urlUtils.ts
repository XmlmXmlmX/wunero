/**
 * Sanitize and validate URLs to prevent XSS and other attacks
 */
export function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return undefined;
    }
    
    return urlObj.toString();
  } catch {
    return undefined;
  }
}

/**
 * Validate if an image URL is safe to display
 */
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Block localhost and private IPs
    const hostname = urlObj.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname === '[::1]'
    ) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
