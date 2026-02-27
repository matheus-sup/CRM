// Plan definitions - shared between client and server
export const PLANS = {
    STARTER: {
        name: "Starter",
        monthlyPrice: 5,
        annualPrice: 4,
        description: "Ideal para pequenos negócios que estão começando",
    },
    PROFISSIONAL: {
        name: "Professional",
        monthlyPrice: 197,
        annualPrice: 157,
        description: "Para negócios em crescimento que precisam de mais recursos",
    },
    ENTERPRISE: {
        name: "Enterprise",
        monthlyPrice: 497,
        annualPrice: 397,
        description: "Para operações robustas que exigem o máximo",
    }
} as const;

export type PlanKey = keyof typeof PLANS;
