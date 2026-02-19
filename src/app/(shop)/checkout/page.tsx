"use client";

import { toast } from "sonner";

import { createOrder } from "@/lib/actions/checkout";
import { checkEmail, login, socialLogin } from "@/lib/actions/auth";
import { validateCoupon } from "@/lib/actions/coupon";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    CheckCircle2,
    CreditCard,
    Truck,
    AlertCircle,
    ShoppingBag,
    Lock,
    ChevronDown,
    ChevronUp,
    Minus,
    Plus
} from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
    const { items, getCartTotal, clearCart, addItem, decreaseItem } = useCart();
    const router = useRouter();
    const [isSubmitting, startTransition] = useTransition();

    // Steps: 1 = Informações, 2 = Entrega, 3 = Pagamento
    const [currentStep, setCurrentStep] = useState(1);
    const [showCoupon, setShowCoupon] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

    // Form States - Step 1
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Form States - Step 2
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [phone, setPhone] = useState("");
    const [cep, setCep] = useState("");
    const [street, setStreet] = useState("");
    const [number, setNumber] = useState("");
    const [complement, setComplement] = useState("");
    const [district, setDistrict] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [selectedShipping, setSelectedShipping] = useState("correios-sedex");

    // Form States - Step 3
    const [selectedPayment, setSelectedPayment] = useState("pix");
    const [cardHolder, setCardHolder] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCcv, setCardCcv] = useState("");

    const total = getCartTotal();
    const shippingCost = selectedShipping === 'correios-sedex' ? 25.90 : 18.50;

    const discount = appliedCoupon
        ? (appliedCoupon.type === 'PERCENTAGE' ? (total * Number(appliedCoupon.value)) / 100 : Number(appliedCoupon.value))
        : 0;

    const baseTotal = Math.max(0, total - discount + shippingCost);
    const pixTotal = baseTotal * 0.95;
    const finalTotal = (selectedPayment === 'pix' && currentStep === 3) ? pixTotal : baseTotal;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <ShoppingBag className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-xl text-slate-600 mb-4">Seu carrinho está vazio.</p>
                <Link href="/">
                    <Button>Voltar para a loja</Button>
                </Link>
            </div>
        );
    }

    const handleCepBlur = async () => {
        if (cep.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setStreet(data.logradouro || "");
                    setDistrict(data.bairro || "");
                    setCity(data.localidade || "");
                    setState(data.uf || "");
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const handleContinueStep1 = async () => {
        if (!email) {
            toast.error("Por favor, informe seu e-mail.");
            return;
        }

        if (showPasswordInput) {
            // Attempt Login
            if (!password) {
                toast.error("Informe sua senha.");
                return;
            }
            setIsLoggingIn(true);
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            const res = await login(formData);
            setIsLoggingIn(false);

            if (res.success) {
                toast.success("Login realizado com sucesso!");
                // Look up customer data again to pre-fill?
                // For now, let's just move to step 2 and maybe fetch data if needed
                // Ideally login sets a cookie, and we might fetch current user here, 
                // but let's assume the user can just verify their details in step 2.
                // Or better: fetch user details to fill the form
                const check = await checkEmail(email);
                if (check.exists && check.customer) {
                    setName(check.customer.name);
                    setPhone(check.customer.phone || "");
                    setCpf(check.customer.document || "");
                    if (check.lastOrderAddress) {
                        setCep(check.lastOrderAddress.zip);
                        setStreet(check.lastOrderAddress.street);
                        setNumber(check.lastOrderAddress.number);
                        setCity(check.lastOrderAddress.city);
                        setState(check.lastOrderAddress.state);
                        setDistrict(check.lastOrderAddress.district);
                    }
                }
                setCurrentStep(2);
            } else {
                toast.error(res.message || "Senha incorreta.");
            }
            return;
        }

        setIsCheckingEmail(true);
        const res = await checkEmail(email);
        setIsCheckingEmail(false);

        if (res.exists) {
            toast.info("E-mail já cadastrado. Informe sua senha para logar.");
            setShowPasswordInput(true);
        } else {
            setCurrentStep(2);
        }
    };

    const handleContinueStep2 = () => {
        if (!name || !cpf || !phone || !cep || !street || !number || !city || !state) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        setCurrentStep(3);
    };

    const handleFinishOrder = () => {
        if (selectedPayment === 'card') {
            if (!cardNumber || !cardHolder || !cardExpiry || !cardCcv) {
                alert("Preencha todos os dados do cartão.");
                return;
            }
        }

        startTransition(async () => {
            const [expiryMonth, expiryYear] = cardExpiry.includes('/') ? cardExpiry.split('/') : ["", ""];

            const res = await createOrder({
                customer: { name, email, phone, document: cpf },
                address: { zip: cep, street, number, complement, district, city, state },
                shipping: { title: selectedShipping, price: shippingCost },
                paymentMethod: selectedPayment,
                items: items,
                total: finalTotal,
                discount: discount,
                cardInfo: selectedPayment === 'card' ? {
                    holderName: cardHolder,
                    number: cardNumber.replace(/\s/g, ''),
                    expiryMonth,
                    expiryYear: expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
                    ccv: cardCcv
                } : undefined
            });

            if (res.success) {
                clearCart();
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

    const handleApplyCoupon = async () => {
        if (!couponCode) {
            toast.error("Digite um código de cupom.");
            return;
        }

        const res = await validateCoupon(couponCode, total);
        if (res.success) {
            toast.success("Cupom aplicado com sucesso!");
            setAppliedCoupon(res.coupon);
            setShowCoupon(false);
        } else {
            toast.error(res.message || "Cupom inválido.");
            setAppliedCoupon(null);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                body > div > div.flex.min-h-screen { 
                    min-height: auto !important; 
                }
                body > div > div.flex.min-h-screen > main.flex-1 { 
                    flex: 0 0 auto !important; 
                }
            `}} />
            <div className="bg-white pt-32 pb-4">
                {/* Header */}
                <div className="border-b bg-white">
                    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-end">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-4 py-2 shadow-sm">
                            <Lock className="h-4 w-4" />
                            <span>Você está em um ambiente seguro</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                        {/* Left Column: Steps */}
                        <div className="lg:col-span-2 space-y-3">

                            {/* Step 1: Informações */}
                            <div className={`bg-white rounded-lg border ${currentStep === 1 ? 'border-slate-300' : 'border-slate-100'} overflow-hidden`}>
                                <button
                                    className="w-full px-6 py-4 flex items-center gap-3 text-left"
                                    onClick={() => currentStep > 1 && setCurrentStep(1)}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep > 1 ? 'bg-green-500 text-white' : currentStep === 1 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                                    </span>
                                    <span className={`font-medium ${currentStep === 1 ? 'text-slate-900' : 'text-slate-500'}`}>Informações</span>
                                    {currentStep > 1 && <span className="ml-auto text-sm text-slate-500">{email}</span>}
                                </button>

                                {currentStep === 1 && (
                                    <div className="px-6 pb-6 space-y-6">
                                        {/* Social Login Buttons */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button
                                                variant="outline"
                                                className="h-12 gap-2 bg-black hover:bg-black/90 text-white border-none"
                                                onClick={() => socialLogin("apple")}
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.127 3.675-.552 9.127 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2.05-.13-4.04 1.052-5.13 1.052zm-1.193-5.52c.844 1.026 1.416 2.19 1.247 3.48-1.208.065-2.676-.792-3.35-1.974-.689-1.221-.351-2.48 1.155-3.66.675.052 1.35.48 2.155 1.442z" /></svg>
                                                Entrar com Apple
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-12 gap-2 bg-[#EA4335] hover:bg-[#EA4335]/90 text-white border-none"
                                                onClick={() => socialLogin("google")}
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 0.507 5.387 0 12s5.36 12 12 12c3.627 0 6.373-1.2 8.507-3.413C22.68 18.427 23.333 15.347 23.333 12.56c0-.987-.067-1.68-.173-2.347h-10.68Z" />
                                                </svg>
                                                Entrar com Google
                                            </Button>
                                        </div>

                                        <div className="text-center text-sm text-slate-500">
                                            ou entre com seu melhor e-mail
                                        </div>

                                        {/* Email Input */}
                                        <div className="space-y-2">
                                            <Input
                                                type="email"
                                                placeholder="Ex: meumelhoremail@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-12"
                                            />
                                            {showPasswordInput && (
                                                <Input
                                                    type="password"
                                                    placeholder="Sua senha"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="h-12"
                                                    disabled={isLoggingIn}
                                                />
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <a href="#" className="text-sm text-primary hover:underline">
                                                Não sei meu e-mail
                                            </a>
                                            <Button
                                                className="bg-slate-800 hover:bg-slate-700 px-8"
                                                onClick={handleContinueStep1}
                                                disabled={isCheckingEmail || isLoggingIn}
                                            >
                                                {isCheckingEmail ? "Verificando..." : (isLoggingIn ? "Entrando..." : (showPasswordInput ? "Entrar" : "Continuar"))}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Entrega */}
                            <div className={`bg-white rounded-lg border ${currentStep === 2 ? 'border-slate-300' : 'border-slate-100'} overflow-hidden`}>
                                <button
                                    className="w-full px-6 py-4 flex items-center gap-3 text-left"
                                    onClick={() => currentStep > 2 && setCurrentStep(2)}
                                    disabled={currentStep < 2}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep > 2 ? 'bg-green-500 text-white' : currentStep === 2 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {currentStep > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
                                    </span>
                                    <span className={`font-medium ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Entrega</span>
                                    {currentStep > 2 && <span className="ml-auto text-sm text-slate-500">{street}, {number} - {city}/{state}</span>}
                                </button>

                                {currentStep === 2 && (
                                    <div className="px-6 pb-6 space-y-4">
                                        {/* Personal Data */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome Completo *</Label>
                                                <Input
                                                    placeholder="Seu nome completo"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>CPF *</Label>
                                                <Input
                                                    placeholder="000.000.000-00"
                                                    value={cpf}
                                                    onChange={e => setCpf(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Celular / WhatsApp *</Label>
                                            <Input
                                                placeholder="(00) 00000-0000"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                            />
                                        </div>

                                        <div className="border-t pt-4 mt-4">
                                            <h4 className="font-medium text-slate-800 mb-4">Endereço de Entrega</h4>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="space-y-2">
                                                    <Label>CEP *</Label>
                                                    <Input
                                                        placeholder="00000-000"
                                                        value={cep}
                                                        onChange={e => setCep(e.target.value.replace(/\D/g, ''))}
                                                        onBlur={handleCepBlur}
                                                        maxLength={8}
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" className="text-sm text-primary hover:underline">
                                                        Não sei meu CEP
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-4 mb-4">
                                                <div className="col-span-3 space-y-2">
                                                    <Label>Rua *</Label>
                                                    <Input placeholder="Endereço" value={street} onChange={e => setStreet(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Número *</Label>
                                                    <Input placeholder="123" value={number} onChange={e => setNumber(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="space-y-2">
                                                    <Label>Complemento</Label>
                                                    <Input placeholder="Apto, Bloco (Opcional)" value={complement} onChange={e => setComplement(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Bairro *</Label>
                                                    <Input placeholder="Bairro" value={district} onChange={e => setDistrict(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-2 space-y-2">
                                                    <Label>Cidade *</Label>
                                                    <Input placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Estado *</Label>
                                                    <Input placeholder="UF" value={state} onChange={e => setState(e.target.value)} maxLength={2} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Options */}
                                        <div className="border-t pt-4 mt-4">
                                            <h4 className="font-medium text-slate-800 mb-4">Opções de Envio</h4>
                                            <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping} className="space-y-3">
                                                <div className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-slate-50 ${selectedShipping === 'correios-sedex' ? 'border-primary bg-primary/5' : ''}`}>
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

                                                <div className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-slate-50 ${selectedShipping === 'correios-pac' ? 'border-primary bg-primary/5' : ''}`}>
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

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                className="bg-slate-800 hover:bg-slate-700 px-8"
                                                onClick={handleContinueStep2}
                                            >
                                                Continuar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Pagamento */}
                            <div className={`bg-white rounded-lg border ${currentStep === 3 ? 'border-slate-300' : 'border-slate-100'} overflow-hidden`}>
                                <button
                                    className="w-full px-6 py-4 flex items-center gap-3 text-left"
                                    disabled={currentStep < 3}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 3 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        3
                                    </span>
                                    <span className={`font-medium ${currentStep === 3 ? 'text-slate-900' : 'text-slate-400'}`}>Pagamento</span>
                                </button>

                                {currentStep === 3 && (
                                    <div className="px-6 pb-6 space-y-6">
                                        <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Pix Option */}
                                            <div>
                                                <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                                                <Label
                                                    htmlFor="pix"
                                                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-white p-6 hover:bg-slate-50 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                                >
                                                    <div className="mb-3 text-3xl">💠</div>
                                                    <div className="font-bold text-lg">PIX</div>
                                                    <div className="text-xs text-center text-slate-500 mt-1">Aprovação imediata + 5% OFF</div>
                                                </Label>
                                            </div>

                                            {/* Credit Card Option */}
                                            <div>
                                                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                                <Label
                                                    htmlFor="card"
                                                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-white p-6 hover:bg-slate-50 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                                >
                                                    <CreditCard className="mb-3 h-8 w-8" />
                                                    <div className="font-bold text-lg">Cartão de Crédito</div>
                                                    <div className="text-xs text-center text-slate-500 mt-1">Até 3x sem juros</div>
                                                </Label>
                                            </div>
                                        </RadioGroup>

                                        {selectedPayment === 'card' && (
                                            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                                                <div className="space-y-2">
                                                    <Label>Número do Cartão</Label>
                                                    <Input placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Validade</Label>
                                                        <Input placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>CVV</Label>
                                                        <Input placeholder="123" value={cardCcv} onChange={e => setCardCcv(e.target.value)} maxLength={4} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nome Impresso</Label>
                                                    <Input placeholder="Como no cartão" value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700"
                                            size="lg"
                                            onClick={handleFinishOrder}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Processando..." : "Finalizar compra"}
                                        </Button>

                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                            <Lock className="h-3 w-3" />
                                            Ambiente seguro e criptografado
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border rounded-lg p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-slate-800">Resumo da compra</h3>
                                    <span className="text-sm text-slate-500">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
                                </div>

                                {/* Products */}
                                <div className="space-y-4 max-h-48 overflow-y-auto mb-6">
                                    {items.map(item => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="h-14 w-14 bg-slate-100 rounded border flex items-center justify-center shrink-0 overflow-hidden">
                                                {item.image ? (
                                                    <Link href={item.slug ? `/produto/${item.slug}` : '#'} className="block h-full w-full">
                                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                    </Link>
                                                ) : (
                                                    <ShoppingBag className="h-5 w-5 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link href={item.slug ? `/produto/${item.slug}` : '#'} className="hover:underline">
                                                    <div className="font-medium text-sm truncate">{item.name}</div>
                                                </Link>

                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <button
                                                        onClick={() => decreaseItem(item.id)}
                                                        className="h-5 w-5 flex items-center justify-center rounded border bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                                                        type="button"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-xs font-medium min-w-[1rem] text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addItem({ ...item, quantity: 1 })}
                                                        className="h-5 w-5 flex items-center justify-center rounded border bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                                                        type="button"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-sm">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon */}
                                <div className="border-t pt-4 mb-4">
                                    <button
                                        className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-700"
                                        onClick={() => setShowCoupon(!showCoupon)}
                                    >
                                        <span>Tem um cupom?</span>
                                        {showCoupon ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>

                                    {showCoupon && (
                                        <div className="flex gap-2 mt-3">
                                            <Input
                                                placeholder="Código do cupom"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button variant="outline" onClick={handleApplyCoupon}>Aplicar</Button>
                                        </div>
                                    )}
                                </div>

                                {/* Totals */}
                                <div className="space-y-3 text-sm border-t pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Subtotal</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Desconto</span>
                                            <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Frete</span>
                                        <span>{currentStep >= 2 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingCost) : 'A calcular'}</span>
                                    </div>
                                    {selectedPayment === 'pix' && currentStep === 3 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Desconto PIX (5%)</span>
                                            <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(baseTotal * 0.05)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                                    <span className="font-bold text-lg text-slate-800">Total</span>
                                    <span className="font-bold text-xl text-slate-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                            currentStep >= 2 ? finalTotal : (total - discount)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
