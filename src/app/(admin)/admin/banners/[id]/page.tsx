import { prisma } from "@/lib/prisma";
import BannerEditForm from "@/components/admin/BannerEditForm";
import { notFound } from "next/navigation";

export default async function EditBannerPage({ params }: { params: { id: string } }) {
    const banner = await prisma.banner.findUnique({
        where: { id: params.id }
    });

    if (!banner) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Editar Banner</h1>
            </div>

            <BannerEditForm banner={banner} />
        </div>
    );
}
