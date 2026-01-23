import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
                    <h1 className="text-lg font-semibold md:text-xl">Bem-vindo, Admin</h1>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    );
}
