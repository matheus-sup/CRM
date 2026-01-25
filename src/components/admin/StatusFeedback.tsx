"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StatusFeedbackProps {
    status: "idle" | "success" | "error";
    successMessage?: string;
    errorMessage?: string;
    onReset?: () => void;
}

export function StatusFeedback({
    status,
    successMessage = "SALVO",
    errorMessage = "Erro ao salvar",
    onReset
}: StatusFeedbackProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (status === "success" || status === "error") {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onReset) setTimeout(onReset, 300); // Wait for fade out
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [status, onReset]);

    if (status === "idle" && !isVisible) return null;

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm transition-all duration-500 transform",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            status === "success" ? "bg-green-100 text-green-700 border border-green-200" :
                status === "error" ? "bg-red-100 text-red-700 border border-red-200" : ""
        )}>
            {status === "success" && (
                <>
                    <CheckCircle2 className="h-4 w-4 animate-in zoom-in spin-in-90 duration-300" />
                    <span>{successMessage}</span>
                </>
            )}
            {status === "error" && (
                <>
                    <XCircle className="h-4 w-4 animate-in zoom-in shake duration-300" />
                    <span>{errorMessage}</span>
                </>
            )}
        </div>
    );
}
