import { Suspense } from "react";
import { CardapioClient } from "./CardapioClient";
import { getDeliverySettings, getDeliveryCategories, getDeliveryZones } from "@/lib/actions/delivery";

export const dynamic = "force-dynamic";

export default async function CardapioPage() {
  const [settings, categories, zones] = await Promise.all([
    getDeliverySettings(),
    getDeliveryCategories(),
    getDeliveryZones(),
  ]);

  return (
    <Suspense fallback={<CardapioLoading />}>
      <CardapioClient
        settings={settings}
        categories={categories}
        zones={zones}
      />
    </Suspense>
  );
}

function CardapioLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>
  );
}
