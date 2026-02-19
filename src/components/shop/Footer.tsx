"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlockFooter } from "./BlockFooter";

export function Footer({ config, menus = [] }: { config?: any, menus?: any[] }) {
    const footerStyle = config?.footerStyle || "full";

    // Check if footerBlocks are configured
    let hasBlocks = false;
    try {
        if (config?.footerBlocks) {
            const parsed = JSON.parse(config.footerBlocks);
            const blocks = Array.isArray(parsed) ? parsed : parsed.blocks;
            hasBlocks = blocks && blocks.length > 0;
        }
    } catch (e) {
        hasBlocks = false;
    }

    // Use style-based footers based on footerStyle setting
    // BlockFooter is only used when footerStyle is "full" (default) and blocks exist
    switch (footerStyle) {
        case "minimal":
            return <MinimalFooter config={config} menus={menus} />;
        case "modern":
            return <ModernFooter config={config} menus={menus} />;
        case "full":
        default:
            // If blocks are configured and style is full, use BlockFooter
            if (hasBlocks) {
                return <BlockFooter config={config} menus={menus} />;
            }
            return <FullFooter config={config} menus={menus} />;
    }
}

// =============================================================================
// FULL FOOTER - Complete with newsletter, 4 columns, payment methods
// =============================================================================
function FullFooter({ config, menus }: { config?: any; menus?: any[] }) {
    const storeName = config?.storeName || "Minha Loja";
    const description = config?.description || "Sua loja online com os melhores produtos.";
    const email = config?.email || "contato@loja.com.br";
    const phone = config?.phone || "(11) 99999-9999";
    const address = config?.address || "São Paulo / SP";
    const instagram = config?.instagram;
    const facebook = config?.facebook;
    const logoUrl = config?.logoUrl;
    const showLogo = config?.footerLogo;
    const cnpj = config?.cnpj;
    const legalName = config?.legalName;

    // Visibility settings with defaults (true)
    const showNewsletter = config?.showFooterNewsletter !== false && config?.showFooterNewsletter !== "false";
    const showPayments = config?.showFooterPayments !== false && config?.showFooterPayments !== "false";
    const showContact = config?.showFooterContact !== false && config?.showFooterContact !== "false";
    const showSocial = config?.showFooterSocial !== false && config?.showFooterSocial !== "false";

    const bgStyle = { backgroundColor: config?.footerBg || "#171717" };
    const textStyle = { color: config?.footerText || "#a3a3a3" };

    return (
        <footer data-section="footer" data-style="full" className="pt-16 pb-8" style={bgStyle}>
            <div className="container mx-auto px-4">
                {/* Newsletter */}
                {showNewsletter && (
                    <div
                        className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl mb-12"
                        style={{ backgroundColor: config?.themeColor || "var(--primary)" }}
                    >
                        <div className="md:w-1/2 space-y-2 text-white">
                            <h3 className="text-2xl font-bold">Receba nossas novidades</h3>
                            <p className="text-sm opacity-90">Ofertas exclusivas e descontos especiais.</p>
                        </div>
                        <div className="md:w-1/2 flex gap-2 w-full flex-col sm:flex-row">
                            <Input
                                placeholder="Seu e-mail"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12 rounded-full px-6 flex-1"
                            />
                            <Button className="bg-white hover:bg-white/90 font-bold h-12 px-8 rounded-full" style={{ color: config?.themeColor }}>
                                Inscrever
                            </Button>
                        </div>
                    </div>
                )}

                {/* 4 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-sm" style={textStyle}>
                    {/* Brand */}
                    <div className="space-y-4">
                        {showLogo && logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="h-12 object-contain" />
                        ) : (
                            <h4 className="font-bold text-xl uppercase" style={{ color: config?.themeColor }}>{storeName}</h4>
                        )}
                        <p className="leading-relaxed opacity-80">{description}</p>
                        {showSocial && (instagram || facebook) && (
                            <div className="flex gap-3 pt-2">
                                {instagram && (
                                    <Link href={instagram} target="_blank">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10" style={textStyle}>
                                            <Instagram className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                                {facebook && (
                                    <Link href={facebook} target="_blank">
                                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10" style={textStyle}>
                                            <Facebook className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-4 opacity-70">Navegação</h4>
                        <ul className="space-y-3 opacity-80">
                            <li><Link href="/produtos" className="hover:underline">Ver Produtos</Link></li>
                            <li><Link href="/categorias" className="hover:underline">Categorias</Link></li>
                            <li><Link href="/pedidos" className="hover:underline">Rastrear Pedido</Link></li>
                            <li><Link href="/contato" className="hover:underline">Fale Conosco</Link></li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-4 opacity-70">Links Úteis</h4>
                        <ul className="space-y-3 opacity-80">
                            <li><Link href="/trocas" className="hover:underline">Trocas e Devoluções</Link></li>
                            <li><Link href="/privacidade" className="hover:underline">Política de Privacidade</Link></li>
                            <li><Link href="/termos" className="hover:underline">Termos de Uso</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    {showContact && (
                        <div>
                            <h4 className="font-bold uppercase tracking-wider mb-4 opacity-70">Atendimento</h4>
                            <ul className="space-y-3 opacity-80">
                                <li className="flex items-center gap-2"><Phone className="h-4 w-4" />{phone}</li>
                                <li className="flex items-center gap-2"><Mail className="h-4 w-4" />{email}</li>
                                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{address}</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Bottom */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4" style={textStyle}>
                    {showPayments && (
                        <div className="flex gap-3">
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-slate-800" />
                            </div>
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                                <span className="text-[9px] font-bold text-slate-800">PIX</span>
                            </div>
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                                <span className="text-[9px] font-bold text-slate-800">BOLETO</span>
                            </div>
                        </div>
                    )}
                    <div className="text-center md:text-right text-xs opacity-60">
                        <p>© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
                        {cnpj && <p className="text-[10px] mt-1">{legalName || storeName} • CNPJ: {cnpj}</p>}
                    </div>
                </div>
            </div>
        </footer>
    );
}

// =============================================================================
// MINIMAL FOOTER - Single line, simple
// =============================================================================
function MinimalFooter({ config, menus }: { config?: any; menus?: any[] }) {
    const storeName = config?.storeName || "Minha Loja";
    const logoUrl = config?.logoUrl;
    const instagram = config?.instagram;
    const facebook = config?.facebook;

    // Visibility settings with defaults (true)
    const showSocial = config?.showFooterSocial !== false && config?.showFooterSocial !== "false";

    const bgStyle = { backgroundColor: config?.footerBg || "#000000" };
    const textStyle = { color: config?.footerText || "#ffffff" };

    return (
        <footer data-section="footer" data-style="minimal" className="py-6" style={bgStyle}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={textStyle}>
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-6">
                        {config?.footerLogo && logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="h-8 object-contain" />
                        ) : (
                            <span className="font-bold text-lg uppercase">{storeName}</span>
                        )}

                        {/* Minimal Links */}
                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            <Link href="/produtos" className="opacity-70 hover:opacity-100 transition-opacity">Produtos</Link>
                            <Link href="/contato" className="opacity-70 hover:opacity-100 transition-opacity">Contato</Link>
                            <Link href="/termos" className="opacity-70 hover:opacity-100 transition-opacity">Termos</Link>
                        </nav>
                    </div>

                    {/* Social + Copyright */}
                    <div className="flex items-center gap-4">
                        {showSocial && (
                            <>
                                {instagram && (
                                    <Link href={instagram} target="_blank" className="opacity-70 hover:opacity-100 transition-opacity">
                                        <Instagram className="h-5 w-5" />
                                    </Link>
                                )}
                                {facebook && (
                                    <Link href={facebook} target="_blank" className="opacity-70 hover:opacity-100 transition-opacity">
                                        <Facebook className="h-5 w-5" />
                                    </Link>
                                )}
                            </>
                        )}
                        <span className="text-xs opacity-50 ml-4">
                            © {new Date().getFullYear()} {storeName}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// =============================================================================
// MODERN FOOTER - 2 column layout, prominent social, newsletter inline
// =============================================================================
function ModernFooter({ config, menus }: { config?: any; menus?: any[] }) {
    const storeName = config?.storeName || "Minha Loja";
    const description = config?.description || "Sua loja online com os melhores produtos.";
    const email = config?.email;
    const phone = config?.phone;
    const instagram = config?.instagram;
    const facebook = config?.facebook;
    const youtube = config?.youtube;
    const logoUrl = config?.logoUrl;

    // Visibility settings with defaults (true)
    const showNewsletter = config?.showFooterNewsletter !== false && config?.showFooterNewsletter !== "false";
    const showContact = config?.showFooterContact !== false && config?.showFooterContact !== "false";
    const showSocial = config?.showFooterSocial !== false && config?.showFooterSocial !== "false";

    const bgStyle = { backgroundColor: config?.footerBg || "#1a1a2e" };
    const textStyle = { color: config?.footerText || "#eaeaea" };
    const accentColor = config?.themeColor || "#e94560";

    return (
        <footer data-section="footer" data-style="modern" className="py-12" style={bgStyle}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left: Brand & Social */}
                    <div className="space-y-6">
                        {config?.footerLogo && logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="h-10 object-contain" />
                        ) : (
                            <h3 className="text-2xl font-bold" style={{ color: accentColor }}>{storeName}</h3>
                        )}
                        <p className="text-sm max-w-md opacity-70" style={textStyle}>{description}</p>

                        {/* Prominent Social Icons */}
                        {showSocial && (instagram || facebook || youtube) && (
                            <div className="flex gap-3">
                                {instagram && (
                                    <Link
                                        href={instagram}
                                        target="_blank"
                                        className="h-12 w-12 rounded-full flex items-center justify-center transition-colors"
                                        style={{ backgroundColor: accentColor + "20", color: accentColor }}
                                    >
                                        <Instagram className="h-5 w-5" />
                                    </Link>
                                )}
                                {facebook && (
                                    <Link
                                        href={facebook}
                                        target="_blank"
                                        className="h-12 w-12 rounded-full flex items-center justify-center transition-colors"
                                        style={{ backgroundColor: accentColor + "20", color: accentColor }}
                                    >
                                        <Facebook className="h-5 w-5" />
                                    </Link>
                                )}
                                {youtube && (
                                    <Link
                                        href={youtube}
                                        target="_blank"
                                        className="h-12 w-12 rounded-full flex items-center justify-center transition-colors"
                                        style={{ backgroundColor: accentColor + "20", color: accentColor }}
                                    >
                                        <Youtube className="h-5 w-5" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Newsletter & Links */}
                    <div className="space-y-6">
                        {/* Newsletter Inline */}
                        {showNewsletter && (
                            <div>
                                <h4 className="font-semibold mb-3" style={textStyle}>Assine nossa newsletter</h4>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="seu@email.com"
                                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 flex-1"
                                    />
                                    <Button
                                        className="h-11 px-4"
                                        style={{ backgroundColor: accentColor, color: "white" }}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Quick Links Grid */}
                        <div className="grid grid-cols-2 gap-6 text-sm" style={textStyle}>
                            <div className="space-y-2">
                                <h5 className="font-semibold opacity-50 uppercase text-xs tracking-wider mb-3">Loja</h5>
                                <Link href="/produtos" className="block opacity-70 hover:opacity-100">Produtos</Link>
                                <Link href="/categorias" className="block opacity-70 hover:opacity-100">Categorias</Link>
                                <Link href="/ofertas" className="block opacity-70 hover:opacity-100">Ofertas</Link>
                            </div>
                            <div className="space-y-2">
                                <h5 className="font-semibold opacity-50 uppercase text-xs tracking-wider mb-3">Ajuda</h5>
                                <Link href="/contato" className="block opacity-70 hover:opacity-100">Contato</Link>
                                <Link href="/trocas" className="block opacity-70 hover:opacity-100">Trocas</Link>
                                <Link href="/termos" className="block opacity-70 hover:opacity-100">Termos</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={textStyle}>
                    <p className="opacity-50">© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
                    {showContact && (phone || email) && (
                        <div className="flex items-center gap-3 opacity-50">
                            {phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{phone}</span>}
                            {email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{email}</span>}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}
