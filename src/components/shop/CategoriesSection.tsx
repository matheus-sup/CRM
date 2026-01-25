import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Star, Zap } from "lucide-react";

export function CategoriesSection() {
    // Mock categories for now
    const categories = [
        { id: 1, name: "Maquiagem", count: "120+ produtos", icon: Sparkles, color: "bg-pink-100 text-pink-600" },
        { id: 2, name: "Skincare", count: "45+ produtos", icon: Heart, color: "bg-blue-100 text-blue-600" },
        { id: 3, name: "Lançamentos", count: "Novidades", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
        { id: 4, name: "Mais Vendidos", count: "Favoritos", icon: Star, color: "bg-purple-100 text-purple-600" },
    ];

    return (
        <section className="container mx-auto px-4 py-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Navegue por Categoria</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <Link key={cat.id} href="#" className="group">
                        <div className="bg-white border rounded-xl p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-pink-200">
                            <div className={`p-3 rounded-lg ${cat.color} group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">{cat.name}</h3>
                                <p className="text-xs text-gray-500">{cat.count}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
