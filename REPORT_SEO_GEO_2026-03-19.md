# Report SEO/GEO - veeswal.it
Data: 19 marzo 2026
Ambito: ottimizzazione on-page, tecnica e segnali GEO per homepage e pagina privacy.

## 1) Interventi SEO/GEO implementati

### Head SEO/GEO homepage
- Title ottimizzato con keyword e geo intent (Brescia).
- Meta description riscritta con focus su servizi e aree operative.
- Meta robots e googlebot aggiunti.
- Canonical aggiunto su URL assoluto homepage.
- hreflang it-IT e x-default aggiunti.
- Meta geo aggiunti (geo.region, geo.placename, geo.position, ICBM).
- Open Graph completato (title, description, url, type, locale, site_name, image, image alt).
- Twitter Card aggiunta (summary_large_image + title/description/image).
- Preconnect aggiunti per CDN esterni usati dalla pagina.

### Structured data (JSON-LD)
- Struttura a grafo con:
  - Person (Giorgio Pulli / Veeswal)
  - WebSite
  - ItemList con CreativeWork principali (Veeswal, Olivetti Red, Still Lie, Brutalist Pasta, Posters)
- Estesi segnali GEO nella Person (address, areaServed).
- Email diretta inclusa nello schema Person.

### Semantica contenuti
- H1 semantico aggiunto (visivamente nascosto, SEO/accessibilità).
- H2/H3 semantici aggiunti per sezioni principali (About, Veeswal, Olivetti Red, Still Lie, Spaghetti, Posters, Contact Me).
- ID di sezione coerenti con URL fragment usati nello schema.
- Testo About rafforzato con GEO (Brescia/Milano) e CTA contatto.
- Tutti i contenuti di contatto concentrati nella sezione Contact Me (email, social, area operativa, policy, copyright).
- Nessun footer presente, come da richiesta di struttura one-page.

### Immagini e accessibilità
- Alt text generici sostituiti con descrizioni specifiche orientate a progetto/contesto.
- Correzione refusi in alt text (es. Kahlo, Morandi, proprietà).
- width/height espliciti aggiunti alle immagini per stabilità layout (CLS).
- Richiesta rispettata: nessun lazy loading aggiunto.

### Link e sicurezza
- rel="noopener noreferrer" aggiunto ai link target="_blank" (contatti e link policy in cookie banner).

### Indicizzazione tecnica
- robots.txt corretto: rimossi blocchi a assets, CSS e JS che penalizzavano la scansione.
- sitemap.xml aggiornata:
  - homepage con slash finale
  - lastmod aggiornato al 2026-03-19

### Pagina privacy
- Title SEO ottimizzato.
- Meta description aggiunta.
- Robots, canonical e hreflang aggiunti.
- Creato style2.css (mancante) per evitare 404 e migliorare UX della pagina policy.

## 2) Placeholder inseriti (da completare)
Nella sezione Contact Me della homepage sono stati inseriti placeholder testuali, perché gli URL non erano presenti nel materiale certo:
- LinkedIn: Lorem ipsum - inserire URL profilo LinkedIn
- Behance: Lorem ipsum - inserire URL profilo Behance

## 3) Attività SEO/GEO esterne al codice (non automatizzabili qui)
- Configurare/ottimizzare Google Business Profile (categoria, città, portfolio lavori, recensioni).
- Allineare NAP su piattaforme esterne (Instagram, LinkedIn, Behance, GBP, Bento).
- Attivare Google Search Console e inviare sitemap.
- Testare PageSpeed Insights e Core Web Vitals su dominio live.
- Validare JSON-LD su validator.schema.org.
- Verificare anteprime Open Graph su debugger social.

## 4) Note finali
- Sono state applicate tutte le ottimizzazioni tecniche e on-page possibili nel repository, escluso il lazy loading su tua richiesta.
- Le uniche informazioni lasciate in placeholder sono quelle non verificabili (URL LinkedIn e Behance).
