"use client";

import { useRef, useEffect, useState } from "react";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Minus,
    Undo,
    Redo,
    Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
    name?: string;
}

export function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Escreva o conteúdo aqui...",
    className,
    name,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [html, setHtml] = useState(value);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        updateContent();
        editorRef.current?.focus();
    };

    const updateContent = () => {
        if (editorRef.current) {
            const newHtml = editorRef.current.innerHTML;
            setHtml(newHtml);
            onChange?.(newHtml);
        }
    };

    const insertLink = () => {
        const url = prompt("Digite a URL do link:", "https://");
        if (url) {
            execCommand("createLink", url);
        }
    };

    const insertImage = () => {
        const url = prompt("Digite a URL da imagem:", "https://");
        if (url) {
            execCommand("insertImage", url);
        }
    };

    const ToolbarButton = ({
        onClick,
        icon: Icon,
        title,
        active,
    }: {
        onClick: () => void;
        icon: any;
        title: string;
        active?: boolean;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "p-2 rounded hover:bg-slate-100 transition-colors",
                active && "bg-slate-200"
            )}
        >
            <Icon className="h-4 w-4" />
        </button>
    );

    const ToolbarDivider = () => (
        <div className="w-px h-6 bg-slate-200 mx-1" />
    );

    return (
        <div className={cn("border rounded-lg overflow-hidden bg-white", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 bg-slate-50 border-b">
                {/* Text Style */}
                <ToolbarButton onClick={() => execCommand("bold")} icon={Bold} title="Negrito (Ctrl+B)" />
                <ToolbarButton onClick={() => execCommand("italic")} icon={Italic} title="Itálico (Ctrl+I)" />
                <ToolbarButton onClick={() => execCommand("underline")} icon={Underline} title="Sublinhado (Ctrl+U)" />

                <ToolbarDivider />

                {/* Headings */}
                <ToolbarButton onClick={() => execCommand("formatBlock", "h1")} icon={Heading1} title="Título 1" />
                <ToolbarButton onClick={() => execCommand("formatBlock", "h2")} icon={Heading2} title="Título 2" />
                <ToolbarButton onClick={() => execCommand("formatBlock", "h3")} icon={Heading3} title="Título 3" />
                <ToolbarButton onClick={() => execCommand("formatBlock", "p")} icon={Type} title="Parágrafo" />

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={List} title="Lista com marcadores" />
                <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={ListOrdered} title="Lista numerada" />
                <ToolbarButton onClick={() => execCommand("formatBlock", "blockquote")} icon={Quote} title="Citação" />

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarButton onClick={() => execCommand("justifyLeft")} icon={AlignLeft} title="Alinhar à esquerda" />
                <ToolbarButton onClick={() => execCommand("justifyCenter")} icon={AlignCenter} title="Centralizar" />
                <ToolbarButton onClick={() => execCommand("justifyRight")} icon={AlignRight} title="Alinhar à direita" />

                <ToolbarDivider />

                {/* Insert */}
                <ToolbarButton onClick={insertLink} icon={LinkIcon} title="Inserir link" />
                <ToolbarButton onClick={insertImage} icon={Image} title="Inserir imagem" />
                <ToolbarButton onClick={() => execCommand("insertHorizontalRule")} icon={Minus} title="Linha horizontal" />

                <ToolbarDivider />

                {/* History */}
                <ToolbarButton onClick={() => execCommand("undo")} icon={Undo} title="Desfazer (Ctrl+Z)" />
                <ToolbarButton onClick={() => execCommand("redo")} icon={Redo} title="Refazer (Ctrl+Y)" />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                className="rich-text-editor min-h-[300px] p-4 focus:outline-none"
                onInput={updateContent}
                onBlur={updateContent}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={html} />}
        </div>
    );
}
