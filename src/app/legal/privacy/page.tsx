import { WuPageHeader } from "@/components/organisms/WuPageHeader/WuPageHeader";
import styles from "../legal.module.css";

export default function PrivacyPage() {
  return (
    <main>
      <WuPageHeader
        title="Datenschutzerklärung"
        subtitle="Informationen zur Verarbeitung Ihrer Daten"
        className={styles.pageHeader}
      />
      <div className={styles.container}>
        <section className={styles.section}>
          <h2>1. Datenschutz auf einen Blick</h2>
          
          <h3>Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
            passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
            persönlich identifiziert werden können.
          </p>

          <h3>Datenerfassung auf dieser Website</h3>
          <h4>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
          <p>
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
            können Sie dem Impressum dieser Website entnehmen.
          </p>

          <h4>Wie erfassen wir Ihre Daten?</h4>
          <p>
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um
            Daten handeln, die Sie in ein Kontaktformular eingeben oder bei der Registrierung angeben.
          </p>
          <p>
            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
            IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder
            Uhrzeit des Seitenaufrufs).
          </p>

          <h4>Wofür nutzen wir Ihre Daten?</h4>
          <p>
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.
            Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
          </p>

          <h4>Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
          <p>
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
            gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder
            Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben,
            können Sie diese Einwilligung jederzeit für die Zukunft widerrufen.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Hosting</h2>
          <p>
            Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
          </p>
          
          <h3>Vercel</h3>
          <p>
            Anbieter ist die Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA (nachfolgend &quot;Vercel&quot;).
          </p>
          <p>
            Details entnehmen Sie der Datenschutzerklärung von Vercel:{" "}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              https://vercel.com/legal/privacy-policy
            </a>
          </p>
          <p>
            Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein
            berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
          
          <h3>Datenschutz</h3>
          <p>
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
            personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie
            dieser Datenschutzerklärung.
          </p>

          <h3>Hinweis zur verantwortlichen Stelle</h3>
          <p>
            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          </p>
          <p>
            {process.env.NEXT_PUBLIC_IMPRINT_NAME || '[Name nicht konfiguriert]'}<br />
            {process.env.NEXT_PUBLIC_IMPRINT_STREET || '[Straße nicht konfiguriert]'}<br />
            {process.env.NEXT_PUBLIC_IMPRINT_CITY || '[Stadt nicht konfiguriert]'}<br />
            E-Mail: {process.env.NEXT_PUBLIC_IMPRINT_EMAIL || '[E-Mail nicht konfiguriert]'}
          </p>
          <p>
            Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen
            über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.)
            entscheidet.
          </p>

          <h3>Speicherdauer</h3>
          <p>
            Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben
            Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein
            berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen,
            werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung
            Ihrer personenbezogenen Daten haben.
          </p>

          <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
          <p>
            Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine
            bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten
            Datenverarbeitung bleibt vom Widerruf unberührt.
          </p>

          <h3>Recht auf Datenübertragbarkeit</h3>
          <p>
            Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags
            automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format
            aushändigen zu lassen.
          </p>

          <h3>Auskunft, Löschung und Berichtigung</h3>
          <p>
            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche
            Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck
            der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Datenerfassung auf dieser Website</h2>
          
          <h3>Registrierung auf dieser Website</h3>
          <p>
            Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen zu nutzen. Die dazu
            eingegebenen Daten (E-Mail-Adresse, Passwort, optionaler Name) verwenden wir nur zum Zwecke der Nutzung
            des jeweiligen Angebotes oder Dienstes, für den Sie sich registriert haben.
          </p>
          <p>
            Die bei der Registrierung abgefragten Pflichtangaben müssen vollständig angegeben werden. Anderenfalls
            werden wir die Registrierung ablehnen.
          </p>
          <p>
            Die Verarbeitung der bei der Registrierung eingegebenen Daten erfolgt auf Grundlage Ihrer Einwilligung
            (Art. 6 Abs. 1 lit. a DSGVO). Sie können eine von Ihnen erteilte Einwilligung jederzeit widerrufen.
            Dazu reicht eine formlose Mitteilung per E-Mail an uns.
          </p>
          <p>
            Die bei der Registrierung erfassten Daten werden von uns gespeichert, solange Sie auf dieser Website
            registriert sind und werden anschließend gelöscht. Gesetzliche Aufbewahrungsfristen bleiben unberührt.
          </p>

          <h3>Datenübermittlung bei Vertragsschluss</h3>
          <p>
            Wir übermitteln personenbezogene Daten an Dritte nur dann, wenn dies im Rahmen der Vertragsabwicklung
            notwendig ist, etwa an das mit der Zahlungsabwicklung beauftragte Kreditinstitut.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Amazon Partnerprogramm (Affiliate-Links)</h2>
          <p>
            Diese Website nimmt am Amazon EU-Partnerprogramm teil. Wir verwenden auf dieser Website
            sogenannte Affiliate-Links. Das sind Links zu Produkten auf Amazon.de. Wenn Sie auf einen solchen
            Link klicken und anschließend bei Amazon einkaufen, erhalten wir eine Provision. Für Sie entstehen
            dadurch keine zusätzlichen Kosten.
          </p>
          <p>
            Die Verwendung der Amazon-Partnerlinks dient der Finanzierung dieser Website und erfolgt auf
            Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an
            der Finanzierung seines Angebots.
          </p>
          <p>
            <strong>Werbekennzeichnung:</strong> Als Amazon-Partner verdienen wir an qualifizierten Verkäufen.
          </p>
          <p>
            Weitere Informationen finden Sie in den Datenschutzbestimmungen von Amazon:{" "}
            <a href="https://www.amazon.de/gp/help/customer/display.html?nodeId=201909010" target="_blank" rel="noopener noreferrer">
              https://www.amazon.de/gp/help/customer/display.html?nodeId=201909010
            </a>
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Externe Inhalte und Links</h2>
          <p>
            Diese Website enthält Links zu externen Websites Dritter (z.B. zu Produktseiten bei Amazon, eBay und
            anderen Online-Shops). Beim Aufruf dieser externen Inhalte kann die IP-Adresse an den jeweiligen
            Anbieter übermittelt werden. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
            Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
          </p>
          <p>
            Eine dauerhafte Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung
            nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Ihre Rechte</h2>
          <p>Sie haben folgende Rechte:</p>
          <ul>
            <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
            <li>Recht auf Löschung (Art. 17 DSGVO)</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            <li>Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <p className={styles.updated}>
            Stand dieser Datenschutzerklärung: {new Date().toLocaleDateString('de-DE')}
          </p>
        </section>
      </div>
    </main>
  );
}
