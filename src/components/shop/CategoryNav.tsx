import Link from "next/link";
import { ArrowRight, Shirt, Scissors, Footprints, Sparkles, Droplets } from "lucide-react";

const categories = [
    { name: "Cabelos", icon: <Scissors className="h-10 w-10 text-gray-300" /> },
    { name: "Maquiagem", icon: <Sparkles className="h-10 w-10 text-gray-300" /> },
    { name: "Perfumes", icon: <Droplets className="h-10 w-10 text-gray-300" /> },
    { name: "Skincare", icon: <Sparkles className="h-10 w-10 text-gray-300" /> },
    { name: "Unhas", icon: <Scissors className="h-10 w-10 text-gray-300" /> },
    { name: "Corpo", icon: <Footprints className="h-10 w-10 text-gray-300" /> },
    { name: "Roupas", icon: <Shirt className="h-10 w-10 text-gray-300" /> },
];

export function CategoryNav() {
    return (
        <div className="bg-primary pb-8 pt-4">
            <div className="container mx-auto px-4">
                <div className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-2">
                    {categories.map((cat, idx) => (
                        <Link key={idx} href={`/categoria/${cat.name.toLowerCase()}`} className="group shrink-0 flex flex-col items-center gap-2">
                            <div className="h-28 w-28 bg-white rounded-sm flex items-center justify-center transition-transform group-hover:-translate-y-1 shadow-sm border border-white/10">
                                {cat.icon}
                            </div>
                            <span className="text-white font-bold text-sm text-center">{cat.name}</span>
                        </Link>
                    ))}

                    <Link href="/categorias" className="shrink-0 flex flex-col items-center gap-2 group ml-4 justify-center h-28">
                        <div className="flex items-center gap-1 text-white font-bold text-sm bg-white/10 px-4 py-2 rounded-full group-hover:bg-white/20 transition-colors">
                            Ver todas <ArrowRight className="h-4 w-4" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
