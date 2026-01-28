import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { requireAuth, unauthorizedResponse } from '@/lib/api-auth';
import type { Currency } from '@/types';

export interface AmazonWishlistItem {
  title: string;
  url?: string;
  image_url?: string;
  price?: string;
  currency?: Currency;
  priority?: number;
  importance?: 'must-have' | 'would-love' | 'nice-to-have' | 'not-sure';
  quantity?: number;
  purchased_quantity?: number;
  description?: string;
}

/**
 * Extract price and currency from Amazon price string
 */
function extractPriceAndCurrency(priceText: string): { price?: string; currency?: Currency } {
  if (!priceText) return {};
  
  const normalized = priceText.trim().replace(/\s+/g, ' ');
  
  let currency: Currency | undefined;
  if (normalized.includes('€') || normalized.includes('EUR')) {
    currency = 'EUR';
  } else if (normalized.includes('£') || normalized.includes('GBP')) {
    currency = 'GBP';
  } else if (normalized.includes('$') || normalized.includes('USD')) {
    currency = 'USD';
  }
  
  // Extract only numeric price with decimal separator
  // Match patterns like: 29.99, 29,99, 1.234,99, 1,234.99
  const priceMatch = normalized.match(/[\d.,]+/);
  const price = priceMatch ? priceMatch[0].trim() : undefined;
  
  return {
    price: price || undefined,
    currency,
  };
}

/**
 * Validate Amazon wishlist URL
 */
function validateAmazonWishlistUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if it's an Amazon domain
    if (!hostname.includes('amazon.')) {
      return false;
    }
    
    // Check if it's a wishlist URL
    const pathname = urlObj.pathname.toLowerCase();
    return pathname.includes('/wishlist/') || pathname.includes('/hz/wishlist/');
  } catch {
    return false;
  }
}

/**
 * Parse Amazon wishlist and extract items
 */
