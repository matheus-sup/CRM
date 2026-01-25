"use client";

import { useFormStatus } from "react-dom";
import { createBanner } from "@/lib/actions/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePicker } from "@/components/admin/media/ImagePicker";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Criar Banner"}
        </Button>
    );
}

export default function NewBannerPage() {
    const router = useRouter();
    const [imageUrl, setImageUrl] = useState("");
    const [mobileUrl, setMobileUrl] = useState("");

    async function handleSubmit(formData: FormData) {
        const result = await createBanner(formData);
        if (result.success) {
            toast.success("Banner criado com sucesso!");
            router.push("/admin/site"); // Redirect back to Site CMS
        } else {
            toast.error(result.error);
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Novo Banner</h1>
                <Link href="/admin/site">
                    <Button variant="outline">Voltar</Button>
                </Link>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="label">Título / Identificação</Label>
                            <Input id="label" name="label" placeholder="Ex: Promoção de Verão" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Imagem Desktop</Label>
                            <ImagePicker
                                value={imageUrl}
                                onChange={setImageUrl}
                                label="Selecionar Banner Desktop"
                            />
                            <input type="hidden" name="imageUrl" value={imageUrl} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Imagem Mobile</Label>
                            <ImagePicker
                                value={mobileUrl}
                                onChange={setMobileUrl}
                                label="Selecionar Banner Mobile (Opcional)"
                            />
                            <input type="hidden" name="mobileUrl" value={mobileUrl} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Link de Destino</Label>
                            <Input id="link" name="link" placeholder="/categoria/perfumes" />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="active" name="active" defaultChecked />
                            <Label htmlFor="active">Ativo</Label>
                        </div>

                        <div className="pt-4">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
