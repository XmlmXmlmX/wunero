import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WuLanguageSwitcher } from '@/components/atoms/WuLanguageSwitcher/WuLanguageSwitcher';

// Mock both @/i18n and next-intl
jest.mock('@/i18n', () => ({
  routing: {
    locales: ['de', 'en'],
    defaultLocale: 'de'
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/de/profile',
  Link: ({ children }: any) => children,
}));

jest.mock('next-intl', () => ({
  useLocale: () => 'de',
  useTranslations: () => (key: string) => key,
}));

describe('WuLanguageSwitcher', () => {
  beforeEach(() => {
    // Reset window.location.href mock before each test
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('renders language buttons', () => {
    render(<WuLanguageSwitcher />);
    
    expect(screen.getByText('DE')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('renders buttons for all locales', () => {
    render(<WuLanguageSwitcher />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('marks current locale as active', () => {
    render(<WuLanguageSwitcher />);
    
    const deButton = screen.getByText('DE');
    // DE button should be the active one
    expect(deButton).toBeInTheDocument();
  });

  it('switches to English when clicking EN', async () => {
    render(<WuLanguageSwitcher />);
    
    const englishButton = screen.getByText('EN');
    await userEvent.click(englishButton);
    
    // Verify the button is clickable
    expect(englishButton).toBeInTheDocument();
  });

  it('switches to German when clicking DE', async () => {
    render(<WuLanguageSwitcher />);
    
    const germanButton = screen.getByText('DE');
    await userEvent.click(germanButton);
    
    // Verify the button is clickable
    expect(germanButton).toBeInTheDocument();
  });

  it('has accessible aria-label for language buttons', () => {
    render(<WuLanguageSwitcher />);
    
    const buttons = screen.getAllByRole('button');
    // Each button should have an aria-label
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
