import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MenuEditor } from "./MenuEditor";

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Cast to any to bypass potential type mismatch during dev
    const menu = await (prisma as any).menu.findUnique({
        where: { id },
        include: {
            items: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!menu) {
        notFound();
    }

    return <MenuEditor menu={menu} />;
}
