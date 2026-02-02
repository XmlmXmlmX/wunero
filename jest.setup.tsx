import '@testing-library/jest-dom';

// Mock Web API Request/Response for Next.js API routes
if (typeof global.Request === 'undefined') {
  global.Request = class {
    constructor(
      public url: any,
      public init?: any,
    ) {}
  } as any;
}

if (typeof global.Response === 'undefined') {
  global.Response = class {
    constructor(
      public body?: any,
      public init?: any,
    ) {}
    
    async json() {
      return JSON.parse(this.body || '{}');
    }
    
    async text() {
      return this.body || '';
    }
  } as any;
}

// Mock src/i18n.ts to avoid next-intl routing issues
jest.mock('@/i18n', () => ({
  routing: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
  },
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  redirect: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
  getPathname: jest.fn((path: string) => path),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'de',
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signOut: jest.fn(),
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: useLayoutEffect does nothing on the server')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
