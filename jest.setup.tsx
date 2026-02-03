import '@testing-library/jest-dom';

type RequestInitType = {
  method?: string;
  headers?: Record<string, string>;
  body?: string | null;
};

type ResponseInitType = {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
};

type LinkPropsType = React.ComponentProps<'a'> & { children?: React.ReactNode };

// Mock Web API Request/Response for Next.js API routes
if (typeof global.Request === 'undefined') {
  global.Request = class {
    constructor(
      public url: string,
      public init?: RequestInitType,
    ) {}
  } as unknown as typeof Request;
}

if (typeof global.Response === 'undefined') {
  global.Response = class {
    constructor(
      public body?: string | null,
      public init?: ResponseInitType,
    ) {}
    
    async json() {
      return JSON.parse((this.body) || '{}');
    }
    
    async text() {
      return (this.body) || '';
    }
  } as unknown as typeof Response;
}

// Mock src/i18n.ts to avoid next-intl routing issues
jest.mock('@/i18n', () => ({
  routing: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
  },
  Link: ({ children, ...props }: LinkPropsType) => <a {...props}>{children}</a>,
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
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0] as string).includes('Warning: useLayoutEffect does nothing on the server')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
