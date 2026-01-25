"use client";

import { useEffect } from "react";

// Helper to convert hex to RGB/OKLCH approximation is complex in pure CSS without lib.
// But we can check if the tailwind setup uses standard colors.
// In globals.css we saw: --primary: oklch(0.66 0.22 38);
// We can just override --primary with the hex value, assuming browsers support it (they do) 
// BUT Shadcn uses OKLCH usually. 
// However, if we simply set: --primary: #hex, it works if we change the tailwind config or if we just use style.
// The trick: globals.css likely relies on tailwind's opacity modifiers which need <alpha-value>.
// If we just set hex, `bg-primary/50` might break if not handled.
// For MVP, passing Hex directly to `--primary` normally works in modern CSS/Tailwind 4 setups unless strictly constrained.

export function ThemeInjector({ config }: { config: any }) {
    useEffect(() => {
        if (!config?.themeColor) return;

        // We set the CSS variable on the document root
        // Note: Shadcn/Tailwind 4 might expect OKLCH. 
        // If we set a Hex, valid CSS.
        document.documentElement.style.setProperty("--primary", config.themeColor);
        document.documentElement.style.setProperty("--secondary", config.secondaryColor || "#fce7f3");
        document.documentElement.style.setProperty("--background", config.backgroundColor || "#ffffff");

        // Typography overrides
        // Typography overrides (Granular)
        if (config.menuColor) document.documentElement.style.setProperty("--color-menu", config.menuColor);
        if (config.menuFont) document.documentElement.style.setProperty("--font-menu", config.menuFont);

        if (config.headingColor) document.documentElement.style.setProperty("--color-heading", config.headingColor);
        if (config.headingFont) document.documentElement.style.setProperty("--font-heading", config.headingFont);

        if (config.bodyColor) {
            document.documentElement.style.setProperty("--color-body", config.bodyColor);
            document.documentElement.style.setProperty("--foreground", config.bodyColor); // Base text color
        }
        if (config.bodyFont) {
            document.documentElement.style.setProperty("--font-body", config.bodyFont);
            document.documentElement.style.setProperty("--font-sans", config.bodyFont); // Base font
        }

        // Header & Footer & Components
        document.documentElement.style.setProperty("--header-bg", config.headerColor || config.backgroundColor || "#ffffff");
        document.documentElement.style.setProperty("--footer-bg", config.footerBg || "#171717");
        document.documentElement.style.setProperty("--footer-text", config.footerText || "#a3a3a3");

        // Search & Cart
        document.documentElement.style.setProperty("--color-search-bg", config.searchBtnBg || config.themeColor || "#db2777");
        document.documentElement.style.setProperty("--color-search-icon", config.searchIconColor || "#ffffff");
        document.documentElement.style.setProperty("--color-cart-bg", config.cartCountBg || "#22c55e");
        document.documentElement.style.setProperty("--color-cart-text", config.cartCountText || "#ffffff");

        // Also set ring to match
        document.documentElement.style.setProperty("--ring", config.themeColor);

    }, [config]);

    return null;
}
