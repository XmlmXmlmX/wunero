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

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    svg: 'svg',
    path: 'path',
    circle: 'circle',
    g: 'g'
  },
  useAnimate: () => [null, jest.fn()],
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock icons - return simple divs
jest.mock('@/components/ui/gear-icon', () => ({
  __esModule: true,
  default: () => <div>GearIcon</div>
}));

jest.mock('@/components/ui/unordered-list-icon', () => ({
  __esModule: true,
  default: () => <div>ListIcon</div>
}));

jest.mock('@/components/ui/logout-icon', () => ({
  __esModule: true,
  default: () => <div>LogoutIcon</div>
}));

// Mock atoms
jest.mock('@/components/atoms', () => ({
  WuAvatar: ({ fallbackText }: any) => <div>{fallbackText}</div>,
  WuLanguageSwitcher: () => <div>LanguageSwitcher</div>,
  WuDropdown: ({ trigger, children }: any) => (
    <div>
      <div>{trigger}</div>
      <div>{children}</div>
    </div>
  )
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
