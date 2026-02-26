"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ruler } from "lucide-react";

interface Measurement {
    id: string;
    title: string;
    value: string;
    unit: string;
}

interface MeasurementsGuideProps {
    measurements: string;
}

export function MeasurementsGuide({ measurements }: MeasurementsGuideProps) {
    const [open, setOpen] = useState(false);

    let parsedMeasurements: Measurement[] = [];
    try {
        parsedMeasurements = JSON.parse(measurements);
    } catch {
        return null;
    }

    if (!Array.isArray(parsedMeasurements) || parsedMeasurements.length === 0) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                    <Ruler className="h-4 w-4" />
                    Guia de Medidas
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ruler className="h-5 w-5" />
                        Guia de Medidas
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-1">
                    <table className="w-full">
                        <tbody className="divide-y">
                            {parsedMeasurements.map((m) => (
                                <tr key={m.id}>
                                    <td className="py-3 font-medium text-slate-900">{m.title}</td>
                                    <td className="py-3 text-right text-slate-600">
                                        {m.value} {m.unit}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    As medidas podem variar levemente. Em caso de dúvidas, entre em contato conosco.
                </p>
            </DialogContent>
        </Dialog>
    );
}
