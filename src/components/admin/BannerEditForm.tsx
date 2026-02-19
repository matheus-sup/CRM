"use client";

import { useFormStatus } from "react-dom";
import { updateBanner } from "@/lib/actions/banner";
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
            {pending ? "Salvando..." : "Salvar Alterações"}
        </Button>
    );
}

export default function BannerEditForm({ banner }: { banner: any }) {
    const router = useRouter();
    const [id] = useState(banner.id);
    const [imageUrl, setImageUrl] = useState(banner.imageUrl || "");
    const [mobileUrl, setMobileUrl] = useState(banner.mobileUrl || "");

    async function handleSubmit(formData: FormData) {
        const result = await updateBanner(id, formData);
        if (result.success) {
            toast.success("Banner atualizado!");
            router.push("/admin/site"); // Redirect back to CMS Site which now holds banners
            router.refresh();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="label">Título / Identificação</Label>
                        <Input id="label" name="label" defaultValue={banner.label || ""} required />
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
                        <Input id="link" name="link" defaultValue={banner.link || ""} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="active" name="active" defaultChecked={banner.active} />
                        <Label htmlFor="active">Ativo</Label>
                    </div>

                    <div className="pt-4 flex gap-2">
                        <SubmitButton />
                        <Link href="/admin/site">
                            <Button variant="outline" type="button">Cancelar</Button>
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
