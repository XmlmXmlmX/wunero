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

  it('renders trigger button', () => {
    render(<WuLanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /select language/i });
    expect(button).toBeInTheDocument();
  });

  it('displays current language', () => {
    render(<WuLanguageSwitcher />);
    
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });

  it('opens dropdown when trigger is clicked', async () => {
    render(<WuLanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /select language/i });
    await userEvent.click(button);
    
    // Menu should be visible with language options
    const menu = screen.getByRole('listbox');
    expect(menu).toBeInTheDocument();
  });

  it('displays all available languages in dropdown', async () => {
    render(<WuLanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /select language/i });
    await userEvent.click(button);
    
    // Check for language options in the menu
    const deutschOptions = screen.getAllByText('Deutsch');
    const englishOptions = screen.getAllByText('English');
    expect(deutschOptions.length).toBeGreaterThan(0);
    expect(englishOptions.length).toBeGreaterThan(0);
  });

  it('closes dropdown after selecting a language', async () => {
    render(<WuLanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /select language/i });
    await userEvent.click(button);
    
    // Find the English option in the menu
    const englishOptions = screen.getAllByText('English');
    const englishMenuOption = englishOptions[englishOptions.length - 1]; // Get the last one (from the menu)
    await userEvent.click(englishMenuOption);
    
    // After clicking, dropdown should close (menu disappears)
    const menu = screen.queryByRole('listbox');
    expect(menu).not.toBeInTheDocument();
  });

  it('marks current language as active', async () => {
    render(<WuLanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /select language/i });
    await userEvent.click(button);
    
    const deutschOption = screen.getAllByRole('option')[0];
    expect(deutschOption).toHaveAttribute('aria-selected', 'true');
  });

  it('closes dropdown when clicking outside', async () => {
    const { container } = render(<WuLanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: /select language/i });
    await userEvent.click(button);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    // Click outside the dropdown
    await userEvent.click(container);
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
