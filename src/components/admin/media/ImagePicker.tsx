"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaLibrary } from "./MediaLibrary";

interface ImagePickerProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    copyrightVal?: string;
    onCopyrightChange?: (val: string) => void;
}

export function ImagePicker({ value, onChange, label = "Imagem", copyrightVal, onCopyrightChange }: ImagePickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (media: any) => {
        onChange(media.url);
        if (onCopyrightChange && media.copyright) {
            onCopyrightChange(media.copyright);
        }
        setOpen(false);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div className={cn(
                        "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-slate-50 min-h-[150px]",
                        value ? "border-solid border-slate-200 p-0 overflow-hidden relative group" : "border-slate-300 text-slate-400"
                    )}>
                        {value ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={value} alt="Preview" className="w-full h-40 object-contain bg-slate-50" />

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="secondary" size="sm" type="button">Trocar Imagem</Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange("");
                                        }}
                                    >
                                        Remover
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="h-8 w-8 opacity-50" />
                                <span className="text-sm font-medium">Clique para escolher uma imagem</span>
                            </>
                        )}
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] h-[80vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle>Galeria de Mídia</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                        <MediaLibrary onSelect={handleSelect} selectedUrl={value} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Copyright Display/Edit below the picker */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Direitos / Créditos (HTML permitido)</Label>
                <Input
                    value={copyrightVal || ""}
                    onChange={(e) => onCopyrightChange && onCopyrightChange(e.target.value)}
                    placeholder="Ex: Imagem por <a href='...'>Freepik</a>"
                    className="h-8 text-xs bg-slate-50"
                />
            </div>
        </div>
    );
}
