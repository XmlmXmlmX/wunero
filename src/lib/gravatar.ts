import crypto from 'crypto';

/**
 * Generate a Gravatar URL from an email address
 * @param email - The user's email address
 * @param size - The size of the avatar (default: 80)
 * @param defaultImage - The default image type ('mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'robohash', 'blank')
 */
export function getGravatarUrl(email: string, size: number = 80, defaultImage: string = 'mp'): string {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = crypto.createHash('md5').update(trimmedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}

/**
 * Generate a Gravatar URL from an email address (client-safe version without crypto)
 * @param email - The user's email address
 * @param size - The size of the avatar (default: 80)
 * @param defaultImage - The default image type
 */
export async function getGravatarUrlClient(email: string, size: number = 80, defaultImage: string = 'mp'): Promise<string> {
  const trimmedEmail = email.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(trimmedEmail);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}
