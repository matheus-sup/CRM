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

    const categories = await (prisma as any).category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    });


    if (!menu) {
        notFound();
    }

    return <MenuEditor menu={menu} categories={categories} />;
}
