
import { Button } from "@/components/ui/button";
import { Megaphone, Mail, Share2 } from "lucide-react";

export default function MarketingPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Marketing</h1>
                    <p className="text-sm text-slate-500">Gerencie campanhas e integrações de marketing.</p>
                </div>
                <Button>
                    <Megaphone className="mr-2 h-4 w-4" />
                    Nova Campanha
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white border rounded-lg shadow-sm space-y-4">
                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg">E-mail Marketing</h3>
                    <p className="text-sm text-slate-500">Configure disparos automáticos e newsletters.</p>
                    <Button variant="outline" className="w-full">Configurar</Button>
                </div>

                <div className="p-6 bg-white border rounded-lg shadow-sm space-y-4">
                    <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <Share2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg">Redes Sociais</h3>
                    <p className="text-sm text-slate-500">Integração com Instagram e Facebook Pixel.</p>
                    <Button variant="outline" className="w-full">Conectar</Button>
                </div>
            </div>
        </div>
    );
}
