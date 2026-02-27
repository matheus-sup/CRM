"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS, type PlanKey } from "@/lib/constants/plans";
import { Check, ExternalLink } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

export default function CheckoutPage() {
    const [selectedPlan, setSelectedPlan] = useState<PlanKey>("STARTER");

    const handleSubscribe = () => {
        const plan = PLANS[selectedPlan];
        window.open(plan.asaasLink, "_blank");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <LandingNavbar />
            <div className="pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Escolha seu Plano
                        </h1>
                        <p className="text-lg text-gray-600">
                            Comece sua jornada com a NA Automation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        {Object.entries(PLANS).map(([key, plan]) => (
                            <Card
                                key={key}
                                className={`cursor-pointer transition-all ${
                                    selectedPlan === key
                                        ? "ring-2 ring-[#5BB5E0] scale-105"
                                        : "hover:scale-102"
                                }`}
                                onClick={() => setSelectedPlan(key as PlanKey)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {plan.name}
                                        {selectedPlan === key && (
                                            <Check className="w-5 h-5 text-[#5BB5E0]" />
                                        )}
                                    </CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-[#5BB5E0]">
                                        R$ {plan.price}
                                        <span className="text-sm font-normal text-gray-500">/mês</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="max-w-md mx-auto">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>Finalizar Assinatura</CardTitle>
                                <CardDescription>
                                    Plano selecionado: {PLANS[selectedPlan].name} - R$ {PLANS[selectedPlan].price}/mês
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-[#5BB5E0]/10 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-600">
                                        Você será redirecionado para o ambiente seguro do Asaas para finalizar o pagamento.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSubscribe}
                                    className="w-full bg-[#5BB5E0] hover:bg-[#4AA5D0]"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Assinar por R$ {PLANS[selectedPlan].price}/mês
                                </Button>

                                <p className="text-xs text-center text-gray-500">
                                    Após o pagamento, retorne aqui e faça login com o mesmo e-mail usado na assinatura.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <LandingFooter />
        </div>
    );
}
