"use client";

import { createOrder } from "@/lib/actions/checkout";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, CreditCard, Truck, AlertCircle, ShoppingBag } from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const { items, getCartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, startTransition] = useTransition();

    const [step, setStep] = useState<'address' | 'payment'>('address');

    // Form States
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [cep, setCep] = useState("");
    const [street, setStreet] = useState("");
    const [number, setNumber] = useState("");
    const [complement, setComplement] = useState("");
    const [district, setDistrict] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");

    const [selectedShipping, setSelectedShipping] = useState("correios-sedex");
    const [selectedPayment, setSelectedPayment] = useState("pix");

    const total = getCartTotal();
    const shippingCost = selectedShipping === 'correios-sedex' ? 25.90 : 18.50; // Mock

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p>Seu carrinho está vazio.</p>
                <Link href="/"><Button variant="link">Voltar para a loja</Button></Link>
            </div>
        )
    }

    const handleCepBlur = async () => {
        if (cep.length === 8) {
            // Mock ViaCEP call simulation
            if (cep === "01001000") {
                setStreet("Praça da Sé");
                setDistrict("Sé");
                setCity("São Paulo");
                setState("SP");
            }
        }
    };

    const handleFinishOrder = () => {
        if (!name || !cpf || !street || !number) {
            alert("Por favor, preencha todos os dados obrigatórios.");
            if (step !== 'address') setStep('address');
            return;
        }

        startTransition(async () => {
            const res = await createOrder({
                customer: { name, email: email || undefined, phone: phone || undefined, document: cpf },
                address: { zip: cep, street, number, complement, district, city, state },
                shipping: { title: selectedShipping, price: shippingCost },
                paymentMethod: selectedPayment,
                items: items,
                total: selectedPayment === 'pix' ? (total + shippingCost) * 0.95 : (total + shippingCost)
            });

            if (res.success) {
                clearCart();
                // Redirect to success based on payment method
                const params = new URLSearchParams();
                params.set("orderCode", String(res.orderCode));
                params.set("method", selectedPayment);
                if (res.payment?.pixPayload) {
                    params.set("pixCode", res.payment.pixPayload);
                }

                router.push(`/checkout/sucesso?${params.toString()}`);
            } else {
                alert("Erro ao criar pedido: " + res.message);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">

            {/* Left Column: Form Steps */}
            <div className="lg:col-span-2 space-y-6">

                {/* Step 1: Address */}
                <div className={`bg-white p-6 rounded-xl border ${step === 'address' ? 'border-primary ring-1 ring-primary/20' : 'border-slate-100'} shadow-sm`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Endereço e Entrega
                        </h2>
                        {step === 'payment' && <CheckCircle2 className="text-green-500 h-5 w-5" />}
                    </div>

                    {step === 'address' ? (
                        <div className="space-y-4">
                            {/* Personal Data */}
                            <div className="p-4 bg-slate-50 rounded-lg border space-y-4 mb-4">
                                <h3 className="font-semibold text-sm text-slate-700">Dados Pessoais</h3>
                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>CPF</Label>
                                        <Input placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Celular / WhatsApp</Label>
                                        <Input placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email (Opcional)</Label>
                                    <Input placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>CEP</Label>
                                    <Input
                                        placeholder="00000-000"
                                        value={cep}
                                        onChange={e => setCep(e.target.value)}
                                        onBlur={handleCepBlur}
                                        maxLength={8}
                                    />
                                </div>
                                <div className="flex items-end pb-1">
                                    <a href="#" className="text-xs text-primary underline">Não sei meu CEP</a>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3 space-y-2">
                                    <Label>Rua</Label>
                                    <Input placeholder="Endereço" value={street} onChange={e => setStreet(e.target.value)} />
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label>Número</Label>
                                    <Input placeholder="123" value={number} onChange={e => setNumber(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Complemento</Label>
                                    <Input placeholder="Apto, Bloco (Opcional)" value={complement} onChange={e => setComplement(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bairro</Label>
                                    <Input placeholder="Bairro" value={district} onChange={e => setDistrict(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label>Cidade</Label>
                                    <Input placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Input placeholder="UF" value={state} onChange={e => setState(e.target.value)} maxLength={2} />
                                </div>
                            </div>

                            {/* Shipping Selection */}
                            <div className="pt-4 border-t mt-4">
                                <Label className="mb-3 block">Opções de Envio</Label>
                                <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping} className="space-y-3">
                                    <div className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer hover:bg-slate-50 ${selectedShipping === 'correios-sedex' ? 'border-primary bg-primary/5' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="correios-sedex" id="sedex" />
                                            <Label htmlFor="sedex" className="flex items-center gap-2 cursor-pointer">
                                                <Truck className="h-4 w-4 text-slate-500" />
                                                <div>
                                                    <div className="font-semibold">Sedex (Correios)</div>
                                                    <div className="text-xs text-slate-500">Chega em até 3 dias úteis</div>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="font-bold">R$ 25,90</div>
                                    </div>

                                    <div className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer hover:bg-slate-50 ${selectedShipping === 'correios-pac' ? 'border-primary bg-primary/5' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="correios-pac" id="pac" />
                                            <Label htmlFor="pac" className="flex items-center gap-2 cursor-pointer">
                                                <Truck className="h-4 w-4 text-slate-500" />
                                                <div>
                                                    <div className="font-semibold">PAC (Correios)</div>
                                                    <div className="text-xs text-slate-500">Chega em até 7 dias úteis</div>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="font-bold">R$ 18,50</div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="pt-4">
                                <Button className="w-full" onClick={() => setStep('payment')}>Ir para Pagamento</Button>
                            </div>

                        </div>
                    ) : (
                        <div className="text-sm text-slate-500 flex justify-between items-center">
                            <span>{street}, {number} - {city}/{state} via {selectedShipping === 'correios-sedex' ? 'Sedex' : 'PAC'}</span>
                            <Button variant="link" size="sm" onClick={() => setStep('address')}>Alterar</Button>
                        </div>
                    )}
                </div>

                {/* Step 2: Payment */}
                <div className={`bg-white p-6 rounded-xl border ${step === 'payment' ? 'border-primary ring-1 ring-primary/20' : 'border-slate-100'} shadow-sm opacity-${step === 'payment' ? '100' : '50'}`}>
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Pagamento
                    </h2>

                    {step === 'payment' && (
                        <div className="space-y-6">
                            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Pix Option */}
                                <div>
                                    <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                                    <Label
                                        htmlFor="pix"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <div className="mb-3 text-2xl">💠</div>
                                        <div className="font-bold">PIX</div>
                                        <div className="text-xs text-center text-slate-500 mt-1">Aprovação imediata + 5% OFF</div>
                                    </Label>
                                </div>

                                {/* Credit Card Option */}
                                <div>
                                    <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                    <Label
                                        htmlFor="card"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <CreditCard className="mb-3 h-6 w-6" />
                                        <div className="font-bold">Cartão de Crédito</div>
                                        <div className="text-xs text-center text-slate-500 mt-1">Até 3x sem juros</div>
                                    </Label>
                                </div>
                            </RadioGroup>

                            {selectedPayment === 'card' && (
                                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                                    <div className="space-y-1">
                                        <Label>Número do Cartão</Label>
                                        <Input placeholder="0000 0000 0000 0000" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>Validade</Label>
                                            <Input placeholder="MM/AA" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>CVV</Label>
                                            <Input placeholder="123" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Nome Impresso</Label>
                                        <Input placeholder="Como no cartão" />
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full h-12 text-lg font-bold"
                                size="lg"
                                onClick={handleFinishOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Processando..." : `Finalizar Pedido - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPayment === 'pix' ? (total + shippingCost) * 0.95 : (total + shippingCost))}`}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                <AlertCircle className="h-3 w-3" />
                                Ambiente seguro e criptografado
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm sticky top-6">
                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Resumo da Compra</h3>

                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4 scrollbar-thin">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-3 text-sm">
                                <div className="h-10 w-10 bg-white rounded border flex items-center justify-center shrink-0">
                                    {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded" /> : <ShoppingBag className="h-4 w-4 text-slate-300" />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium truncate">{item.name}</div>
                                    <div className="text-slate-500 text-xs">Qtd: {item.quantity} × R$ {item.price}</div>
                                </div>
                                <div className="font-medium">
                                    R$ {item.price * item.quantity}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 border-t pt-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Frete</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingCost)}</span>
                        </div>
                        {selectedPayment === 'pix' && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Desconto PIX (5%)</span>
                                <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((total + shippingCost) * 0.05)}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 mt-4 flex justify-between items-center">
                        <span className="font-bold text-lg text-slate-800">Total</span>
                        <span className="font-bold text-xl text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                selectedPayment === 'pix'
                                    ? (total + shippingCost) * 0.95
                                    : (total + shippingCost)
                            )}
                        </span>
                    </div>

                    <div className="mt-6 text-xs text-slate-400 text-center">
                        Ao finalizar a compra, você concorda com nossos Termos de Uso e Política de Privacidade.
                    </div>
                </div>
            </div>
        </div>
    );
}
