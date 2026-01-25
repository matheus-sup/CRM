export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Minimal Header */}
            <div className="bg-white border-b h-16 flex items-center justify-center">
                <span className="text-xl font-black uppercase text-primary tracking-tighter">GUT</span>
            </div>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
