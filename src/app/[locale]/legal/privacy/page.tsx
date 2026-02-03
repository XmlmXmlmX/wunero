import { WuPageHeader } from "@/components/organisms/WuPageHeader/WuPageHeader";
import { notFound } from 'next/navigation';
import { isLegalFeaturesEnabled } from '@/lib/legal-features';

export default function PrivacyPage() {
  if (!isLegalFeaturesEnabled()) {
    notFound();
  }

  const sectionStyle = { marginBottom: '2rem' };

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <WuPageHeader
        title="Datenschutzerklärung"
        subtitle="Informationen zur Verarbeitung Ihrer Daten"
      />
      <div style={{ paddingTop: '2rem' }}>
        <section style={sectionStyle}>
          <h2>1. Datenschutz auf einen Blick</h2>
          
          <h3>Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
            passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
            persönlich identifiziert werden können.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>2. Verantwortlicher</h2>
          <p>
            {process.env.NEXT_PUBLIC_IMPRINT_NAME || '[Name nicht konfiguriert]'}<br />
            {process.env.NEXT_PUBLIC_IMPRINT_STREET || '[Straße nicht konfiguriert]'}<br />
            {process.env.NEXT_PUBLIC_IMPRINT_CITY || '[Stadt nicht konfiguriert]'}<br />
            E-Mail: {process.env.NEXT_PUBLIC_IMPRINT_EMAIL || '[E-Mail nicht konfiguriert]'}
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>3. Ihre Rechte</h2>
          <p>Sie haben das Recht auf:</p>
          <ul>
            <li>Auskunft über Ihre personenbezogenen Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2>4. Cookies</h2>
          <p>
            Diese Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert
            werden. Notwendige Cookies sind erforderlich für die Grundfunktionen der Website. Sie können andere
            Cookies akzeptieren oder ablehnen über unser Cookie-Banner.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>5. Amazon Partnerprogramm</h2>
          <p>
            Diese Website nimmt am Amazon EU-Partnerprogramm teil. Wir verwenden Affiliate-Links zu Amazon-Produkten.
            Wenn Sie über unsere Links einkaufen, erhalten wir eine Provision. Dies ist in unserer Datenschutzrichtlinie
            offengelegt und erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
          </p>
        </section>

        <section style={sectionStyle}>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Stand dieser Datenschutzerklärung: {new Date().toLocaleDateString('de-DE')}
          </p>
        </section>
      </div>
    </main>
  );
}