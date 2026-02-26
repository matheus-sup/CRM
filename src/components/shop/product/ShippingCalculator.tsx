"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import { calculateShipping } from "@/lib/actions/shipping-calculator"; // I will create this
import { cn } from "@/lib/utils";

interface ShippingCalculatorProps {
    productId: string;
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    btnStyle?: "rounded" | "pill" | "square";
    iconColor?: string;
}

export function ShippingCalculator({ productId, weight, length, width, height, btnStyle = "rounded", iconColor }: ShippingCalculatorProps) {
    const [cep, setCep] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any[] | null>(null);
    const [error, setError] = useState("");

    const handleCalculate = async () => {
        if (cep.length < 8) {
            setError("CEP inválido");
            return;
        }
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await calculateShipping(cep, { weight, length, width, height });
            if (data.error) {
                setError(data.error);
            } else {
                setResult(data.quotes);
            }
        } catch (e) {
            setError("Erro ao calcular frete");
        } finally {
            setLoading(false);
        }
    };

    const btnRoundedClass = btnStyle === "pill" ? "rounded-full" : btnStyle === "square" ? "rounded-none" : "rounded-lg";

    return (
        <div className={cn("border p-4 space-y-4 bg-slate-50", btnRoundedClass)}>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Truck className="h-5 w-5" style={{ color: iconColor }} />
                <span>Calcular Frete</span>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Seu CEP"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className={cn("bg-white", btnRoundedClass)}
                />
                <Button onClick={handleCalculate} disabled={loading} className={btnRoundedClass}>
                    {loading ? "..." : "OK"}
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            {result && result.length > 0 && (
                <div className="space-y-2 mt-2">
                    {result.map((quote, idx) => (
                        <div key={idx} className={cn("flex justify-between items-center bg-white p-2 border text-sm", btnRoundedClass)}>
                            <div className="flex items-center gap-2">
                                {/* <img src={quote.company.picture} className="h-6 w-auto" /> // If available */}
                                <div>
                                    <p className="font-semibold">{quote.name}</p>
                                    <p className="text-xs text-slate-500">{quote.delivery_time} dias úteis</p>
                                </div>
                            </div>
                            <span className="font-bold text-green-700">R$ {quote.price}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
