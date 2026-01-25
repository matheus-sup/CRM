import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Sparkles, Package } from "lucide-react";

export async function CategoryNav() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        take: 20
    });

    return (
        <div className="pb-4 pt-4 shadow-inner" style={{ backgroundColor: "var(--brand-accent)" }}>
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 md:justify-center">
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <Link key={cat.id} href={`/produtos?category=${cat.id}`} className="group flex-none min-w-[90px] flex flex-col items-center gap-2">
                                <div className="h-20 w-20 bg-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:-translate-y-1 shadow-sm border border-white/10 group-hover:border-white/50 backdrop-blur-sm overflow-hidden">
                                    {cat.imageUrl ? (
                                        <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <Sparkles className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                                    )}
                                </div>
                                <span className="text-white/90 font-medium text-xs tracking-wide group-hover:text-white transition-colors uppercase">{cat.name}</span>
                            </Link>
                        ))
                    ) : (
                        // Fallback/Empty State placeholder so it doesn't look broken initially
                        <div className="flex items-center justify-center w-full py-4 text-white/50 text-sm italic">
                            <span className="flex items-center gap-2"><Package className="h-4 w-4" /> Nenhuma categoria encontrada</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
