import * as cheerio from 'cheerio';

export interface ProductInfo {
  title?: string;
  image_url?: string;
  price?: string;
}

/**
 * Extract product information from a URL
 */
export async function extractProductInfo(url: string): Promise<ProductInfo> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return {};
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let title: string | undefined;
    let image_url: string | undefined;
    let price: string | undefined;

    // Amazon selectors
    if (url.includes('amazon.')) {
      title = $('#productTitle').text().trim() || 
              $('h1.product-title').text().trim();
      image_url = $('#landingImage').attr('src') || 
                  $('.imgTagWrapper img').attr('src');
      price = $('.a-price .a-offscreen').first().text().trim() || 
              $('#priceblock_ourprice').text().trim();
    }
    // eBay selectors
    else if (url.includes('ebay.')) {
      title = $('.x-item-title__mainTitle').text().trim() || 
              $('#itemTitle').text().trim();
      image_url = $('.ux-image-carousel-item img').first().attr('src') || 
                  $('#icImg').attr('src');
      price = $('.x-price-primary').first().text().trim() || 
              $('#prcIsum').text().trim();
    }
    // Idealo selectors
    else if (url.includes('idealo.')) {
      title = $('h1[data-test="product-title"]').text().trim() || 
              $('.oopStage-mainContent-title').text().trim();
      image_url = $('.oopStage-mainContent-mainImage img').attr('src');
      price = $('.oopStage-mainContent-priceSection-price').text().trim();
    }
    // Generic Open Graph fallback
    else {
      title = $('meta[property="og:title"]').attr('content') || 
              $('title').text().trim();
      image_url = $('meta[property="og:image"]').attr('content') || 
                  $('img').first().attr('src');
      price = $('meta[property="og:price:amount"]').attr('content');
    }

    return {
      title: title || undefined,
      image_url: image_url || undefined,
      price: price || undefined,
    };
  } catch (error) {
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
