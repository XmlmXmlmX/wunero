import React from 'react';
import { render } from '@testing-library/react';
import { WuNavbar } from '../WuNavbar';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'de'
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { name: 'John Doe', email: 'john@example.com' } },
    status: 'authenticated'
  })),
  signOut: jest.fn()
}));

// Mock router
jest.mock('@/i18n', () => ({
  routing: {
    locales: ['de', 'en'],
    defaultLocale: 'de'
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn()
  }),
  usePathname: () => '/de/profile',
  Link: ({ children }: any) => <div>{children}</div>
}));

// Mock gravatar
jest.mock('@/lib/gravatar', () => ({
  getGravatarUrl: jest.fn(() => 'https://gravatar.com/avatar/test')
}));

// Mock icons - return simple divs
jest.mock('@/components/ui/gear-icon', () => ({
  default: () => <div>GearIcon</div>
}));

jest.mock('@/components/ui/unordered-list-icon', () => ({
  default: () => <div>ListIcon</div>
}));

jest.mock('@/components/ui/logout-icon', () => ({
  default: () => <div>LogoutIcon</div>
}));

// Mock atoms
jest.mock('@/components/atoms', () => ({
  WuAvatar: ({ fallbackText }: any) => <div>{fallbackText}</div>,
  WuLanguageSwitcher: () => <div>LanguageSwitcher</div>
}));

describe('WuNavbar', () => {
  it('renders successfully', () => {
    const { container } = render(<WuNavbar />);
    expect(container).toBeTruthy();
  });

  it('renders as navigation', () => {
    const { container } = render(<WuNavbar />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
