import { Sidebar } from "@/components/admin/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full bg-slate-50">
            {/* Force Admin Colors locally */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --primary: #0f172a; 
                    --primary-foreground: #f8fafc;
                    --background: #f8fafc;
                    --foreground: #0f172a;
                    --secondary: #ffffff;
                    --muted: #f1f5f9;
                    --muted-foreground: #64748b;
                    --border: #e2e8f0;
                }
            `}} />

            {/* Desktop Sidebar (Hidden on mobile) */}
            <div className="hidden md:flex h-screen sticky top-0">
                <Sidebar />
            </div>

            <div className="flex flex-1 flex-col overflow-hidden min-h-screen">
                <header className="flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 sticky top-0 z-30">

                    {/* Mobile Sidebar Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2">
                                    <Menu className="h-6 w-6 text-slate-600" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72">
                                <Sidebar />
                            </SheetContent>
                        </Sheet>
                    </div>

                    <h1 className="text-lg font-semibold md:text-xl text-slate-800">Admin</h1>
                    <div className="ml-auto text-sm text-slate-500">
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50/50 pb-20 md:pb-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
