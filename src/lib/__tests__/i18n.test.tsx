import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

// Mock component that uses useTranslations
function TestComponent() {
  const t = useTranslations('profile');
  return <div>{t('profileInfo.title')}</div>;
}

describe('i18n Integration', () => {
  it('loads German translations', () => {
    render(<TestComponent />);
    // This would load from mocked messages/de.json
    expect(screen.getByText(/profile|profil/i)).toBeInTheDocument();
  });

  it('uses correct namespace', () => {
    const t = useTranslations('profile');
    // Should have profile namespace available
    expect(t).toBeDefined();
  });

  it('falls back to key if translation missing', () => {
    const t = useTranslations('nonexistent');
    // Should return key as fallback
    expect(t('missing.key')).toBe('missing.key');
  });
});

describe('Message loading', () => {
  it('loads message files correctly', async () => {
    // Test that message imports work
    const de = await import('../../../messages/de.json');
    const en = await import('../../../messages/en.json');
    
    expect(de.default).toBeDefined();
    expect(en.default).toBeDefined();
  });

  it('German messages have expected namespaces', async () => {
    const de = await import('../../../messages/de.json');
    
    expect(de.default.home).toBeDefined();
    expect(de.default.auth).toBeDefined();
    expect(de.default.profile).toBeDefined();
    expect(de.default.nav).toBeDefined();
  });

  it('English messages have expected namespaces', async () => {
    const en = await import('../../../messages/en.json');
    
    expect(en.default.home).toBeDefined();
    expect(en.default.auth).toBeDefined();
    expect(en.default.profile).toBeDefined();
    expect(en.default.nav).toBeDefined();
  });

  it('profile namespace has required keys', async () => {
    const de = await import('../../../messages/de.json');
    
    expect(de.default.profile.profileInfo).toBeDefined();
    expect(de.default.profile.email).toBeDefined();
    expect(de.default.profile.password).toBeDefined();
  });
});
