"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PLANS, type PlanKey } from "@/lib/constants/plans";
import { Check, CreditCard, Lock, AlertCircle, CheckCircle2, Copy, Loader2 } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { createCheckoutSubscription, checkPaymentConfirmed } from "@/lib/actions/subscription";
import { toast } from "sonner";

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#5BB5E0]" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Get plan from URL or default to STARTER
    const planParam = searchParams.get("plan") as PlanKey | null;
    const [selectedPlan, setSelectedPlan] = useState<PlanKey>(planParam && PLANS[planParam] ? planParam : "STARTER");

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");

    // Customer info - pre-fill from URL if coming from registration
    const emailParam = searchParams.get("email") || "";
    const nameParam = searchParams.get("name") || "";
    const phoneParam = searchParams.get("phone") || "";
    const cpfCnpjParam = searchParams.get("cpfCnpj") || "";
    const [name, setName] = useState(nameParam);
    const [email, setEmail] = useState(emailParam);
    const [cpfCnpj, setCpfCnpj] = useState(cpfCnpjParam);
    const [phone, setPhone] = useState(phoneParam);

    // Card info
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardHolder, setCardHolder] = useState("");

    // Address for card
    const [postalCode, setPostalCode] = useState("");
    const [addressNumber, setAddressNumber] = useState("");

    // PIX result
    const [pixData, setPixData] = useState<{
        paymentId: string;
        encodedImage: string;
        payload: string;
        expirationDate: string;
        value: number;
    } | null>(null);

    // Success state
    const [success, setSuccess] = useState(false);

    // Show PIX screen
    const [showPixScreen, setShowPixScreen] = useState(false);

    // Payment checking state
    const [checkingPayment, setCheckingPayment] = useState(false);

    // Poll for payment status when PIX screen is shown
    useEffect(() => {
        if (!showPixScreen || !pixData?.paymentId) return;

        // Scroll to top when PIX screen opens
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setCheckingPayment(true);
        const intervalId = setInterval(async () => {
            try {
                const result = await checkPaymentConfirmed(pixData.paymentId);
                if (result.confirmed) {
                    clearInterval(intervalId);
                    setCheckingPayment(false);
                    setSuccess(true);
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push("/landing/login?email=" + encodeURIComponent(email) + "&paid=true");
                    }, 3000);
                }
            } catch (error) {
                console.error("Error checking payment:", error);
            }
        }, 3000); // Check every 3 seconds

        // Cleanup on unmount
        return () => {
            clearInterval(intervalId);
            setCheckingPayment(false);
        };
    }, [showPixScreen, pixData?.paymentId, email, router]);

    // Format CPF/CNPJ
    const formatCpfCnpj = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    };

    // Format phone
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    };

    // Format card number
    const formatCardNumber = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        return numbers.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    };

    // Format expiry
    const formatExpiry = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length >= 2) {
            return numbers.slice(0, 2) + "/" + numbers.slice(2, 4);
        }
        return numbers;
    };

    const handleSubmit = () => {
        // Validation
        if (!name || !email || !cpfCnpj || !phone) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        if (paymentMethod === "card") {
            if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder || !postalCode || !addressNumber) {
                toast.error("Preencha todos os dados do cartão");
                return;
            }
        }

        const cleanCpf = cpfCnpj.replace(/\D/g, "");
        const cleanPhone = phone.replace(/\D/g, "");
        const cleanCardNumber = cardNumber.replace(/\D/g, "");
        const [expiryMonth, expiryYear] = cardExpiry.split("/");

        startTransition(async () => {
            try {
                const result = await createCheckoutSubscription({
                    email,
                    name,
                    cpfCnpj: cleanCpf,
                    phone: cleanPhone,
                    plan: selectedPlan,
                    billingType: paymentMethod === "pix" ? "PIX" : "CREDIT_CARD",
                    creditCard: paymentMethod === "card" ? {
                        holderName: cardHolder,
                        number: cleanCardNumber,
                        expiryMonth: expiryMonth,
                        expiryYear: "20" + expiryYear,
                        ccv: cardCvv
                    } : undefined,
                    creditCardHolderInfo: paymentMethod === "card" ? {
                        name: cardHolder,
                        email,
                        cpfCnpj: cleanCpf,
                        postalCode: postalCode.replace(/\D/g, ""),
                        addressNumber,
                        phone: cleanPhone
                    } : undefined
                });

                if (result.success) {
                    if (result.pixData) {
                        // Show PIX QR Code screen
                        setPixData(result.pixData);
                        setShowPixScreen(true);
                        toast.success("QR Code PIX gerado! Escaneie para pagar.");
                    } else {
                        // Card payment - show success
                        setSuccess(true);
                        toast.success("Assinatura criada com sucesso!");

                        // Redirect to login after 3 seconds
                        setTimeout(() => {
                            router.push("/landing/login?registered=true&email=" + encodeURIComponent(email));
                        }, 3000);
                    }
                } else {
                    toast.error(result.error || "Erro ao processar assinatura");
                }
            } catch (error: any) {
                toast.error(error.message || "Erro ao processar pagamento");
            }
        });
    };

    const plan = PLANS[selectedPlan];

    // PIX Screen
    if (showPixScreen && pixData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <LandingNavbar />
                <div className="pt-20 pb-8 px-4">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                            <div className="w-12 h-12 bg-[#5BB5E0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💠</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 mb-1">
                                Pague com PIX
                            </h1>
                            <p className="text-gray-600 text-sm mb-4">
                                Escaneie o QR Code abaixo ou copie o código para pagar
                            </p>

                            {/* QR Code */}
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-3 mb-4 inline-block">
                                <img
                                    src={`data:image/png;base64,${pixData.encodedImage}`}
                                    alt="QR Code PIX"
                                    className="w-44 h-44 mx-auto"
                                />
                            </div>

                            {/* Value */}
                            <div className="bg-[#5BB5E0]/10 rounded-lg p-3 mb-4">
                                <p className="text-xs text-gray-600 mb-1">Valor a pagar</p>
                                <p className="text-2xl font-bold text-[#5BB5E0]">
                                    R$ {pixData.value.toFixed(2).replace('.', ',')}
                                </p>
                            </div>

                            {/* Copy Code */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">Ou copie o código PIX:</p>
                                <div className="flex gap-2">
                                    <Input
                                        value={pixData.payload}
                                        readOnly
                                        className="text-xs font-mono"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixData.payload);
                                            toast.success("Código PIX copiado!");
                                        }}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Payment Status */}
                            {checkingPayment && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left mb-4">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                                        <p className="text-xs text-blue-800">
                                            <strong>Aguardando pagamento...</strong> O sistema detectará automaticamente quando você pagar.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-2">
                                <Button
                                    onClick={() => router.push("/landing/login?email=" + encodeURIComponent(email))}
                                    className="w-full bg-[#5BB5E0] hover:bg-[#4AA5D0]"
                                    size="sm"
                                >
                                    Já paguei, ir para o login
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowPixScreen(false);
                                        setPixData(null);
                                    }}
                                    className="w-full"
                                >
                                    Voltar e escolher outro método
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <LandingNavbar />
                <div className="pt-24 pb-16 px-4">
                    <div className="max-w-lg mx-auto text-center">
                        <div className="bg-white rounded-2xl p-10 shadow-lg">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Pagamento Confirmado!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Sua assinatura foi ativada com sucesso. Agora você pode acessar o sistema com o email e senha que cadastrou.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Redirecionando para o login...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <LandingFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <LandingNavbar />
            <div className="pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Finalizar Assinatura
                        </h1>
                        <p className="text-lg text-gray-600">
                            Complete seus dados para ativar o plano {plan.name}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Plan Selection */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Plano Selecionado</h2>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, p]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedPlan(key)}
                                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                                                selectedPlan === key
                                                    ? "border-[#5BB5E0] bg-[#5BB5E0]/5"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-gray-900">{p.name}</span>
                                                {selectedPlan === key && (
                                                    <Check className="w-5 h-5 text-[#5BB5E0]" />
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-[#5BB5E0]">
                                                R$ {p.monthlyPrice}
                                                <span className="text-sm font-normal text-gray-500">/mês</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Seus Dados</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nome Completo *</Label>
                                        <Input
                                            placeholder="Seu nome"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>E-mail *</Label>
                                        <Input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CPF ou CNPJ *</Label>
                                        <Input
                                            placeholder="000.000.000-00"
                                            value={cpfCnpj}
                                            onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                                            maxLength={18}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Telefone *</Label>
                                        <Input
                                            placeholder="(00) 00000-0000"
                                            value={phone}
                                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                                            maxLength={15}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Forma de Pagamento</h2>

                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as "pix" | "card")}
                                    className="grid sm:grid-cols-2 gap-4 mb-6"
                                >
                                    <div>
                                        <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                                        <Label
                                            htmlFor="pix"
                                            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-white p-6 hover:bg-slate-50 cursor-pointer peer-data-[state=checked]:border-[#5BB5E0] [&:has([data-state=checked])]:border-[#5BB5E0]"
                                        >
                                            <div className="mb-3 text-3xl">💠</div>
                                            <div className="font-bold text-lg">PIX</div>
                                            <div className="text-xs text-center text-slate-500 mt-1">Aprovação imediata</div>
                                        </Label>
                                    </div>

                                    <div>
                                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                        <Label
                                            htmlFor="card"
                                            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-white p-6 hover:bg-slate-50 cursor-pointer peer-data-[state=checked]:border-[#5BB5E0] [&:has([data-state=checked])]:border-[#5BB5E0]"
                                        >
                                            <CreditCard className="mb-3 h-8 w-8" />
                                            <div className="font-bold text-lg">Cartão de Crédito</div>
                                            <div className="text-xs text-center text-slate-500 mt-1">Cobrança mensal automática</div>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {/* Card Form */}
                                {paymentMethod === "card" && (
                                    <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                                        <div className="space-y-2">
                                            <Label>Número do Cartão</Label>
                                            <Input
                                                placeholder="0000 0000 0000 0000"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                maxLength={19}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Validade</Label>
                                                <Input
                                                    placeholder="MM/AA"
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                    maxLength={5}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>CVV</Label>
                                                <Input
                                                    placeholder="123"
                                                    value={cardCvv}
                                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nome no Cartão</Label>
                                            <Input
                                                placeholder="Como está impresso no cartão"
                                                value={cardHolder}
                                                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>CEP</Label>
                                                <Input
                                                    placeholder="00000-000"
                                                    value={postalCode}
                                                    onChange={(e) => setPostalCode(e.target.value)}
                                                    maxLength={9}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Número</Label>
                                                <Input
                                                    placeholder="123"
                                                    value={addressNumber}
                                                    onChange={(e) => setAddressNumber(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    className="w-full h-14 text-lg font-bold bg-[#5BB5E0] hover:bg-[#4AA5D0] mt-6"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>Assinar por R$ {plan.monthlyPrice}/mês</>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
                                    <Lock className="h-3 w-3" />
                                    Ambiente seguro e criptografado
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-24">
                                <h3 className="font-bold text-lg text-gray-900 mb-6">Resumo</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Plano {plan.name}</span>
                                        <span className="font-medium">R$ {plan.monthlyPrice}/mês</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="font-bold text-lg text-gray-900">Total</span>
                                    <span className="font-bold text-2xl text-[#5BB5E0]">
                                        R$ {plan.monthlyPrice}/mês
                                    </span>
                                </div>

                                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                    <h4 className="font-medium text-sm text-gray-900 mb-2">Incluído no plano:</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-[#5BB5E0]" />
                                            7 dias de teste grátis
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-[#5BB5E0]" />
                                            Cancele quando quiser
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-[#5BB5E0]" />
                                            Suporte incluso
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p>
                                        Ao clicar em assinar, você concorda com nossos termos de uso e política de privacidade.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LandingFooter />
        </div>
    );
}
