"use client";

import { Search, ShoppingBag, Clock } from "lucide-react";

interface DeliveryMenuItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  isAvailable: boolean;
  extras: any[];
}

interface DeliveryCategory {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  items: DeliveryMenuItem[];
}

interface CardapioPreviewProps {
  config: any;
  deliveryCategories?: DeliveryCategory[];
}

export function CardapioPreview({ config, deliveryCategories = [] }: CardapioPreviewProps) {
  const primaryColor = config?.themeColor || "#ef4444";
  const secondaryColor = config?.secondaryColor || "#fef2f2";
  const backgroundColor = config?.backgroundColor || "#f8fafc";
  const headerColor = config?.headerColor || primaryColor;
  const headingColor = config?.headingColor || "#18181b";
  const bodyColor = config?.bodyColor || "#52525b";
  const storeName = config?.storeName || "Meu Restaurante";
  const storeLogo = config?.logoUrl;

  // Check if header is light
  const isLightHeader = headerColor === "#ffffff" || headerColor === "#fff" || headerColor?.toLowerCase() === "white";
  const headerTextColor = isLightHeader ? headingColor : "#ffffff";
  const headerSubtextColor = isLightHeader ? "#64748b" : "rgba(255,255,255,0.7)";

  // Use real data or fallback to mock
  const hasRealData = deliveryCategories.length > 0;

  const displayCategories = hasRealData
    ? deliveryCategories.map(cat => ({ id: cat.id, name: cat.name }))
    : [
        { id: "1", name: "🍔 Lanches" },
        { id: "2", name: "🍟 Combos" },
        { id: "3", name: "🥤 Bebidas" },
        { id: "4", name: "🍰 Sobremesas" },
      ];

  // Calculate total items for cart preview
  const totalItems = hasRealData
    ? deliveryCategories.reduce((acc, cat) => acc + cat.items.length, 0)
    : 3;

  return (
    <div className="min-h-screen" style={{ backgroundColor }} data-section="home">
      {/* Header */}
      <header
        data-section="header"
        className="sticky top-0 z-40 shadow-sm"
        style={{
          backgroundColor: headerColor,
          borderBottom: `3px solid ${primaryColor}`
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {storeName?.charAt(0) || "R"}
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg" style={{ color: headerTextColor }} data-field="storeName">{storeName}</h1>
                <div className="flex items-center gap-2 text-xs" style={{ color: headerSubtextColor }}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    30-45 min
                  </span>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: isLightHeader ? "#cbd5e1" : "rgba(255,255,255,0.4)" }} />
                  <span className="font-medium" style={{ color: "#22c55e" }}>Aberto</span>
                </div>
              </div>
            </div>

            <button
              className="relative p-3 rounded-full"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <ShoppingBag className="w-6 h-6" style={{ color: primaryColor }} />
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                2
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white/80 focus:outline-none"
              disabled
            />
          </div>
        </div>

        {/* Categories Nav */}
        <div className="border-t" style={{ borderColor: isLightHeader ? "#e2e8f0" : "rgba(255,255,255,0.1)" }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
              {displayCategories.map((cat, idx) => (
                <button
                  key={cat.id}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: idx === 0 ? primaryColor : (isLightHeader ? "#f1f5f9" : "rgba(255,255,255,0.1)"),
                    color: idx === 0 ? "#ffffff" : (isLightHeader ? "#475569" : "rgba(255,255,255,0.8)")
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Banner Placeholder */}
      {config?.bannerUrl && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <img
            src={config.bannerUrl}
            alt="Banner"
            className="w-full h-40 md:h-56 object-cover rounded-2xl"
          />
        </div>
      )}

      {/* Menu Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {hasRealData ? (
          // Render real delivery categories and items
          <div className="space-y-8">
            {deliveryCategories.map((category) => (
              <section key={category.id} className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4" style={{ color: headingColor }}>
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-sm mb-4" style={{ color: bodyColor }}>{category.description}</p>
                )}

                {category.items.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4">Nenhum item nesta categoria</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {category.items.filter(item => item.isAvailable).map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1" style={{ color: headingColor }}>
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm line-clamp-2 mb-2" style={{ color: bodyColor }}>
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            {item.compareAtPrice && (
                              <span className="text-sm text-slate-400 line-through">
                                R$ {item.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="font-bold" style={{ color: primaryColor }}>
                              R$ {item.price.toFixed(2)}
                            </span>
                          </div>
                          {item.extras && item.extras.length > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              Adicionais
                            </p>
                          )}
                        </div>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            🍽️
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          // Fallback to mock data when no real data
          <>
            <section className="scroll-mt-40">
              <h2 className="text-xl font-bold mb-4" style={{ color: headingColor }}>🍔 Lanches</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { id: "1", name: "X-Burger Especial", description: "Hambúrguer artesanal, queijo cheddar, alface, tomate e molho especial", price: 24.90 },
                  { id: "2", name: "X-Bacon Duplo", description: "Dois hambúrgueres, bacon crocante, queijo e cebola caramelizada", price: 32.90 },
                  { id: "3", name: "X-Frango Crocante", description: "Filé de frango empanado, salada, maionese de ervas", price: 26.90 },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1" style={{ color: headingColor }}>
                        {item.name}
                      </h3>
                      <p className="text-sm line-clamp-2 mb-2" style={{ color: bodyColor }}>
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: primaryColor }}>
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      🍔
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: headingColor }}>🥤 Bebidas</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1" style={{ color: headingColor }}>Coca-Cola 350ml</h3>
                    <p className="text-sm line-clamp-2 mb-2" style={{ color: bodyColor }}>Refrigerante gelado</p>
                    <span className="font-bold" style={{ color: primaryColor }}>R$ 6,00</span>
                  </div>
                  <div className="w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl" style={{ backgroundColor: secondaryColor }}>🥤</div>
                </div>
                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1" style={{ color: headingColor }}>Suco Natural</h3>
                    <p className="text-sm line-clamp-2 mb-2" style={{ color: bodyColor }}>Laranja, Limão ou Maracujá</p>
                    <span className="font-bold" style={{ color: primaryColor }}>R$ 8,00</span>
                  </div>
                  <div className="w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl" style={{ backgroundColor: secondaryColor }}>🧃</div>
                </div>
              </div>
            </section>

            {/* Empty state message */}
            <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <p className="text-amber-800 font-medium">
                Configure seu cardápio em Delivery Próprio
              </p>
              <p className="text-amber-600 text-sm mt-1">
                Os itens acima são apenas para visualização. Adicione categorias e produtos reais no painel de Delivery.
              </p>
            </div>
          </>
        )}
      </main>

      {/* Floating Cart Button */}
      <div className="fixed bottom-4 left-4 right-4 max-w-5xl mx-auto z-30 pointer-events-none">
        <div
          className="w-full py-4 rounded-2xl text-white font-semibold flex items-center justify-between px-6 shadow-lg"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Ver Carrinho
          </span>
          <span>R$ 57,80</span>
        </div>
      </div>

      {/* Footer */}
      <footer
        data-section="footer"
        className="mt-20 px-4 py-8"
        style={{ backgroundColor: config?.footerBg || "#18181b" }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="font-bold text-lg mb-2" style={{ color: config?.footerText || "#ffffff" }}>
            {storeName}
          </h3>
          <p className="text-sm mb-4" style={{ color: config?.footerText ? `${config.footerText}99` : "#a1a1aa" }}>
            O melhor sabor da cidade
          </p>
          <div className="flex justify-center gap-4 text-sm mb-4" style={{ color: config?.footerText ? `${config.footerText}99` : "#a1a1aa" }}>
            <span>📍 {config?.address || "Centro"}</span>
            <span>📞 {config?.whatsapp || "(11) 99999-9999"}</span>
            <span>⏰ 18h-23h</span>
          </div>
          <div className="flex justify-center gap-2">
            {["💳", "💵", "PIX"].map((p, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", color: config?.footerText || "#ffffff" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
