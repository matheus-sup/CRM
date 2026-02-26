"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Monitor, Smartphone, Glasses } from "lucide-react";
import { getLensModalData } from "@/lib/actions/lens";
import { cn } from "@/lib/utils";

interface LensType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  price: number;
  requiresThickness: boolean;
  requiresTreatment: boolean;
  thicknesses: LensThickness[];
}

interface LensThickness {
  id: string;
  name: string;
  index: string;
  description: string | null;
  sphericalRange: string | null;
  cylindricalRange: string | null;
  price: number;
  iconUrl: string | null;
}

interface LensTreatment {
  id: string;
  name: string;
  description: string | null;
  price: number;
  iconUrl: string | null;
  features: string[];
}

interface LensConfig {
  modalTitle: string;
  modalSubtitle: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBorderColor: string;
  cardHoverBorderColor: string;
  selectedBorderColor: string;
  priceColor: string;
  gradeDiscount: number;
  gradeDiscountLabel: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  variant?: string;
}

interface LensSelection {
  type: LensType | null;
  thickness: LensThickness | null;
  treatment: LensTreatment | null;
}

interface LensSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onAddToCart: (product: Product, lensData: LensSelection, totalPrice: number) => void;
}

type Step = "type" | "thickness" | "treatment" | "summary";

