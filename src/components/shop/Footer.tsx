import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer({ config }: { config?: any }) {
    // Default config if not provided
    const storeName = config?.storeName || "Gut Cosméticos";
    const description = config?.description || "A Gut Cosméticos & Makes nasceu para realçar sua beleza natural com os melhores produtos do mercado.";
    const email = config?.email || "contato@gutcosmeticos.com.br";
    const phone = config?.phone || "(11) 99673-9701";
    const address = config?.address || "São Paulo / SP";
    const instagram = config?.instagram;
    const facebook = config?.facebook;

    const showLogo = config?.footerLogo;
    const logoUrl = config?.logoUrl;

    // Legal Data
    const cnpj = config?.cnpj;
    const legalName = config?.legalName;

    // Colors - Force them to ensure contrast
    const bgStyle = { backgroundColor: config?.footerBg || "#171717" };
    const textStyle = { color: config?.footerText || "#a3a3a3" };

    return (
        <footer className="pt-16 pb-8 transition-colors duration-300" style={bgStyle}>
            <div className="container mx-auto px-4">

                {/* Top Section: Newsletter */}
                {config?.newsletterEnabled !== false && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-primary-foreground p-8 rounded-2xl mb-12 shadow-lg" style={{ backgroundColor: "var(--brand-accent)" }}>
                        <div className="md:w-1/2 space-y-2">
                            <h3 className="text-2xl font-bold">Receba nossas novidades</h3>
                            <p className="primary-foreground/90 text-sm opacity-90">Cadastre-se para receber ofertas exclusivas e descontos especiais.</p>
                        </div>
                        <div className="md:w-1/2 flex gap-2 w-full flex-col sm:flex-row">
                            <Input
                                placeholder="Seu nome"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white h-12 rounded-full px-6 flex-1"
                            />
                            <Input
                                placeholder="Seu e-mail ou WhatsApp"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white h-12 rounded-full px-6 flex-1"
                            />
                            <Button className="bg-white text-primary hover:bg-white/90 font-bold h-12 px-8 rounded-full shadow-md">
                                OK
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-sm" style={textStyle}>
                    {/* Brand & Contact */}
                    <div className="space-y-6">
                        {showLogo && logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="h-16 object-contain mb-4" />
                        ) : (
                            <h4 className="font-bold text-2xl uppercase tracking-wider mb-2" style={{ color: config?.themeColor || "var(--primary)" }}>{storeName}</h4>
                        )}

                        <p className="leading-relaxed opacity-90">
                            {description}
                        </p>
                        <div className="flex gap-4 pt-2">
                            {instagram && (
                                <Link href={instagram} target="_blank">
                                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10 transition-all" style={{ color: config?.footerText }}>
                                        <Instagram className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            {facebook && (
                                <Link href={facebook} target="_blank">
                                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10 transition-all" style={{ color: config?.footerText }}>
                                        <Facebook className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-6 opacity-80">Navegação</h4>
                        <ul className="space-y-4 opacity-90">
                            <li><Link href="/produtos" className="hover:underline transition-all">Ver Produtos</Link></li>
                            <li><Link href="/categorias" className="hover:underline transition-all">Categorias</Link></li>
                            <li><Link href="/pedidos" className="hover:underline transition-all">Rastrear Pedido</Link></li>
                            <li><Link href="/contato" className="hover:underline transition-all">Fale Conosco</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-6 opacity-80">Ajuda</h4>
                        <ul className="space-y-4 opacity-90">
                            <li><Link href="/trocas" className="hover:underline transition-all">Trocas e Devoluções</Link></li>
                            <li><Link href="/privacidade" className="hover:underline transition-all">Política de Privacidade</Link></li>
                            <li><Link href="/termos" className="hover:underline transition-all">Termos de Uso</Link></li>
                            <li><Link href="/faq" className="hover:underline transition-all">Dúvidas Frequentes</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-6 opacity-80">Atendimento</h4>
                        <ul className="space-y-4 opacity-90">
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>{phone}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>{email}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span>{address}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-10 border-t opacity-20" style={{ borderColor: config?.footerText }}></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6" style={textStyle}>

                    {/* Payment Methods */}
                    {config?.showPaymentMethods !== false && (
                        <div className="flex gap-4 items-center">
                            {/* Placeholder SVGs for payment methods to look more "real" without external assets */}
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80" title="Cartão de Crédito">
                                <CreditCard className="h-5 w-5 text-slate-800" />
                            </div>
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80" title="Boleto">
                                <span className="text-[10px] font-bold text-slate-800">BOLETO</span>
                            </div>
                            <div className="h-8 w-12 bg-white rounded flex items-center justify-center opacity-80" title="Pix">
                                <span className="text-[10px] font-bold text-slate-800">PIX</span>
                            </div>
                        </div>
                    )}

                    {/* Legal Data & Copyright */}
                    <div className="text-center md:text-right space-y-1">
                        <p className="text-xs opacity-70">© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>

                        {(cnpj || legalName) && (
                            <p className="text-[10px] opacity-50 uppercase tracking-wide">
                                {legalName || storeName} {cnpj && `• CNPJ: ${cnpj}`}
                            </p>
                        )}

                        <p className="text-[10px] opacity-50 mt-2">
                            Desenvolvido com ❤️ por <span className="font-bold">Bkaiser Solutions</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
