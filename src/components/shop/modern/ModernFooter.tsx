"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FooterBlock {
    id: string;
    type: "about" | "menu" | "contact" | "payment" | "newsletter" | "custom" | "custom_links";
    order: number;
    menuHandle?: string;
    title?: string;
    content?: string;
    phone?: string;
    email?: string;
    address?: string;
    newsletterText?: string;
    linkItems?: { id: string; label: string; url: string; }[];
}

interface ModernFooterProps {
    config?: any;
    menus?: any[];
}

export function ModernFooter({ config, menus = [] }: ModernFooterProps) {
    const storeName = config?.storeName || "Loja";
    const currentYear = new Date().getFullYear();

    // Parse footer blocks from config
    let blocks: FooterBlock[] = [];
    let bottomBlocks: { id: string; content: string }[] = [];
    let bottomAlignment: "left" | "center" | "right" = "center";
    try {
        if (config?.footerBlocks) {
            const parsed = JSON.parse(config.footerBlocks);
            if (Array.isArray(parsed)) {
                blocks = parsed;
            } else {
                blocks = parsed.blocks || [];
                bottomAlignment = parsed.bottomAlignment || "center";
                if (parsed.bottomBlocks) {
                    bottomBlocks = parsed.bottomBlocks;
                } else if (parsed.footerText) {
                    bottomBlocks = [{ id: "legacy", content: parsed.footerText }];
                }
            }
        }
    } catch (e) {
        console.error("Error parsing footerBlocks:", e);
    }

    // If no blocks configured, use default layout
    if (blocks.length === 0) {
        blocks = [
            { id: "1", type: "about", order: 0 },
            { id: "2", type: "menu", order: 1, menuHandle: "footer", title: "Links do Rodapé" },
            { id: "3", type: "contact", order: 2 },
            { id: "4", type: "payment", order: 3 },
        ];
    }

    // Helper to get menu by handle
    const getMenu = (handle?: string) => {
        if (!handle) return null;
        return menus.find(m => m.handle === handle);
    };

    // Render block based on type
    const renderBlock = (block: FooterBlock) => {
        // Fallback values from global config
        const description = block.content || config?.description || "Sua loja favorita de cosméticos e maquiagens.";
        const address = block.address || config?.address;
        const phone = block.phone || config?.phone;
        const email = block.email || config?.email;
        const paymentText = block.content || config?.paymentText || "Aceitamos todos os cartões, PIX e Boleto.";
        const newsletterText = block.newsletterText || "Receba nossas novidades e promoções.";

        switch (block.type) {
            case "about":
                return (
                    <div key={block.id} className="space-y-6">
                        {(config?.footerLogo === "true" || config?.footerLogo === true) && config?.logoUrl ? (
                            <img
                                src={config.logoUrl}
                                alt={storeName}
                                className="h-12 object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                                style={{ maxHeight: '60px', maxWidth: '180px' }}
                            />
                        ) : (
                            <h4 className="text-white text-lg font-bold uppercase tracking-wider">{block.title || storeName}</h4>
                        )}
                        <p className="text-sm leading-relaxed text-slate-400">
                            {description}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            {config?.instagram && (
                                <a href={config.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {config?.facebook && (
                                <a href={config.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {config?.twitter && (
                                <a href={config.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                    <Twitter className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>
                );

            case "menu":
                const menu = getMenu(block.menuHandle);
                return (
                    <div key={block.id} className="space-y-6">
                        <h4 className="text-white text-lg font-bold uppercase tracking-wider">{menu?.title || block.title || "Links"}</h4>
                        <ul className="space-y-3 text-sm">
                            {menu?.items?.length > 0 ? (
                                menu.items.map((item: any) => (
                                    <li key={item.id}>
                                        <Link href={item.url || "#"} className="hover:text-primary transition-colors">{item.label}</Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link href="/sobre" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                                    <li><Link href="/politica-privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
                                    <li><Link href="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                                    <li><Link href="/contato" className="hover:text-primary transition-colors">Fale Conosco</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                );

            case "contact":
                return (
                    <div key={block.id} className="space-y-6">
                        <h4 className="text-white text-lg font-bold uppercase tracking-wider">{block.title || "Atendimento"}</h4>
                        <div className="space-y-4 text-sm text-slate-400">
                            {address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                                    <span className="whitespace-pre-line">{address}</span>
                                </div>
                            )}
                            {phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-primary shrink-0" />
                                    <span>{phone}</span>
                                </div>
                            )}
                            {email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-primary shrink-0" />
                                    <span>{email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "payment":
                return (
                    <div key={block.id} className="space-y-6">
                        <h4 className="text-white text-lg font-bold uppercase tracking-wider">{block.title || "Pagamento Seguro"}</h4>
                        <div className="flex gap-2 text-slate-400 items-center">
                            <CreditCard className="h-8 w-8 text-slate-500" />
                            <span className="text-sm">{paymentText}</span>
                        </div>
                    </div>
                );

            case "newsletter":
                return (
                    <div key={block.id} className="space-y-6">
                        <h4 className="text-white text-lg font-bold uppercase tracking-wider">{block.title || "Newsletter"}</h4>
                        <p className="text-sm text-slate-400">{newsletterText}</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Seu e-mail"
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            />
                            <Button size="sm">OK</Button>
                        </div>
                    </div>
                );

            case "custom_links":
                return (
                    <div key={block.id} className="space-y-6">
                        <h4 className="text-white text-lg font-bold uppercase tracking-wider">{block.title || "Links"}</h4>
                        <ul className="space-y-3 text-sm">
                            {(block.linkItems || []).map((item) => (
                                <li key={item.id}>
                                    <Link href={item.url} className="hover:text-primary transition-colors">{item.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                );

            case "custom":
                return (
                    <div key={block.id} className="space-y-6">
                        <h4 className="text-white text-lg font-bold uppercase tracking-wider">{block.title || "Título"}</h4>
                        <div className="text-sm leading-relaxed text-slate-400 whitespace-pre-wrap">
                            {block.content}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Determine grid columns based on number of blocks
    const gridCols = blocks.length <= 2 ? "md:grid-cols-2" :
        blocks.length <= 3 ? "md:grid-cols-3" :
            "md:grid-cols-4";

    const alignmentClass = bottomAlignment === "left" ? "justify-start" :
        bottomAlignment === "right" ? "justify-end" :
            "justify-center";

    return (
        <footer
            data-section="footer"
            className="bg-slate-900 text-slate-300 border-t border-slate-800 font-sanstransition-colors duration-300"
            style={{
                backgroundColor: config?.footerBg,
                color: config?.footerText
            }}
        >
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-16">

                {/* Optional Newsletter Banner (Legacy Style) */}
                {(config?.newsletterEnabled !== false && config?.newsletterEnabled !== "false") && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl mb-12 shadow-lg relative overflow-hidden group border border-white/10"
                        style={{ backgroundColor: "var(--brand-accent, #3b82f6)" }}>
                        {/* Background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

                        <div className="md:w-1/2 space-y-2 relative z-10">
                            <h3 className="text-2xl font-bold text-white">Receba nossas novidades</h3>
                            <p className="text-white/90 text-sm">Cadastre-se para receber ofertas exclusivas e descontos especiais.</p>
                        </div>
                        <div className="md:w-1/2 flex gap-2 w-full flex-col sm:flex-row relative z-10">
                            <Input
                                placeholder="Seu nome"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white h-12 rounded-full px-6 flex-1 focus-visible:bg-white/20 transition-all"
                            />
                            <Input
                                placeholder="Seu e-mail ou WhatsApp"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white h-12 rounded-full px-6 flex-1 focus-visible:bg-white/20 transition-all"
                            />
                            <Button className="bg-white hover:bg-white/90 text-slate-900 font-bold h-12 px-8 rounded-full shadow-md transition-all hover:scale-105 active:scale-95">
                                OK
                            </Button>
                        </div>
                    </div>
                )}

                <div className={`grid grid-cols-1 ${gridCols} gap-12`}>
                    {blocks.sort((a, b) => a.order - b.order).map(renderBlock)}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-black py-6 border-t border-slate-800">
                <div className="container mx-auto px-4 text-sm text-slate-500">
                    <div className={`flex flex-wrap items-center gap-4 ${alignmentClass}`}>
                        {bottomBlocks.length > 0 ? (
                            bottomBlocks.map((bb, index) => (
                                <div key={bb.id} className="flex items-center gap-4">
                                    <span className="whitespace-pre-wrap">{bb.content}</span>
                                    {index < bottomBlocks.length - 1 && (
                                        <span className="text-slate-700">•</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>&copy; {currentYear} {storeName}. Todos os direitos reservados.</p>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
