import { getGravatarUrl } from '@/lib/gravatar';
import crypto from 'crypto';

describe('gravatar.ts', () => {
  it('generates correct Gravatar URL for email', () => {
    const email = 'test@example.com';
    const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
    const url = getGravatarUrl(email);
    
    expect(url).toContain('https://www.gravatar.com/avatar/');
    expect(url).toContain(hash);
  });

  it('handles email with whitespace', () => {
    const email = '  TEST@EXAMPLE.COM  ';
    const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
    const url = getGravatarUrl(email);
    
    expect(url).toContain(hash);
  });

  it('supports size parameter', () => {
    const email = 'test@example.com';
    const url = getGravatarUrl(email, 200);
    
    expect(url).toContain('s=200');
  });

  it('supports default avatar parameter', () => {
    const email = 'test@example.com';
    const url = getGravatarUrl(email, 100, 'identicon');
    
    expect(url).toContain('d=identicon');
  });

  it('returns HTTPS URL', () => {
    const email = 'test@example.com';
    const url = getGravatarUrl(email);
    
    expect(url).toMatch(/^https:\/\//);
  });
});
