// Plan definitions - shared between client and server
export const PLANS = {
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
