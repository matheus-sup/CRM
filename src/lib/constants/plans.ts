// Plan definitions - shared between client and server
export const PLANS = {
    TESTE: {
        name: "Teste",
        price: 1,
        description: "Plano de teste - R$1,00",
        asaasLink: "" // SUBSTITUIR PELO LINK DO ASAAS
    },
    STARTER: {
        name: "Starter",
        price: 97,
        description: "Plano inicial para começar sua loja",
        asaasLink: "https://www.asaas.com/c/z5xocudoqchl3y5p"
    },
    PROFISSIONAL: {
        name: "Profissional",
        price: 197,
        description: "Para lojas em crescimento",
        asaasLink: "https://www.asaas.com/c/vm3ts038er85mvcn"
    },
    ENTERPRISE: {
        name: "Enterprise",
        price: 397,
        description: "Para grandes operações",
        asaasLink: "https://www.asaas.com/c/hueyzezcaxrmv4z5"
    }
} as const;

export type PlanKey = keyof typeof PLANS;
