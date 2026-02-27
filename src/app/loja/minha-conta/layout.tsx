import { getCurrentUser, logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, User, LogOut, Heart } from "lucide-react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/loja/login");
    }

    return (
        <div className="container mx-auto px-4 pt-32 pb-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-800 mb-1">Olá, {user.name?.split(" ")[0] || "Usuário"}!</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>

                    <nav className="space-y-1">
                        <Link href="/loja/minha-conta/pedidos">
                            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:text-primary hover:bg-primary/5">
                                <Package className="h-4 w-4" /> Meus Pedidos
                            </Button>
                        </Link>
                        <Link href="/loja/minha-conta/perfil">
                            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:text-primary hover:bg-primary/5">
                                <User className="h-4 w-4" /> Meus Dados
                            </Button>
                        </Link>
                        {/* 
                        <Link href="/minha-conta/favoritos">
                            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:text-primary hover:bg-primary/5">
                                <Heart className="h-4 w-4" /> Favoritos
                            </Button>
                        </Link> 
                        */}
                    </nav>

                    <form action={logout}>
                        <Button variant="outline" className="w-full justify-start gap-2 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700">
                            <LogOut className="h-4 w-4" /> Sair
                        </Button>
                    </form>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
