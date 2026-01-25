"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoriesList } from "./CategoriesList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createCategory } from "@/lib/actions/category";

export function CategoriesManager({ categories: initialCategories }: { categories: any[] }) {
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    // If implementing optimistic updates or re-fetching, we might need state for categories. 
    // For now, we rely on Server Actions revalidation (if implemented) or reload/refresh.
    // However, CategoriesList takes 'categories' prop. If we add one, we might want to see it instantly.
    // Assuming createCategory revalidates path, router.refresh() might be needed if we don't manage state.
    // But for "Check everything" simpler is safer. Use the props.

    async function handleCreateCategory(formData: FormData) {
        setIsCreatingCategory(true);
        try {
            const res = await createCategory(formData);
            if (res.success) {
                setIsCategoryDialogOpen(false);
                // Ideally trigger a refresh
                window.location.reload();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao criar categoria");
        } finally {
            setIsCreatingCategory(false);
        }
    }

    return (
        <>
            <CategoriesList
                categories={initialCategories}
                onCreateClick={() => setIsCategoryDialogOpen(true)}
            />

            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <form action={handleCreateCategory} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome da Categoria</Label>
                            <Input name="name" placeholder="Ex: Maquiagem" required />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isCreatingCategory}>
                                {isCreatingCategory ? "Criando..." : "Criar Categoria"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
