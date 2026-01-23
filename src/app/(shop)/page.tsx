import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProducts } from "@/lib/actions/product";

export default async function HomePage() {
    const products = await getProducts();

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <section className="relative bg-teal-900 py-24 text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-teal-900 via-teal-800 to-transparent opacity-90" />
                    {/* Placeholder for Hero Image */}
                </div>

                <div className="container relative mx-auto px-4">
                    <div className="max-w-2xl space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                            Realce sua <span className="text-primary">Beleza Natural</span>
                        </h1>
                        <p className="text-lg text-teal-100">
                            Descubra os melhores produtos de maquiagem, skincare e perfumaria com preços imperdíveis.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Button size="lg" className="rounded-full bg-primary font-bold text-white hover:bg-primary/90" asChild>
                                <Link href="/explorar">Ver Ofertas</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full border-white text-teal-900 font-bold hover:bg-white hover:text-teal-900" asChild>
                                <Link href="/categorias">Categorias</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="container mx-auto px-4">
                <h2 className="mb-8 text-2xl font-bold text-secondary">Categorias em Destaque</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {['Maquiagem', 'Skincare', 'Cabelos', 'Perfumes'].map((cat) => (
                        <div key={cat} className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
                            <div className="aspect-square bg-muted group-hover:bg-muted/80" />
                            <div className="absolute bottom-0 w-full bg-linear-to-t from-black/60 to-transparent p-4">
                                <span className="font-bold text-white">{cat}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Product List Placeholder */}
            <section className="container mx-auto px-4">
                <div className="mb-8 flex items-end justify-between">
                    <h2 className="text-2xl font-bold text-secondary">Lançamentos</h2>
                    <Link href="/lancamentos" className="text-primary hover:underline font-medium">Ver tudo</Link>
                </div>

                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                    {products.length === 0 ? (
                        <p className="col-span-full text-center text-muted-foreground p-8">Nenhum produto cadastrado ainda.</p>
                    ) : (
                        products.map((product: any) => (
                            <Link key={product.id} href={`/produto/${product.slug}`} className="group block">
                                <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50 h-full flex flex-col">
                                    <div className="mb-4 aspect-square rounded-md bg-muted relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-muted-foreground/20">
                                            {product.name.charAt(0)}
                                        </div>
                                    </div>
                                    <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary transition-colors">{product.name}</h3>
                                    <div className="mt-auto pt-4 flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-primary">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                        </span>
                                        {product.compareAtPrice && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.compareAtPrice))}
                                            </span>
                                        )}
                                    </div>
                                    <Button className="mt-4 w-full rounded-full" size="sm">Ver Detalhes</Button>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
