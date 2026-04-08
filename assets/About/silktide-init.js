silktideCookieBannerManager.updateCookieBannerConfig({
    background: {
        showBackground: true
    },
    cookieIcon: {
        position: "bottomRight"
    },
    cookieTypes: [
        {
            id: "necessary",
            name: "Necessary",
            description: "<p>...</p>",
            required: true,
            onAccept: function() {
                console.log('Necessari accettati');
            }
        },
        {
            id: "analytical",
            name: "Analytical",
            description: "<p>...</p>",
            required: false, // consentibile
            onAccept: function() {
                console.log('Analitici accettati');
                
                // Evita doppia inizializzazione di Google Analytics
                if (window.gaInitialized) return;
                window.gaInitialized = true;
                
                // Google Analytics 4
                const gaScript = document.createElement('script');
                gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-T1CNL89KW0";
                gaScript.async = true;
                document.head.appendChild(gaScript);
                
                // Inizializza dataLayer e gtag se non esistono già
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                // Configura Google Analytics
                gtag('config', 'G-T1CNL89KW0');
                
                // Configura Google Ads
                gtag('config', 'AW-17213179288');
            }
        },
        {
            id: "advertising",
            name: "Advertising",
            description: "<p>...</p>",
            required: false, // consentibile
            onAccept: function() {
                console.log('Advertising accettati');
                
                // Evita doppia inizializzazione di Meta Pixel
                if (window.fbqInitialized) return;
                window.fbqInitialized = true;
                
                // Meta Pixel (Facebook Pixel)
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '1182818315227614');
                fbq('track', 'PageView');
            }
        }
    ],
    text: {
        banner: {
          description: "<p>We use cookies on our site to enhance your user experience, provide personalized content, and analyze our traffic. <a href=\"privacy-e-termini.html\" target=\"_blank\" rel=\"noopener noreferrer\">Cookie Policy.</a></p>",
            acceptAllButtonText: "Accetta",
            acceptAllButtonAccessibleLabel: "Accetta",
            rejectNonEssentialButtonText: "Rifiuta",
            rejectNonEssentialButtonAccessibleLabel: "Rifiuta",
            preferencesButtonText: "Preferenze",
            preferencesButtonAccessibleLabel: "Preferenze"
        },
        preferences: {
            title: "Personalizza le tue preferenze dei cookie",
          description: "<p>Rispettiamo il tuo diritto alla privacy. Puoi scegliere di non consentire alcuni tipi di cookie. Le tue preferenze sui cookie saranno applicate a tutto il nostro sito web.</p><a href=\"privacy-e-termini.html\" target=\"_blank\" rel=\"noopener noreferrer\">Cookie Policy.</a>",
            creditLinkText: "Ottieni questo banner gratis",
            creditLinkAccessibleLabel: "Ottieni questo banner gratis"
        }
    },
    position: {
        banner: "bottomCenter"
    }
});
