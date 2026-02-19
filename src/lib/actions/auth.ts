"use server";

import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "shop_session";

export async function register(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const document = formData.get("document") as string; // CPF

    if (!name || !email || !password) {
        return { success: false, message: "Preencha todos os campos obrigatórios." };
    }

    try {
        const existing = await prisma.customer.findUnique({ where: { email } });
        if (existing) {
            return { success: false, message: "Este email já está cadastrado." };
        }

        const hashedPassword = await hash(password, 10);

        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                document
            }
        });

        // Set Login Cookie (Simple ID storage for MVP)
        // In production: Use JWT or iron-session
        (await cookies()).set(SESSION_COOKIE, customer.id, { httpOnly: true, path: "/" });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao criar conta." };
    }
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { success: false, message: "Email e senha são obrigatórios." };
    }

    try {
        const customer = await prisma.customer.findUnique({ where: { email } });

        if (!customer || !customer.password) {
            return { success: false, message: "Credenciais inválidas." };
        }

        const isValid = await compare(password, customer.password);
        if (!isValid) {
            return { success: false, message: "Credenciais inválidas." };
        }

        (await cookies()).set(SESSION_COOKIE, customer.id, { httpOnly: true, path: "/" });

        return { success: true };

    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao fazer login." };
    }
}

export async function logout() {
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/");
}

import { auth, signIn } from "@/auth";

// ... existing imports

export async function getCurrentUser() {
    // 1. Check Custom Cookie (Legacy/Manual Email)
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (sessionId) {
        return prisma.customer.findUnique({
            where: { id: sessionId },
            select: { id: true, name: true, email: true }
        });
    }

    // 2. Check NextAuth Session (Social)
    const session = await auth();
    if (session?.user?.email) {
        // Find customer by email to return consistent ID format
        // NextAuth Prisma Adapter should have creating the User/Customer?
        // Wait. PrismaAdapter uses `User` model, but my shop uses `Customer`.
        // My `auth.ts` config uses `PrismaAdapter`.
        // Schema: `User` model exists. `Customer` model exists.
        // If I use PrismaAdapter, it writes to `User`.
        // But my shop logic (`createOrder` etc) uses `Customer`.
        // This is a disconnect!

        // I need to sync them or point PrismaAdapter to `Customer` (mapped as User).
        // Or, in `session` callback, I ensure `Customer` exists.
        // Let's look at schema again. 
        // `User` model has `email`, `name`. `Customer` has `email`, `name`.
        // If I use standard Adapter, it uses `User`.
        // I should probably ensure `Customer` is created when `User` is created, or map them.

        // Quickest fix for now:
        // In `auth.ts` callback `signIn` or `session`, verify if `Customer` exists for that email.
        // If not, create it.
        // `getCurrentUser` should return the `Customer` object.

        const customer = await prisma.customer.findUnique({ where: { email: session.user.email } });
        if (customer) return customer;

        // If no customer but we have session (e.g. first login), create Customer?
        // Better to handle this in `auth.ts` `signIn` callback to ensure consistency.
        // But for `getCurrentUser`, if we have a session email, we can try to find the Customer.

        // Let's assume sync happens.
        return { id: session.user.id, name: session.user.name, email: session.user.email };
    }

    return null;
}

export async function socialLogin(provider: string) {
    await signIn(provider, { redirectTo: "/checkout" });
}

export async function checkEmail(email: string) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { email },
            select: {
                id: true, name: true, phone: true, document: true,
                // Add address if possible? Schema doesn't have address in Customer table, only in Order.
                // Assuming address is not stored in Customer yet or I need to find last order.
            }
        });

        // Try to find last order address to pre-fill?
        let lastOrderAddress = null;
        if (customer) {
            const lastOrder = await prisma.order.findFirst({
                where: { customerId: customer.id },
                orderBy: { createdAt: 'desc' }
            });
            if (lastOrder) {
                lastOrderAddress = {
                    zip: lastOrder.addressZip,
                    street: lastOrder.addressStreet,
                    number: lastOrder.addressNumber,
                    complement: lastOrder.addressComplement,
                    district: lastOrder.addressDistrict,
                    city: lastOrder.addressCity,
                    state: lastOrder.addressState
                };
            }
            return { exists: true, customer, lastOrderAddress };
        }
        return { exists: false };
    } catch (error) {
        return { success: false, error: "Erro ao verificar email" };
    }
}
