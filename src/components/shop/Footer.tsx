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

    // If user configured footer blocks in the editor, always use BlockFooter
    if (hasBlocks) {
        return <BlockFooter config={config} menus={menus} />;
    }

    // Fallback to style-based footers when no blocks are configured
    switch (footerStyle) {
        case "minimal":
            return <MinimalFooter config={config} menus={menus} />;
        case "modern":
            return <ModernFooter config={config} menus={menus} />;
        case "restaurant":
            return <RestaurantFooter config={config} menus={menus} />;
        case "full":
        default:
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
                            <li><Link href="/loja/produtos" className="hover:underline">Ver Produtos</Link></li>
                            <li><Link href="/loja/categorias" className="hover:underline">Categorias</Link></li>
                            <li><Link href="/loja/pedidos" className="hover:underline">Rastrear Pedido</Link></li>
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
                            <Link href="/loja/produtos" className="opacity-70 hover:opacity-100 transition-opacity">Produtos</Link>
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
                                <Link href="/loja/produtos" className="block opacity-70 hover:opacity-100">Produtos</Link>
                                <Link href="/loja/categorias" className="block opacity-70 hover:opacity-100">Categorias</Link>
                                <Link href="/loja/ofertas" className="block opacity-70 hover:opacity-100">Ofertas</Link>
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

// =============================================================================
// RESTAURANT FOOTER - Compact, food-delivery focused design
// =============================================================================
function RestaurantFooter({ config, menus }: { config?: any; menus?: any[] }) {
    const storeName = config?.storeName || "Meu Restaurante";
    const phone = config?.phone || "(11) 99999-9999";
    const address = config?.address || "Centro, São Paulo";
    const email = config?.email;
    const instagram = config?.instagram;
    const whatsapp = config?.whatsapp;
    const themeColor = config?.themeColor || "#ef4444";

    const bgStyle = { backgroundColor: config?.footerBg || "#1f2937" };
    const textStyle = { color: config?.footerText || "#9ca3af" };

    // Parse operating hours from config or use defaults
    const operatingHours = config?.operatingHours || "18:00 - 23:00";

    return (
        <footer data-section="footer" data-style="restaurant" className="py-8 sm:py-10 md:py-12" style={bgStyle}>
            <div className="container mx-auto px-4">
                {/* Main Content - Centered */}
                <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 flex items-center justify-center gap-2">
                        <span>🍔</span> {storeName}
                    </h3>
                    <p className="text-xs sm:text-sm" style={textStyle}>O melhor sabor da cidade</p>
                </div>

                {/* Info Grid */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 text-xs sm:text-sm" style={textStyle}>
                    {address && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate max-w-[150px] sm:max-w-none">{address}</span>
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{phone}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{operatingHours}</span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {["💳", "💵", "PIX"].map((method, i) => (
                        <span
                            key={i}
                            className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 text-white"
                        >
                            {method}
                        </span>
                    ))}
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {instagram && (
                        <Link
                            href={instagram}
                            target="_blank"
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors"
                            style={{ backgroundColor: themeColor }}
                        >
                            <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </Link>
                    )}
                    {whatsapp && (
                        <Link
                            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-green-500"
                        >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </Link>
                    )}
                    {email && (
                        <Link
                            href={`mailto:${email}`}
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-white/10"
                        >
                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </Link>
                    )}
                </div>

                {/* Copyright */}
                <div className="text-center text-[10px] sm:text-xs" style={textStyle}>
                    <p className="opacity-60">© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
