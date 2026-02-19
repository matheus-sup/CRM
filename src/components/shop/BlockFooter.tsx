"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard, Send, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FooterBlock {
    id: string;
    type: string;
    order: number;
    title?: string;
    content?: string;
    menuHandle?: string;
    phone?: string;
    email?: string;
    address?: string;
    newsletterText?: string;
    linkItems?: { id: string; label: string; url: string; }[];
}

interface BottomBlock {
    id: string;
    content: string;
    order?: number;
}

interface BlockFooterProps {
    config: any;
    menus?: any[];
}

/**
 * BlockFooter - Renders the footer using the footerBlocks configuration.
 * This is used for both the live preview and the actual site.
 */
export function BlockFooter({ config, menus = [] }: BlockFooterProps) {
    const storeName = config?.storeName || "Minha Loja";

    // Parse footerBlocks from config
    let blocks: FooterBlock[] = [];
    let bottomBlocks: BottomBlock[] = [];
    let bottomAlignment: "left" | "center" | "right" = "center";

    try {
        if (config?.footerBlocks) {
            const parsed = JSON.parse(config.footerBlocks);
            if (Array.isArray(parsed)) {
                blocks = parsed;
            } else {
                blocks = parsed.blocks || [];
                bottomBlocks = parsed.bottomBlocks || [];
                bottomAlignment = parsed.bottomAlignment || "center";
            }
        }
    } catch (e) {
        console.error("Error parsing footerBlocks:", e);
    }

    // Sort blocks by order
    const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Helper to get menu by handle
    const getMenu = (handle?: string) => {
        if (!handle) return null;
        return menus.find(m => m.handle === handle);
    };

    // Render block content based on type
    const renderBlockContent = (block: FooterBlock) => {
        const description = block.content || config?.description || "Sua loja online com os melhores produtos.";
        const address = block.address || config?.address || "";
        const phone = block.phone || config?.phone || "";
        const email = block.email || config?.email || "";
        const paymentText = block.content || config?.paymentText || "Aceitamos todos os cartões, PIX e Boleto.";
        const instagram = config?.instagram;
        const facebook = config?.facebook;

        switch (block.type) {
            case "about":
                const youtube = config?.youtube;
                const tiktok = config?.tiktok;
                const twitter = config?.twitter;
                const hasSocial = instagram || facebook || youtube || tiktok || twitter;
                return (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider" style={{ color: config?.footerText || "#ffffff" }}>
                            {block.title || storeName}
                        </h4>
                        <p className="text-sm leading-relaxed opacity-80" style={{ color: config?.footerText || "#a3a3a3" }}>
                            {description}
                        </p>
                        {hasSocial && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {instagram && (
                                    <Link href={instagram} target="_blank">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10" style={{ color: config?.footerText || "#a3a3a3" }}>
                                            <Instagram className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                                {facebook && (
                                    <Link href={facebook} target="_blank">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10" style={{ color: config?.footerText || "#a3a3a3" }}>
                                            <Facebook className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                                {youtube && (
                                    <Link href={youtube} target="_blank">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10" style={{ color: config?.footerText || "#a3a3a3" }}>
                                            <Youtube className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                                {tiktok && (
                                    <Link href={tiktok.startsWith("http") ? tiktok : `https://tiktok.com/@${tiktok.replace("@", "")}`} target="_blank">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10" style={{ color: config?.footerText || "#a3a3a3" }}>
                                            <Music2 className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                                {twitter && (
                                    <Link href={twitter.startsWith("http") ? twitter : `https://x.com/${twitter.replace("@", "")}`} target="_blank">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10" style={{ color: config?.footerText || "#a3a3a3" }}>
                                            <Twitter className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                );

            case "menu":
                const menu = getMenu(block.menuHandle);
                return (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider" style={{ color: config?.footerText || "#ffffff" }}>
                            {block.title || menu?.title || "Links"}
                        </h4>
                        <ul className="space-y-2 text-sm" style={{ color: config?.footerText || "#a3a3a3" }}>
                            {menu?.items?.length > 0 ? (
                                menu.items
                                    .sort((a: any, b: any) => a.order - b.order)
                                    .map((item: any) => (
                                        <li key={item.id}>
                                            <Link href={item.url || "#"} className="opacity-80 hover:opacity-100 hover:underline transition-opacity">
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))
                            ) : (
                                <li className="opacity-50 italic text-xs">Nenhum item no menu</li>
                            )}
                        </ul>
                    </div>
                );

            case "contact":
                const mapUrl = config?.mapUrl;
                return (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider" style={{ color: config?.footerText || "#ffffff" }}>
                            {block.title || "Atendimento"}
                        </h4>
                        <ul className="space-y-2 text-sm" style={{ color: config?.footerText || "#a3a3a3" }}>
                            {(block.address || address) && (
                                <li className="opacity-80">{block.address || address}</li>
                            )}
                            {(block.phone || phone) && (
                                <li className="opacity-80">{block.phone || phone}</li>
                            )}
                            {(block.email || email) && (
                                <li className="opacity-80">{block.email || email}</li>
                            )}
                        </ul>
                        {mapUrl && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-white/10">
                                <iframe
                                    src={mapUrl}
                                    width="100%"
                                    height="150"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Localização da loja"
                                />
                            </div>
                        )}
                    </div>
                );

            case "payment":
                return (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider" style={{ color: config?.footerText || "#ffffff" }}>
                            {block.title || "Pagamento Seguro"}
                        </h4>
                        <div className="flex gap-2 items-start opacity-80" style={{ color: config?.footerText || "#a3a3a3" }}>
                            <CreditCard className="h-6 w-6 shrink-0" />
                            <p className="text-sm">{paymentText}</p>
                        </div>
                    </div>
                );

            case "newsletter":
                return (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider" style={{ color: config?.footerText || "#ffffff" }}>
                            {block.title || "Newsletter"}
                        </h4>
                        <p className="text-sm opacity-80" style={{ color: config?.footerText || "#a3a3a3" }}>
                            {block.newsletterText || "Receba nossas novidades e promoções exclusivas."}
                        </p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Seu e-mail"
                                className="h-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 flex-1"
                            />
                            <Button size="sm" style={{ backgroundColor: config?.themeColor || "#db2777", color: "#ffffff" }}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );

            case "custom":
                return (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider" style={{ color: config?.footerText || "#ffffff" }}>
                            {block.title || "Título"}
                        </h4>
                        <p className="text-sm opacity-80" style={{ color: config?.footerText || "#a3a3a3" }}>
                            {block.content || ""}
                        </p>
                    </div>
                );

            case "custom_links":
                return (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider" style={{ color: config?.footerText || "#ffffff" }}>
                            {block.title || "Links"}
                        </h4>
                        {block.linkItems?.length ? (
                            <ul className="space-y-2 text-sm" style={{ color: config?.footerText || "#a3a3a3" }}>
                                {block.linkItems.map(item => (
                                    <li key={item.id}>
                                        <Link href={item.url || "#"} className="opacity-80 hover:opacity-100 hover:underline transition-opacity">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm opacity-50 italic">Nenhum link configurado</p>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    // If no blocks configured, return null (will use fallback Footer)
    if (sortedBlocks.length === 0) {
        return null;
    }

    const bgStyle = { backgroundColor: config?.footerBg || "#171717" };
    const textStyle = { color: config?.footerText || "#a3a3a3" };

    // Calculate grid columns based on block count
    const gridCols = sortedBlocks.length === 1 ? "grid-cols-1" :
        sortedBlocks.length === 2 ? "grid-cols-1 md:grid-cols-2" :
            sortedBlocks.length === 3 ? "grid-cols-1 md:grid-cols-3" :
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

    return (
        <footer data-section="footer" data-style="blocks" className="pt-12 pb-6" style={bgStyle}>
            <div className="container mx-auto px-4">
                {/* Blocks Grid */}
                <div className={`grid ${gridCols} gap-8 items-start`}>
                    {sortedBlocks.map((block) => (
                        <div key={block.id}>
                            {renderBlockContent(block)}
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/10 mt-10 pt-6">
                    <div className={`flex flex-wrap items-center gap-4 text-sm ${bottomAlignment === "left" ? "justify-start" :
                        bottomAlignment === "right" ? "justify-end" : "justify-center"
                        }`} style={textStyle}>
                        {bottomBlocks.length > 0 ? (
                            bottomBlocks
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((block, index) => (
                                    <span key={block.id} className="opacity-60">
                                        {block.content}
                                        {index < bottomBlocks.length - 1 && <span className="mx-2">•</span>}
                                    </span>
                                ))
                        ) : (
                            <span className="opacity-60">
                                © {new Date().getFullYear()} {storeName}. Todos os direitos reservados.
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
