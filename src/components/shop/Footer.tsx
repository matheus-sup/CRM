import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-muted text-muted-foreground">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-primary">Gut Cosméticos</h3>
                        <p className="text-sm">
                            Sua beleza é nossa prioridade. Encontre os melhores produtos de maquiagem e cuidados pessoais.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="mb-4 font-semibold text-foreground">Loja</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/produtos" className="hover:text-primary">Produtos</Link></li>
                            <li><Link href="/categorias" className="hover:text-primary">Categorias</Link></li>
                            <li><Link href="/lancamentos" className="hover:text-primary">Lançamentos</Link></li>
                            <li><Link href="/promocoes" className="hover:text-primary">Promoções</Link></li>
                        </ul>
                    </div>

                    {/* Institutional */}
                    <div>
                        <h4 className="mb-4 font-semibold text-foreground">Institucional</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/sobre" className="hover:text-primary">Sobre Nós</Link></li>
                            <li><Link href="/contato" className="hover:text-primary">Fale Conosco</Link></li>
                            <li><Link href="/politica-privacidade" className="hover:text-primary">Política de Privacidade</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter / Social */}
                    <div>
                        <h4 className="mb-4 font-semibold text-foreground">Siga-nos</h4>
                        <div className="flex space-x-4">
                            <Link href="#" className="hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 text-center text-sm">
                    <p>© {new Date().getFullYear()} Gut Cosméticos & Makes. Todos os direitos reservados.</p>
                    <p className="mt-2 text-xs text-muted-foreground/60">
                        Criado por <span className="font-semibold text-primary">Bkaiser Solution</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
