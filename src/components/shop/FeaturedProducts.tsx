export function FeaturedProducts() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">Os Queridinhos</h2>
                <span className="text-sm font-medium text-primary cursor-pointer hover:underline">Ver todos</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Placeholders for products - will implement real fetching next */}
                <div className="aspect-4/5 bg-slate-100 rounded-md animate-pulse"></div>
                <div className="aspect-4/5 bg-slate-100 rounded-md animate-pulse"></div>
                <div className="aspect-4/5 bg-slate-100 rounded-md animate-pulse"></div>
                <div className="aspect-4/5 bg-slate-100 rounded-md animate-pulse"></div>
            </div>
        </div>
    )
}
