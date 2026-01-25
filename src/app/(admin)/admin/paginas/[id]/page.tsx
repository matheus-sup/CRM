import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageEditor } from "./PageEditor";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const page = await prisma.page.findUnique({
        where: { id }
    });

    if (!page) {
        notFound();
    }

    return <PageEditor page={page} />;
}
