import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { Card, CardContent } from "@/components/ui/card";

export default function MediaPage() {
    return (
        <div className="h-full p-6 space-y-6 flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Galeria de Mídia</h1>
            <p className="text-muted-foreground">Gerencie todas as imagens e arquivos de mídia do seu site.</p>

            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardContent className="flex-1 p-0 flex flex-col">
                    <div className="p-6 h-full flex flex-col">
                        <MediaLibrary />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
