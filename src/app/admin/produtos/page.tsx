import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreVertical, Edit2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/lib/actions/product";

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
                </div>
                <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href="/admin/produtos/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar produto
                    </Link>
                </Button>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar produtos" className="pl-10 bg-white" />
                </div>
                <Button variant="outline" className="gap-2 bg-white text-slate-600">
                    <Filter className="h-4 w-4" /> Filtrar
                </Button>
            </div>

            <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4 border-b bg-slate-50/50 flex text-sm font-bold text-slate-600">
                    <div className="w-[50%]">Produto</div>
                    <div className="w-[20%]">Preço</div>
                    <div className="w-[15%]">Estoque</div>
                    <div className="w-[15%] text-right">Ações</div>
                </div>

                {products.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Nenhum produto encontrado.
                    </div>
                ) : (
                    <div>
                        {products.map((product) => (
                            <div key={product.id} className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="w-[50%] flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-300 font-bold overflow-hidden">
                                        {/* Placeholder or Image */}
                                        {product.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                                            <Link href={`/admin/produtos/${product.id}`}>{product.name}</Link>
                                        </span>
                                        <span className="text-xs text-slate-500">{product.sku || "Sem SKU"}</span>
                                    </div>
                                </div>
                                <div className="w-[20%] text-sm font-medium text-slate-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                </div>
                                <div className="w-[15%]">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock} un
                                    </span>
                                </div>
                                <div className="w-[15%] flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