async function parseAmazonWishlist(url: string): Promise<AmazonWishlistItem[]> {
  try {
    console.log(`Fetching Amazon wishlist: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wishlist: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const items: AmazonWishlistItem[] = [];

    // Amazon wishlist items can have different selectors depending on the layout
    // Try multiple selectors to maximize compatibility
    const itemSelectors = [
      '[data-id]',
      '.g-item-sortable',
      '#g-items li[data-itemid]',
      '.a-spacing-none.g-item-sortable'
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let itemElements: cheerio.Cheerio<any> | null = null;
    
    for (const selector of itemSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        itemElements = elements;
        console.log(`Found ${elements.length} items using selector: ${selector}`);
        break;
      }
    }

    if (!itemElements || itemElements.length === 0) {
      console.warn('No items found with any selector');
      return items;
    }

    itemElements.each((_, element) => {
      const $item = $(element);
      
      // Extract title
      const title = $item.find('h3 a, h5 a, [id*="itemName"] a').first().text().trim() ||
                    $item.find('a[title]').first().attr('title')?.trim() ||
                    '';

      if (!title) {
        return; // Skip items without title
      }

      // Extract description/comment
      let description: string | undefined;
      const descriptionSelectors = [
        '[id*="itemComment"]',
        '[id*="itemNote"]',
        '.a-spacing-small.a-size-base',
        'span[class*="comment"]',
        'div[class*="comment"]',
        '[data-itemcomment]'
      ];
      
      for (const selector of descriptionSelectors) {
        const descElement = $item.find(selector).first();
        if (descElement.length > 0) {
          const descText = descElement.text().trim();
          // Filter out price and other non-comment text
          if (descText && 
              !descText.match(/^[\d.,€£$]+$/) && 
              descText.length > 3 &&
              !descText.toLowerCase().includes('add to cart')) {
            description = descText;
            break;
          }
        }
      }
      
      // Also check data attribute
      if (!description) {
        const dataComment = $item.attr('data-itemcomment') || $item.find('[data-itemcomment]').first().attr('data-itemcomment');
        if (dataComment && dataComment.trim()) {
          description = dataComment.trim();
        }
      }

      // Extract product URL
      const linkElement = $item.find('h3 a, h5 a, [id*="itemName"] a, a[href*="/dp/"]').first();
      let productUrl = linkElement.attr('href');
      
      if (productUrl && !productUrl.startsWith('http')) {
        const urlObj = new URL(url);
        productUrl = `${urlObj.protocol}//${urlObj.hostname}${productUrl}`;
      }

      // Extract image URL - Amazon uses multiple attributes for images
      let imageUrl = $item.find('img').first().attr('src') ||
                     $item.find('img').first().attr('data-src') ||
                     $item.find('img').first().attr('data-a-dynamic-image') ||
                     $item.find('img').first().data('old-hires') as string | undefined;
      
      // Parse dynamic image JSON if present
      if (!imageUrl) {
        const dynamicImage = $item.find('img').first().attr('data-a-dynamic-image');
        if (dynamicImage) {
          try {
            const imageData = JSON.parse(dynamicImage);
            const imageUrls = Object.keys(imageData);
            if (imageUrls.length > 0) {
              imageUrl = imageUrls[0]; // Get first (usually highest quality)
            }
          } catch {
            console.warn('Failed to parse dynamic image data');
          }
        }
      }
      
      // Amazon often uses low-res images, try to get higher resolution
      if (imageUrl) {
        // Remove low-res indicators and replace with higher res
        imageUrl = imageUrl.replace(/_SL\d+_/, '_SL500_');
        imageUrl = imageUrl.replace(/_AC_UL\d+_/, '_AC_UL500_');
        imageUrl = imageUrl.replace(/_SR\d+,\d+_/, '_SR500,500_');
        
        // Ensure HTTPS
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          imageUrl = `${urlObj.protocol}//${urlObj.hostname}${imageUrl}`;
        }
      }

      // Extract price - try multiple selectors
      const priceSelectors = [
        '.a-price .a-offscreen',
        '[id*="itemPrice"]',
        '.a-price-whole',
        'span.a-color-price'
      ];
      
      let priceText = '';
      for (const selector of priceSelectors) {
        const element = $item.find(selector).first();
        if (element.length > 0) {
          priceText = element.text().trim();
          if (priceText) break;
        }
      }
      
      const { price, currency } = extractPriceAndCurrency(priceText);

      // Extract priority from Amazon (1-5 scale, where 1 is highest)
      // Amazon uses data-priority or priority attributes
      let priority = 0;
      let importance: 'must-have' | 'would-love' | 'nice-to-have' | 'not-sure' = 'nice-to-have';
      
      const priorityAttr = $item.attr('data-priority') || $item.find('[data-priority]').first().attr('data-priority');
      if (priorityAttr) {
        const amazonPriority = parseInt(priorityAttr, 10);
        // Convert Amazon priority (1=highest, 5=lowest) to wunero priority and importance
        if (!isNaN(amazonPriority)) {
          // Invert Amazon priority for wunero (higher number = higher priority)
          priority = 5 - amazonPriority;
          
          // Map to importance levels
          if (amazonPriority === 1) {
            importance = 'must-have';
          } else if (amazonPriority === 2) {
            importance = 'would-love';
          } else if (amazonPriority === 3 || amazonPriority === 4) {
            importance = 'nice-to-have';
          } else {
            importance = 'not-sure';
          }
        }
      }
      
      // Check for Amazon's "wanted" or "desired" markers
      const wantedText = $item.find('[data-reposition-action-params]').text().toLowerCase();
      if (wantedText.includes('highest') || wantedText.includes('most wanted')) {
        priority = 4;
        importance = 'must-have';
      } else if (wantedText.includes('high') || wantedText.includes('really want')) {
        priority = 3;
        importance = 'would-love';
      }

      // Extract quantity (requested/wanted amount)
      let quantity = 1;
      let purchased_quantity = 0;
      
      // Look for quantity information in various formats
      const quantitySelectors = [
        '[id*="itemRequested"]',
        '.quantity-requested',
        'span[class*="quantity"]',
        '[data-quantity]'
      ];
      
      for (const selector of quantitySelectors) {
        const qtyElement = $item.find(selector).first();
        if (qtyElement.length > 0) {
          const qtyText = qtyElement.text().trim();
          // Look for patterns like "Requested: 3", "Wanted: 2", "Qty: 5"
          const qtyMatch = qtyText.match(/(?:requested|wanted|qty|quantity)[:\s]*([\d]+)/i);
          if (qtyMatch) {
            const parsedQty = parseInt(qtyMatch[1], 10);
            if (!isNaN(parsedQty) && parsedQty > 0) {
              quantity = parsedQty;
              break;
            }
          }
          // Also check data attribute
          const dataQty = qtyElement.attr('data-quantity');
          if (dataQty) {
            const parsedQty = parseInt(dataQty, 10);
            if (!isNaN(parsedQty) && parsedQty > 0) {
              quantity = parsedQty;
              break;
            }
          }
        }
      }
      
      // Extract purchased/has quantity
      const purchasedSelectors = [
        '[id*="itemPurchased"]',
        '.quantity-purchased',
        '[id*="itemHas"]',
        'span[class*="has"]'
      ];
      
      for (const selector of purchasedSelectors) {
        const purchasedElement = $item.find(selector).first();
        if (purchasedElement.length > 0) {
          const purchasedText = purchasedElement.text().trim();
          // Look for patterns like "Has: 1", "Purchased: 2", "Owned: 3"
          const purchasedMatch = purchasedText.match(/(?:has|purchased|owned|received)[:\s]*([\d]+)/i);
          if (purchasedMatch) {
            const parsedPurchased = parseInt(purchasedMatch[1], 10);
            if (!isNaN(parsedPurchased) && parsedPurchased >= 0) {
              purchased_quantity = parsedPurchased;
              break;
            }
          }
        }
      }

      items.push({
        title,
        url: productUrl,
        image_url: imageUrl,
        price,
        currency,
        priority,
        importance,
        quantity,
        purchased_quantity,
        description,
      });
    });

    console.log(`Extracted ${items.length} items from Amazon wishlist`);
    return items;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('Request timed out - Amazon may be blocking automated requests');
    }
    console.error('Error parsing Amazon wishlist:', error);
    throw error;
  }
}

// POST /api/wishlists/import-amazon - Import items from Amazon wishlist
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!validateAmazonWishlistUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid Amazon wishlist URL. Please provide a valid public Amazon wishlist link.' },
        { status: 400 }
      );
    }

    const items = await parseAmazonWishlist(url);

    if (items.length === 0) {
      return NextResponse.json(
        { 
          error: 'No items found in the wishlist. Make sure the wishlist is public and contains items.',
          items: []
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error importing Amazon wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to import Amazon wishlist';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
