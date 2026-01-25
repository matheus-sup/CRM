import { Sparkles } from "lucide-react";

export function MockCategoryNav({ config }: { config: any }) {
    // Mimic the look of the real CategoryNav but with static data
    const categories = [
        { id: '1', name: 'Ofertas' },
        { id: '2', name: 'Maquiagem' },
        { id: '3', name: 'Cabelos' },
        { id: '4', name: 'Skincare' },
        { id: '5', name: 'Perfumes' },
        { id: '6', name: 'Kits' },
    ];

    return (
        <div className="pb-4 pt-4 shadow-inner" style={{ backgroundColor: config?.themeColor || "var(--primary)" }}>
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 md:justify-center">
                    {categories.map((cat) => (
                        <div key={cat.id} className="group flex-none min-w-[90px] flex flex-col items-center gap-2 cursor-default">
                            <div className="h-20 w-20 bg-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-white/10 backdrop-blur-sm overflow-hidden">
                                <Sparkles className="h-8 w-8 text-white/50" />
                            </div>
                            <span className="text-white/90 font-medium text-xs tracking-wide uppercase">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
