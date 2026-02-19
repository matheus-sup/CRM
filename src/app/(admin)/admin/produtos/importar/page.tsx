"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importProducts } from "@/lib/actions/product";
import { Download, Upload, AlertCircle, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function ImportExportPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function handleUpload(formData: FormData) {
        setIsUploading(true);
        setMessage(null);

        const res = await importProducts(formData);

        setIsUploading(false);
        setMessage(res.message);
        if (res.success) {
            // Optional: redirect or just show success
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Importar & Exportar Produtos</h1>
                <p className="text-slate-600">
                    Gerencie seu catálogo em massa utilizando arquivos CSV (Excel).
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Export Section */}
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Download className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Exportar Catálogo</h2>
                        <p className="text-sm text-slate-500">
                            Baixe todos os seus produtos cadastrados em uma planilha.
                        </p>
                    </div>
                    <Button variant="outline" className="w-full gap-2" asChild>
                        <a href="/api/products/export" target="_blank">
                            <FileSpreadsheet className="h-4 w-4" />
                            Baixar CSV dos Produtos
                        </a>
                    </Button>
                </div>

                {/* Import Section */}
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <Upload className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Importar Produtos</h2>
                        <p className="text-sm text-slate-500">
                            Cadastre novos produtos ou atualize o estoque enviando uma planilha.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm space-y-2">
                        <div className="font-semibold text-slate-700 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Dica Importante:
                        </div>
                        <p className="text-slate-600">
                            Para evitar erros, utilize o <strong>Modelo Padrão</strong>. O sistema usa <code>;</code> (ponto e vírgula) como separador, ideal para Excel em Português.
                        </p>
                        <a href="/api/products/template" target="_blank" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                            <Download className="h-3 w-3" /> Baixar Modelo Vazio
                        </a>
                    </div>

                    <form action={handleUpload} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="file">Selecione o arquivo CSV</Label>
                            <Input id="file" name="file" type="file" accept=".csv" required />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isUploading}>
                            {isUploading ? "Processando..." : "Enviar e Importar"}
                        </Button>
                        {message && (
                            <div className={`p-3 rounded text-sm font-medium text-center ${message.includes("Erro") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
