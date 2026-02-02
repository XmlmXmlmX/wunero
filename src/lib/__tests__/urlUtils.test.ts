import { sanitizeUrl, isValidImageUrl } from '@/lib/urlUtils';

describe('urlUtils', () => {
  describe('sanitizeUrl', () => {
    it('accepts valid HTTP URLs', () => {
      const url = 'http://example.com';
      expect(sanitizeUrl(url)).toBe('http://example.com/');
    });

    it('accepts valid HTTPS URLs', () => {
      const url = 'https://example.com';
      expect(sanitizeUrl(url)).toBe('https://example.com/');
    });

    it('rejects invalid URLs', () => {
      const url = 'not-a-url';
      expect(sanitizeUrl(url)).toBeUndefined();
    });

    it('rejects URLs with javascript protocol', () => {
      const url = 'javascript:alert("xss")';
      expect(sanitizeUrl(url)).toBeUndefined();
    });

    it('rejects data URLs', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      expect(sanitizeUrl(url)).toBeUndefined();
    });
  });

  describe('isValidImageUrl', () => {
    it('accepts valid HTTPS image URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(isValidImageUrl(url)).toBe(true);
    });

    it('accepts valid HTTP image URLs', () => {
      const url = 'http://cdn.example.com/image.jpg';
      expect(isValidImageUrl(url)).toBe(true);
    });

    it('rejects invalid URLs', () => {
      const url = 'not-a-url';
      expect(isValidImageUrl(url)).toBe(false);
    });

    it('rejects localhost URLs', () => {
      const url = 'http://localhost:3000/image.jpg';
      expect(isValidImageUrl(url)).toBe(false);
    });

    it('rejects private IP URLs', () => {
      const url = 'http://192.168.1.1/image.jpg';
      expect(isValidImageUrl(url)).toBe(false);
    });
  });
});
