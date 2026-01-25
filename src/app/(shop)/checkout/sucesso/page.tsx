"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get("orderCode");
    const paymentMethod = searchParams.get("method");
    const pixCode = searchParams.get("pixCode"); // In a real app, fetch order details to be secure

    // Demo: Retrieve Pix payload from URL or State (simplified for prototype)
    const [copied, setCopied] = useState(false);

    const copyPix = () => {
        if (pixCode) {
            navigator.clipboard.writeText(pixCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center max-w-lg">
            <div className="bg-green-100 p-6 rounded-full mb-6 text-green-600">
                <CheckCircle2 className="h-16 w-16" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">Pedido Recebido!</h1>
            <p className="text-slate-600 mb-8">
                Obrigado pela compra. Seu pedido <span className="font-bold text-slate-800">#{orderCode}</span> foi gerado com sucesso.
            </p>

            {paymentMethod === 'pix' && pixCode && (
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 w-full mb-8 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Pagamento via PIX</h3>

                    <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 mb-4 flex items-center justify-center h-48">
                        {/* Placeholder for QR Image */}
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixCode)}`} alt="QR Code Pix" />
                    </div>

                    <div className="relative">
                        <textarea
                            readOnly
                            className="w-full bg-slate-50 border rounded-lg p-3 text-xs text-slate-500 h-24 resize-none focus:outline-none"
                            value={pixCode}
                        />
                        <Button
                            className="absolute bottom-2 right-2 h-8 text-xs"
                            size="sm"
                            onClick={copyPix}
                        >
                            <Copy className="h-3 w-3 mr-1" /> {copied ? "Copiado!" : "Copiar"}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Escaneie o QR Code ou copie o código para pagar no seu app de banco.
                    </p>
                </div>
            )}

            <div className="flex gap-4">
                <Link href="/">
                    <Button variant="outline">Voltar para a Loja</Button>
                </Link>
                <Link href="/admin/pedidos">
                    <Button>Acompanhar Pedido</Button>
                </Link>
            </div>
        </div>
    );
}
