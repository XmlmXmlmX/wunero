import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/lib/auth-provider';
import { WuNavbar } from '@/components/organisms/WuNavbar/WuNavbar';
import WuFooter from '@/components/organisms/WuFooter';
import WuCookieBanner from '@/components/organisms/WuCookieBanner';
import { isLegalFeaturesEnabled } from '@/lib/legal-features';
import { redirect, notFound } from 'next/navigation';
import { routing } from '@/i18n';

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Validate that locale is valid
  if (!routing.locales.includes(locale as any)) {
    // Redirect to default locale with the original path
    redirect(`/${routing.defaultLocale}`);
  }
  
  // Directly import messages for the current locale
  let messages: any = {};
  try {
    const module = await import(`../../../messages/${locale}.json`);
    messages = module.default;
  } catch (error) {
    console.error('Failed to load messages for locale:', locale);
    notFound();
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
