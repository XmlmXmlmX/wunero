import * as cheerio from 'cheerio';
import type { Currency } from '@/types';

export interface ProductInfo {
  title?: string;
  image_url?: string;
  price?: string;
  currency?: Currency;
  timedOut?: boolean;
  blocked?: boolean; 
}

/**
 * Extract price and currency from a price string
 */
function extractPriceAndCurrency(priceText: string): { price?: string; currency?: Currency } {
  if (!priceText) return {};
  
  // Remove whitespace and normalize
  const normalized = priceText.trim().replace(/\s+/g, ' ');
  
  // Detect currency symbol
  let currency: Currency | undefined;
  if (normalized.includes('€') || normalized.includes('EUR')) {
    currency = 'EUR';
  } else if (normalized.includes('£') || normalized.includes('GBP')) {
    currency = 'GBP';
  } else if (normalized.includes('$') || normalized.includes('USD')) {
    currency = 'USD';
  }
  
  // Extract numeric price (remove currency symbols and letters)
  const price = normalized.replace(/[€£$A-Za-z]/g, '').trim();
  
  return {
    price: price || undefined,
    currency,
  };
}

/**
 * Detect currency from currency code string
 */
function detectCurrency(currencyCode?: string): Currency | undefined {
  if (!currencyCode) return undefined;
  
  const code = currencyCode.toUpperCase();
  if (code === 'EUR' || code === 'EURO') return 'EUR';
  if (code === 'GBP' || code === 'POUND') return 'GBP';
  if (code === 'USD' || code === 'DOLLAR') return 'USD';
  
  return undefined;
}

// Rate limiting to prevent abuse
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

/**
 * Validate and sanitize URL
 */
