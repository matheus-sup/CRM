"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  Loader2,
  MessageCircle,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createDeliveryOrder } from "@/lib/actions/delivery";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  isAvailable: boolean;
  customizations: any[];
  extras: any[];
};

type Category = {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
};

type Zone = {
  id: string;
  name: string;
  neighborhoods: string[];
  deliveryFee: number;
  freeDeliveryMin: number | null;
  estimatedTime: number;
};

type CartItem = {
  id: string;
  item: MenuItem;
  quantity: number;
  customizations: any[];
  notes: string;
};

type Props = {
  settings: any;
  categories: Category[];
  zones: Zone[];
};

export function CardapioClient({ settings, categories, zones }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id || null
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showItemModal, setShowItemModal] = useState<MenuItem | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Checkout form
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    cpf: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    reference: "",
    paymentMethod: "pix",
    changeFor: "",
    notes: "",
  });

  // Selected customizations for item modal
  const [selectedCustomizations, setSelectedCustomizations] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const primaryColor = settings.primaryColor || "#ef4444";

  // Filter items by search
  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.isAvailable &&
          (searchQuery === "" ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => {
    let itemTotal = item.item.price * item.quantity;
    item.customizations.forEach((c) => {
      itemTotal += c.price * item.quantity;
    });
    return sum + itemTotal;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Get delivery fee based on neighborhood
  const selectedZone = zones.find((z) =>
    z.neighborhoods.some(
      (n) => n.toLowerCase() === checkoutForm.neighborhood.toLowerCase()
    )
  );
  const deliveryFee =
    selectedZone && cartTotal >= (selectedZone.freeDeliveryMin || Infinity)
      ? 0
      : selectedZone?.deliveryFee || 0;

  const orderTotal = cartTotal + deliveryFee;

  // Scroll to category
  function scrollToCategory(catId: string) {
    setActiveCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Add to cart
  function addToCart(item: MenuItem) {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      item,
      quantity: selectedQuantity,
      customizations: selectedCustomizations,
      notes: itemNotes,
    };
    setCart([...cart, cartItem]);
    setShowItemModal(null);
    setSelectedQuantity(1);
    setItemNotes("");
    setSelectedCustomizations([]);
  }

  // Toggle customization selection
  function toggleCustomization(custom: any) {
    const exists = selectedCustomizations.find((c) => c.name === custom.name);
    if (exists) {
      setSelectedCustomizations(selectedCustomizations.filter((c) => c.name !== custom.name));
    } else {
      setSelectedCustomizations([...selectedCustomizations, custom]);
    }
  }

  // Calculate item total with customizations
  function getItemTotal(item: MenuItem) {
    let total = item.price * selectedQuantity;
    selectedCustomizations.forEach((c) => {
      total += (c.price || 0) * selectedQuantity;
    });
    return total;
  }

  // Update cart item quantity
  function updateCartItemQuantity(id: string, delta: number) {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove from cart
  function removeFromCart(id: string) {
    setCart(cart.filter((item) => item.id !== id));
  }

  // Submit order
  async function handleSubmitOrder() {
    if (!checkoutForm.name || !checkoutForm.cpf || !checkoutForm.phone || !checkoutForm.street || !checkoutForm.number || !checkoutForm.neighborhood) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    // Validate CPF format
    const cpfClean = checkoutForm.cpf.replace(/\D/g, "");
    if (cpfClean.length !== 11) {
      alert("CPF inválido");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createDeliveryOrder({
        customerName: checkoutForm.name,
        customerPhone: checkoutForm.phone,
        customerDocument: checkoutForm.cpf,
        addressStreet: checkoutForm.street,
        addressNumber: checkoutForm.number,
        addressComplement: checkoutForm.complement,
        addressNeighborhood: checkoutForm.neighborhood,
        addressCity: settings.storeCity || "Cidade",
        addressState: settings.storeState || "Estado",
        addressZipCode: "",
        addressReference: checkoutForm.reference,
        items: cart.map((c) => ({
          productId: c.item.id,
          name: c.item.name,
          description: c.item.description || undefined,
          imageUrl: c.item.imageUrl || undefined,
          price: c.item.price,
          quantity: c.quantity,
          customizations: c.customizations,
          notes: c.notes || undefined,
        })),
        paymentMethod: checkoutForm.paymentMethod,
        changeFor: checkoutForm.changeFor ? parseFloat(checkoutForm.changeFor) : undefined,
        customerNotes: checkoutForm.notes || undefined,
      });

      setOrderSuccess(order.code);
      setCart([]);
      setShowCheckout(false);
      setCheckoutForm({
        name: "",
        cpf: "",
        phone: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        reference: "",
        paymentMethod: "pix",
        changeFor: "",
        notes: "",
      });
    } catch (error: any) {
      alert(error.message || "Erro ao fazer pedido");
    } finally {
      setSubmitting(false);
    }
  }

  // Closed overlay
  if (!settings.isOpen) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Estamos Fechados</h1>
          <p className="text-slate-400 mb-4">
            {settings.pauseReason || "Voltamos em breve!"}
          </p>
          {settings.storeWhatsapp && (
            <a
              href={`https://wa.me/55${settings.storeWhatsapp.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Fale conosco
            </a>
          )}
        </div>
      </div>
    );
  }

  // Order success
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-slate-500 mb-4">Seu pedido foi recebido com sucesso.</p>
          <div
            className="inline-block px-6 py-3 rounded-xl text-2xl font-bold mb-6"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            {orderSuccess}
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Guarde este código para acompanhar seu pedido
          </p>
          <button
            onClick={() => setOrderSuccess(null)}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Fazer Novo Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bg-white shadow-sm"
        style={{ borderBottom: `3px solid ${primaryColor}` }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.storeLogo ? (
                <img
                  src={settings.storeLogo}
                  alt={settings.storeName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {settings.storeName?.charAt(0) || "R"}
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg">{settings.storeName}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {settings.avgPrepTime}-{settings.avgPrepTime + 15} min
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-green-600 font-medium">Aberto</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-full"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <ShoppingBag className="w-6 h-6" style={{ color: primaryColor }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2"
              style={{ focusRing: primaryColor } as any}
            />
          </div>
        </div>

        {/* Categories Nav */}
        <div className="border-t">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    activeCategory === cat.id
                      ? "text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  style={{
                    backgroundColor: activeCategory === cat.id ? primaryColor : undefined,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      {settings.storeBanner && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <img
            src={settings.storeBanner}
            alt="Banner"
            className="w-full h-40 md:h-56 object-cover rounded-2xl"
          />
        </div>
      )}

      {/* Menu Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Nenhum item encontrado</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((cat) => (
              <section
                key={cat.id}
                ref={(el) => { categoryRefs.current[cat.id] = el; }}
                className="scroll-mt-40"
              >
                <h2 className="text-xl font-bold mb-4">{cat.name}</h2>
                {cat.description && (
                  <p className="text-slate-500 text-sm mb-4">{cat.description}</p>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setShowItemModal(item)}
                      className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          {item.compareAtPrice && (
                            <span className="text-sm text-slate-400 line-through">
                              R$ {item.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                          <span
                            className="font-bold"
                            style={{ color: primaryColor }}
                          >
                            R$ {item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-4 left-4 right-4 max-w-5xl mx-auto z-30">
          <button
            onClick={() => setShowCart(true)}
            className="w-full py-4 rounded-2xl text-white font-semibold flex items-center justify-between px-6 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Ver Carrinho
            </span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowItemModal(null)}
          />
          <div className="relative bg-white w-full max-w-lg md:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
            {showItemModal.imageUrl && (
              <img
                src={showItemModal.imageUrl}
                alt={showItemModal.name}
                className="w-full h-48 md:h-64 object-cover md:rounded-t-2xl"
              />
            )}
            <button
              onClick={() => setShowItemModal(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{showItemModal.name}</h2>
              {showItemModal.description && (
                <p className="text-slate-500 mb-4">{showItemModal.description}</p>
              )}
              <div className="flex items-center gap-2 mb-6">
                {showItemModal.compareAtPrice && (
                  <span className="text-slate-400 line-through">
                    R$ {showItemModal.compareAtPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                  R$ {showItemModal.price.toFixed(2)}
                </span>
              </div>

              {/* Extras / Adicionais */}
              {showItemModal.extras && showItemModal.extras.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Adicionais</h3>
                  <div className="space-y-2">
                    {showItemModal.extras.map((extra: any, idx: number) => {
                      const isSelected = selectedCustomizations.some((c) => c.name === extra.name);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleCustomization(extra)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 border-2 rounded-xl transition-all",
                            isSelected ? "border-current bg-opacity-10" : "border-slate-200"
                          )}
                          style={{
                            borderColor: isSelected ? primaryColor : undefined,
                            backgroundColor: isSelected ? `${primaryColor}10` : undefined,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center",
                                isSelected ? "border-current" : "border-slate-300"
                              )}
                              style={{ borderColor: isSelected ? primaryColor : undefined }}
                            >
                              {isSelected && (
                                <CheckCircle className="w-4 h-4" style={{ color: primaryColor }} />
                              )}
                            </div>
                            <span className="font-medium">{extra.name}</span>
                          </div>
                          <span className="font-semibold" style={{ color: primaryColor }}>
                            + R$ {(extra.price || 0).toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customizations / Opções */}
              {showItemModal.customizations && showItemModal.customizations.length > 0 && (
                <div className="mb-6">
                  {showItemModal.customizations.map((group: any, groupIdx: number) => (
                    <div key={groupIdx} className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{group.name}</h3>
                        {group.required && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                            Obrigatório
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {group.options?.map((option: any, optIdx: number) => {
                          const isSelected = selectedCustomizations.some(
                            (c) => c.name === `${group.name}: ${option.name}`
                          );
                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                toggleCustomization({
                                  name: `${group.name}: ${option.name}`,
                                  price: option.price || 0,
                                })
                              }
                              className={cn(
                                "w-full flex items-center justify-between p-3 border-2 rounded-xl transition-all",
                                isSelected ? "border-current" : "border-slate-200"
                              )}
                              style={{
                                borderColor: isSelected ? primaryColor : undefined,
                                backgroundColor: isSelected ? `${primaryColor}10` : undefined,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    isSelected ? "border-current" : "border-slate-300"
                                  )}
                                  style={{ borderColor: isSelected ? primaryColor : undefined }}
                                >
                                  {isSelected && (
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: primaryColor }}
                                    />
                                  )}
                                </div>
                                <span className="font-medium">{option.name}</span>
                              </div>
                              {option.price > 0 && (
                                <span className="font-semibold" style={{ color: primaryColor }}>
                                  + R$ {option.price.toFixed(2)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Alguma observação?
                </label>
                <textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Ex: Sem cebola, bem passado..."
                  className="w-full p-3 border rounded-xl resize-none"
                  rows={2}
                />
              </div>

              {/* Quantity & Add */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 border rounded-xl p-1">
                  <button
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {selectedQuantity}
                  </span>
                  <button
                    onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => addToCart(showItemModal)}
                  className="flex-1 py-4 rounded-xl text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  Adicionar R$ {getItemTotal(showItemModal).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCart(false)}
          />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Seu Pedido</h2>
              <button onClick={() => setShowCart(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4">
                  {cart.map((cartItem) => (
                    <div
                      key={cartItem.id}
                      className="flex gap-3 p-3 bg-slate-50 rounded-xl"
                    >
                      {cartItem.item.imageUrl && (
                        <img
                          src={cartItem.item.imageUrl}
                          alt={cartItem.item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{cartItem.item.name}</h4>
                        {cartItem.notes && (
                          <p className="text-xs text-slate-500">{cartItem.notes}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateCartItemQuantity(cartItem.id, -1)
                              }
                              className="w-7 h-7 flex items-center justify-center bg-white border rounded-lg"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium">{cartItem.quantity}</span>
                            <button
                              onClick={() =>
                                updateCartItemQuantity(cartItem.id, 1)
                              }
                              className="w-7 h-7 flex items-center justify-center bg-white border rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-semibold">
                            R$ {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(cartItem.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="border-t p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span style={{ color: primaryColor }}>
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="p-4">
                  <button
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                    className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Continuar
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <div className="max-w-lg mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Finalizar Pedido</h2>
              <button onClick={() => setShowCheckout(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold mb-3">Seus Dados</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={checkoutForm.name}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, name: e.target.value })
                    }
                    placeholder="Nome completo *"
                    className="w-full p-3 border rounded-xl"
                  />
                  <input
                    type="text"
                    value={checkoutForm.cpf}
                    onChange={(e) => {
                      // Format CPF: 000.000.000-00
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 11) value = value.slice(0, 11);
                      if (value.length > 9) {
                        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
                      } else if (value.length > 6) {
                        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
                      } else if (value.length > 3) {
                        value = `${value.slice(0, 3)}.${value.slice(3)}`;
                      }
                      setCheckoutForm({ ...checkoutForm, cpf: value });
                    }}
                    placeholder="CPF *"
                    className="w-full p-3 border rounded-xl"
                  />
                  <input
                    type="tel"
                    value={checkoutForm.phone}
                    onChange={(e) => {
                      // Format phone: (00) 00000-0000
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 11) value = value.slice(0, 11);
                      if (value.length > 6) {
                        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
                      } else if (value.length > 2) {
                        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                      }
                      setCheckoutForm({ ...checkoutForm, phone: value });
                    }}
                    placeholder="WhatsApp *"
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={checkoutForm.street}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, street: e.target.value })
                    }
                    placeholder="Rua *"
                    className="w-full p-3 border rounded-xl"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={checkoutForm.number}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, number: e.target.value })
                      }
                      placeholder="Número *"
                      className="p-3 border rounded-xl"
                    />
                    <input
                      type="text"
                      value={checkoutForm.complement}
                      onChange={(e) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          complement: e.target.value,
                        })
                      }
                      placeholder="Compl."
                      className="col-span-2 p-3 border rounded-xl"
                    />
                  </div>
                  <select
                    value={checkoutForm.neighborhood}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        neighborhood: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-xl"
                  >
                    <option value="">Selecione o bairro *</option>
                    {zones.flatMap((z) =>
                      z.neighborhoods.map((n) => (
                        <option key={n} value={n}>
                          {n} - R$ {z.deliveryFee.toFixed(2)}
                          {z.freeDeliveryMin
                            ? ` (grátis acima de R$${z.freeDeliveryMin})`
                            : ""}
                        </option>
                      ))
                    )}
                  </select>
                  <input
                    type="text"
                    value={checkoutForm.reference}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        reference: e.target.value,
                      })
                    }
                    placeholder="Ponto de referência"
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="font-semibold mb-3">Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "pix", label: "Pix", icon: QrCode },
                    { value: "credit", label: "Crédito", icon: CreditCard },
                    { value: "debit", label: "Débito", icon: CreditCard },
                    { value: "cash", label: "Dinheiro", icon: Banknote },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() =>
                        setCheckoutForm({
                          ...checkoutForm,
                          paymentMethod: method.value,
                        })
                      }
                      className={cn(
                        "flex items-center gap-2 p-3 border-2 rounded-xl transition-colors",
                        checkoutForm.paymentMethod === method.value
                          ? "border-current"
                          : "border-slate-200"
                      )}
                      style={{
                        borderColor:
                          checkoutForm.paymentMethod === method.value
                            ? primaryColor
                            : undefined,
                        color:
                          checkoutForm.paymentMethod === method.value
                            ? primaryColor
                            : undefined,
                      }}
                    >
                      <method.icon className="w-5 h-5" />
                      {method.label}
                    </button>
                  ))}
                </div>

                {checkoutForm.paymentMethod === "cash" && settings.acceptCashChange && (
                  <input
                    type="number"
                    value={checkoutForm.changeFor}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        changeFor: e.target.value,
                      })
                    }
                    placeholder="Troco para quanto? (opcional)"
                    className="w-full p-3 border rounded-xl mt-3"
                  />
                )}
              </div>

              {/* Notes */}
              <div>
                <textarea
                  value={checkoutForm.notes}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, notes: e.target.value })
                  }
                  placeholder="Observações do pedido (opcional)"
                  className="w-full p-3 border rounded-xl resize-none"
                  rows={2}
                />
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">Grátis</span>
                    ) : (
                      `R$ ${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span style={{ color: primaryColor }}>
                    R$ {orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Confirmar Pedido
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
