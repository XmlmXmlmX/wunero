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

export function getIconHorseUrl(url: string): string {
  try {
    const hostname = (new URL(url)).hostname.toLowerCase();
    return `https://icon.horse/icon/${hostname}`;
  } catch {
    return '';
  }
}

const amazonRegionByHost: Record<string, string> = {
  "amazon.de": "DE",
  "amazon.com": "US",
  "amazon.co.uk": "UK",
  "amazon.fr": "FR",
  "amazon.it": "IT",
  "amazon.es": "ES",
  "amazon.nl": "NL",
  "amazon.se": "SE",
  "amazon.pl": "PL",
};

const amazonPartnerTags: Record<string, string | undefined> = {
  DE: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_DE,
  US: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_US,
  UK: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_UK,
  FR: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_FR,
  IT: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_IT,
  ES: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_ES,
  NL: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_NL,
  SE: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_SE,
  PL: process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG_PL,
};

function getAmazonRegionFromHost(hostname: string): string | null {
  const host = hostname.toLowerCase();
  const match = Object.keys(amazonRegionByHost).find((domain) => host === domain || host.endsWith(`.${domain}`));
  return match ? amazonRegionByHost[match] : null;
}

export function addAmazonPartnerTag(url: string | undefined): string | undefined {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return undefined;

  try {
    const urlObj = new URL(sanitized);
    const region = getAmazonRegionFromHost(urlObj.hostname);
    if (!region) return sanitized;

    const partnerTag = amazonPartnerTags[region];
    if (!partnerTag) return sanitized;

    if (!urlObj.searchParams.get("tag")) {
      urlObj.searchParams.set("tag", partnerTag);
    }

    return urlObj.toString();
  } catch {
    return sanitized;
  }
}

export function isAmazonAffiliateUrl(url: string | undefined): boolean {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return false;

  try {
    const urlObj = new URL(sanitized);
    const region = getAmazonRegionFromHost(urlObj.hostname);
    if (!region) return false;

    const partnerTag = amazonPartnerTags[region];
    if (!partnerTag) return false;

    const tag = urlObj.searchParams.get("tag");
    return tag === partnerTag;
  } catch {
    return false;
  }
}