function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol;
    
    // Only allow HTTP and HTTPS
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }
    
    // Block localhost and private IPs to prevent SSRF
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
    
    // Check for 172.16.0.0/12 range (172.16.0.0 - 172.31.255.255)
    const ip172Match = hostname.match(/^172\.(\d+)\./);
    if (ip172Match) {
      const secondOctet = parseInt(ip172Match[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Check rate limit for URL fetching
 */
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(key) || 0;
  
  if (now - lastRequest < RATE_LIMIT_WINDOW) {
    return false;
  }
  
  rateLimitMap.set(key, now);
  return true;
}

/**
 * Extract product information from a URL
 */
export async function extractProductInfo(url: string): Promise<ProductInfo> {
  try {
    // Validate URL
    if (!validateUrl(url)) {
      console.warn('Invalid or unsafe URL:', url);
      return {};
    }
    
    // Check rate limit
    if (!checkRateLimit('product-fetch')) {
      console.warn('Rate limit exceeded for product fetching');
      return {};
    }
    
    console.log(`Starting fetch for: ${url}`);
    const startTime = Date.now();
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      // 8s timeout - some sites have bot protection and won't respond
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      return {};
    }

    const html = await response.text();
    const fetchTime = Date.now() - startTime;
    console.log(`Fetched HTML in ${fetchTime}ms: ${html.length} bytes, status: ${response.status}`);
    const $ = cheerio.load(html);

    let title: string | undefined;
    let image_url: string | undefined;
    let price: string | undefined;
    let currency: Currency | undefined;

    // Amazon selectors
    if (url.includes('amazon.')) {
      title = $('#productTitle').text().trim() || 
              $('h1.product-title').text().trim();
      image_url = $('#landingImage').attr('src') || 
                  $('.imgTagWrapper img').attr('src');
      const priceText = $('.a-price .a-offscreen').first().text().trim() || 
              $('#priceblock_ourprice').text().trim();
      const parsedPrice = extractPriceAndCurrency(priceText);
      price = parsedPrice.price;
      currency = parsedPrice.currency;
    }
    // eBay selectors
    else if (url.includes('ebay.')) {
      title = $('.x-item-title__mainTitle').text().trim() || 
              $('#itemTitle').text().trim();
      image_url = $('.ux-image-carousel-item img').first().attr('src') || 
                  $('#icImg').attr('src');
      const priceText = $('.x-price-primary').first().text().trim() || 
              $('#prcIsum').text().trim();
      const parsedPrice = extractPriceAndCurrency(priceText);
      price = parsedPrice.price;
      currency = parsedPrice.currency;
    }
    // Idealo selectors
    else if (url.includes('idealo.')) {
      title = $('h1[data-test="product-title"]').text().trim() || 
              $('.oopStage-mainContent-title').text().trim();
      image_url = $('.oopStage-mainContent-mainImage img').attr('src');
      const priceText = $('.oopStage-mainContent-priceSection-price').text().trim();
      const parsedPrice = extractPriceAndCurrency(priceText);
      price = parsedPrice.price;
      currency = parsedPrice.currency;
      
      // Idealo often uses JavaScript rendering, fallback to Open Graph meta tags
      if (!title) {
        title = $('meta[property="og:title"]').attr('content') || 
                $('title').text().trim();
        console.log('Idealo: Using Open Graph fallback for title');
      }
      if (!image_url) {
        image_url = $('meta[property="og:image"]').attr('content');
      }
      if (!price) {
        const metaPrice = $('meta[property="product:price:amount"]').attr('content');
        const metaCurrency = $('meta[property="product:price:currency"]').attr('content');
        price = metaPrice;
        currency = detectCurrency(metaCurrency);
      }
      
      console.log('Idealo extracted:', { title: !!title, image_url: !!image_url, price: !!price, currency });
    }
    // Generic Open Graph fallback
    else {
      title = $('meta[property="og:title"]').attr('content') || 
              $('title').text().trim();
      image_url = $('meta[property="og:image"]').attr('content') || 
                  $('img').first().attr('src');
      const metaPrice = $('meta[property="og:price:amount"]').attr('content');
      const metaCurrency = $('meta[property="og:price:currency"]').attr('content');
      price = metaPrice;
      currency = detectCurrency(metaCurrency);
    }

    return {
      title: title || undefined,
      image_url: image_url || undefined,
      price: price || undefined,
      currency: currency || undefined,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      const hostname = new URL(url).hostname;
      console.warn(`Product fetch timed out for ${hostname} - likely bot protection`);
      return { 
        title: undefined,
        image_url: undefined,
        price: undefined,
        currency: undefined,
        timedOut: true,
        blocked: true 
      };
    }

    console.error('Error extracting product info:', error);
    return {};
  }
}

/**
 * Validate if a URL is from a supported platform
 */
export function isSupportedPlatform(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      hostname.includes('amazon.') ||
      hostname.includes('ebay.') ||
      hostname.includes('idealo.')
    );
  } catch {
    return false;
  }
}
/**
 * Extract shop name from URL
 */
export function getShopName(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Remove www. prefix
    const domain = hostname.replace(/^www\./, '');
    
    // Extract the main domain name
    const parts = domain.split('.');
    
    // Special cases for known shops
    if (domain.includes('amazon.')) {
      return 'Amazon';
    }
    if (domain.includes('ebay.')) {
      return 'eBay';
    }
    if (domain.includes('idealo.')) {
      return 'idealo';
    }
    if (domain.includes('etsy.')) {
      return 'Etsy';
    }
    if (domain.includes('aliexpress.')) {
      return 'AliExpress';
    }
    if (domain.includes('alibaba.')) {
      return 'Alibaba';
    }
    if (domain.includes('wish.')) {
      return 'Wish';
    }
    if (domain.includes('shopify.')) {
      const shop = parts[0];
      return shop.charAt(0).toUpperCase() + shop.slice(1);
    }
    
    // Generic: take first part before TLD
    const shopName = parts[0];
    return shopName.charAt(0).toUpperCase() + shopName.slice(1);
  } catch {
    return 'Product';
  }
}
