import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/lib/auth-provider';
import { WuNavbar } from '@/components/organisms/WuNavbar/WuNavbar';
import WuFooter from '@/components/organisms/WuFooter';
import WuCookieBanner from '@/components/organisms/WuCookieBanner';
import { isLegalFeaturesEnabled } from '@/lib/legal-features';

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Directly import messages for the current locale
  let messages: any = {};
  try {
    const module = await import(`../../../messages/${locale}.json`);
    messages = module.default;
  } catch (error) {
    console.error('Failed to load messages for locale:', locale);
  }
  
  const legalFeaturesEnabled = isLegalFeaturesEnabled();

  return (
    <NextIntlClientProvider messages={messages} locale={locale} key={locale}>
      <AuthProvider>
        <WuNavbar />
        {children}
        {legalFeaturesEnabled && <WuFooter />}
        {legalFeaturesEnabled && <WuCookieBanner />}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
