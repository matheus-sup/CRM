export default function AdminChatPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Atendimento (Chat)</h1>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    {/* Icon placeholder */}
                    💬
                </div>
                <h2 className="mt-6 text-xl font-semibold">Integração WhatsApp em Breve</h2>
                <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm">
                    Aqui você poderá responder seus clientes diretamente pelo painel usando a EvolutionAPI.
                </p>
            </div>
        </div>
    );
}
