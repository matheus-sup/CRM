"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { getStoreConfig } from "@/lib/actions/settings";

declare global {
    interface Window {
        fbq: any;
        gtag: any;
    }
}

export function AnalyticsScripts() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        // Fetch config client-side to be safe with hydration, or pass as prop if server component parent
        getStoreConfig().then(setConfig);
    }, []);

    useEffect(() => {
        if (pathname && window.fbq) {
            window.fbq("track", "PageView");
        }
        if (pathname && window.gtag && config?.googleTagId) {
            window.gtag("config", config.googleTagId, {
                page_path: pathname,
            });
        }
    }, [pathname, searchParams, config]);

    if (!config) return null;

    return (
        <>
            {/* Facebook Pixel */}
            {config.facebookPixelId && (
                <>
                    <Script
                        id="fb-pixel"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                 !function(f,b,e,v,n,t,s)
                 {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                 n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                 if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                 n.queue=[];t=b.createElement(e);t.async=!0;
                 t.src=v;s=b.getElementsByTagName(e)[0];
                 s.parentNode.insertBefore(t,s)}(window, document,'script',
                 'https://connect.facebook.net/en_US/fbevents.js');
                 fbq('init', '${config.facebookPixelId}');
                 fbq('track', 'PageView');
               `,
                        }}
                    />
                    <noscript>
                        <img
                            height="1"
                            width="1"
                            style={{ display: 'none' }}
                            src={`https://www.facebook.com/tr?id=${config.facebookPixelId}&ev=PageView&noscript=1`}
                            alt=""
                        />
                    </noscript>
                </>
            )}

            {/* Google Analytics / Tag Manager */}
            {config.googleTagId && (
                <>
                    <Script
                        strategy="afterInteractive"
                        src={`https://www.googletagmanager.com/gtag/js?id=${config.googleTagId}`}
                    />
                    <Script
                        id="google-analytics"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.googleTagId}');
              `,
                        }}
                    />
                </>
            )}
        </>
    );
}