export function LensSelectionModal({
  open,
  onOpenChange,
  product,
  onAddToCart,
}: LensSelectionModalProps) {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("type");
  const [config, setConfig] = useState<LensConfig | null>(null);
  const [types, setTypes] = useState<LensType[]>([]);
  const [treatments, setTreatments] = useState<LensTreatment[]>([]);

  const [selection, setSelection] = useState<LensSelection>({
    type: null,
    thickness: null,
    treatment: null,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setStep("type");
      setSelection({ type: null, thickness: null, treatment: null });
    }
  }, [open]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getLensModalData();
      setConfig(data.config);
      setTypes(data.types);
      setTreatments(data.treatments);
    } catch (error) {
      console.error("Failed to load lens data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectType(type: LensType) {
    setSelection((prev) => ({ ...prev, type, thickness: null, treatment: null }));

    if (type.requiresThickness) {
      setStep("thickness");
    } else if (type.requiresTreatment) {
      setStep("treatment");
    } else {
      setStep("summary");
    }
  }

  function handleSelectThickness(thickness: LensThickness) {
    setSelection((prev) => ({ ...prev, thickness }));

    if (selection.type?.requiresTreatment) {
      setStep("treatment");
    } else {
      setStep("summary");
    }
  }

  function handleSelectTreatment(treatment: LensTreatment) {
    setSelection((prev) => ({ ...prev, treatment }));
    setStep("summary");
  }

  function handleBack() {
    if (step === "thickness") {
      setStep("type");
      setSelection((prev) => ({ ...prev, thickness: null, treatment: null }));
    } else if (step === "treatment") {
      if (selection.type?.requiresThickness) {
        setStep("thickness");
      } else {
        setStep("type");
      }
      setSelection((prev) => ({ ...prev, treatment: null }));
    } else if (step === "summary") {
      if (selection.type?.requiresTreatment) {
        setStep("treatment");
      } else if (selection.type?.requiresThickness) {
        setStep("thickness");
      } else {
        setStep("type");
      }
    }
  }

  function calculateTotal() {
    let total = product.price;
    if (selection.type) total += selection.type.price;
    if (selection.thickness) total += selection.thickness.price;
    if (selection.treatment) total += selection.treatment.price;
    return total;
  }

  function handleAddToCart() {
    onAddToCart(product, selection, calculateTotal());
    onOpenChange(false);
  }

  function formatPrice(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" showCloseButton={false}>
          <VisuallyHidden>
            <DialogTitle>Seleção de Lentes</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden p-0"
        showCloseButton={false}
        style={{
          backgroundColor: config?.backgroundColor || "#ffffff",
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Seleção de Lentes</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {step !== "type" ? (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full max-h-[calc(90vh-4rem)] overflow-hidden">
          {/* Left Panel - Product Info */}
          <div className="w-full md:w-2/5 p-6 bg-gray-50 flex flex-col items-center justify-center border-r">
            {product.image && (
              <div className="relative w-full aspect-video mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-center w-full">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              {product.variant && (
                <p className="text-gray-500 text-sm">{product.variant}</p>
              )}
              {selection.type && (
                <div className="mt-4 text-left space-y-1">
                  <p className="text-sm text-gray-600">
                    {selection.type.name}
                    {config?.gradeDiscountLabel && selection.type.slug === "grau" && (
                      <span className="ml-2 text-xs text-gray-500">
                        - {config.gradeDiscountLabel}
                      </span>
                    )}
                  </p>
                  {selection.thickness && (
                    <div className="flex justify-between text-sm">
                      <span>{selection.thickness.name}</span>
                      {selection.thickness.price > 0 && (
                        <span style={{ color: config?.priceColor }}>
                          +{formatPrice(selection.thickness.price)}
                        </span>
                      )}
                    </div>
                  )}
                  {selection.treatment && (
                    <div className="flex justify-between text-sm">
                      <span>{selection.treatment.name}</span>
                      {selection.treatment.price > 0 && (
                        <span style={{ color: config?.priceColor }}>
                          +{formatPrice(selection.treatment.price)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Selection Steps */}
          <div className="w-full md:w-3/5 p-6 overflow-y-auto">
            {/* Subtitle */}
            <p className="text-sm text-gray-500 mb-6">
              {config?.modalSubtitle ||
                'Fique tranquilo(a)! Sua receita pode ser enviada após a finalização do pedido. Por whatsapp ou anexado ao pedido em "Meus Pedidos"'}
            </p>

            {/* Step: Select Lens Type */}
            {step === "type" && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Selecione a Lente</h2>
                <div className="space-y-4">
                  {types.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleSelectType(type)}
                      className={cn(
                        "w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all hover:border-gray-400",
                        selection.type?.id === type.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      )}
                      style={{
                        borderColor:
                          selection.type?.id === type.id
                            ? config?.selectedBorderColor
                            : config?.cardBorderColor,
                      }}
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                        {type.iconUrl ? (
                          <Image
                            src={type.iconUrl}
                            alt={type.name}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        ) : type.slug === "grau" ? (
                          <Glasses className="h-8 w-8 text-gray-600" />
                        ) : (
                          <div className="flex gap-1">
                            <Monitor className="h-6 w-6 text-cyan-500" />
                            <Smartphone className="h-5 w-5 text-cyan-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold">
                          {type.name}
                          {type.slug === "grau" && config?.gradeDiscountLabel && (
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              - {config.gradeDiscountLabel}
                            </span>
                          )}
                        </h3>
                        {type.description && (
                          <p className="text-sm text-gray-500 whitespace-pre-line">
                            {type.description}
                          </p>
                        )}
                      </div>
                      {type.price > 0 && (
                        <span
                          className="font-semibold"
                          style={{ color: config?.priceColor }}
                        >
                          +{formatPrice(type.price)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Select Thickness */}
            {step === "thickness" && selection.type && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Selecione a Espessura</h2>
                <div className="space-y-4">
                  {selection.type.thicknesses.map((thickness) => (
                    <button
                      key={thickness.id}
                      onClick={() => handleSelectThickness(thickness)}
                      className={cn(
                        "w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all hover:border-gray-400",
                        selection.thickness?.id === thickness.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      )}
                      style={{
                        borderColor:
                          selection.thickness?.id === thickness.id
                            ? config?.selectedBorderColor
                            : config?.cardBorderColor,
                      }}
                    >
                      <div className="w-16 h-16 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                        {thickness.iconUrl ? (
                          <Image
                            src={thickness.iconUrl}
                            alt={thickness.name}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        ) : (
                          <>
                            <div className="w-10 h-6 border-2 border-gray-400 rounded-full bg-gradient-to-r from-gray-200 to-gray-100" />
                            <span className="text-xs font-semibold mt-1">{thickness.index}</span>
                          </>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold">{thickness.name}</h3>
                        {thickness.description && (
                          <p className="text-sm text-gray-500 whitespace-pre-line line-clamp-3">
                            {thickness.description}
                          </p>
                        )}
                      </div>
                      <span
                        className="font-semibold"
                        style={{ color: config?.priceColor }}
                      >
                        +{formatPrice(thickness.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Select Treatment */}
            {step === "treatment" && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Selecione o Tratamento</h2>
                <div className="space-y-4">
                  {treatments.map((treatment) => (
                    <button
                      key={treatment.id}
                      onClick={() => handleSelectTreatment(treatment)}
                      className={cn(
                        "w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all hover:border-gray-400",
                        selection.treatment?.id === treatment.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      )}
                      style={{
                        borderColor:
                          selection.treatment?.id === treatment.id
                            ? config?.selectedBorderColor
                            : config?.cardBorderColor,
                      }}
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                        {treatment.iconUrl ? (
                          <Image
                            src={treatment.iconUrl}
                            alt={treatment.name}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        ) : treatment.name.toLowerCase().includes("azul") ? (
                          <div className="flex gap-1">
                            <Monitor className="h-6 w-6 text-cyan-500" />
                            <Smartphone className="h-5 w-5 text-cyan-500" />
                          </div>
                        ) : (
                          <Glasses className="h-8 w-8 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold">{treatment.name}</h3>
                        {treatment.description && (
                          <p className="text-sm text-gray-500 line-clamp-3">
                            {treatment.description}
                          </p>
                        )}
                      </div>
                      {treatment.price > 0 ? (
                        <span
                          className="font-semibold"
                          style={{ color: config?.priceColor }}
                        >
                          +{formatPrice(treatment.price)}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Summary */}
            {step === "summary" && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Resumo da compra</h2>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  {product.image && (
                    <div className="w-full md:w-1/2">
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {product.variant && (
                          <p className="text-gray-500">{product.variant}</p>
                        )}
                      </div>
                      <span className="font-semibold">{formatPrice(product.price)}</span>
                    </div>

                    {selection.type && (
                      <div className="border-t pt-4 space-y-2">
                        <p className="text-gray-600">
                          {selection.type.name}
                          {config?.gradeDiscountLabel && selection.type.slug === "grau" && (
                            <span className="ml-2 text-sm text-gray-500">
                              - {config.gradeDiscountLabel}
                            </span>
                          )}
                        </p>

                        {selection.thickness && (
                          <div className="flex justify-between">
                            <span>{selection.thickness.name}</span>
                            <span style={{ color: config?.priceColor }}>
                              +{formatPrice(selection.thickness.price)}
                            </span>
                          </div>
                        )}

                        {selection.treatment && (
                          <div className="flex justify-between">
                            <span>{selection.treatment.name}</span>
                            {selection.treatment.price > 0 && (
                              <span style={{ color: config?.priceColor }}>
                                +{formatPrice(selection.treatment.price)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Subtotal</span>
                        <span className="font-bold text-lg">
                          {formatPrice(calculateTotal())}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="w-full py-6 text-lg"
                      style={{
                        backgroundColor: config?.primaryColor || "#1f2937",
                      }}
                    >
                      Adicionar ao carrinho
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
