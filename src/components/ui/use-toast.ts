"use client"

// Simplified version of use-toast for now
// Ideally we should install the full hook from shadcn, but let's check if toaster is even set up in layout.
// For now, providing a mock hook to prevent build errors.

import * as React from "react"
// import { type ToastActionElement, type ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = any

export const useToast = () => {
    // Mock implementation
    const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
        console.log("Toast:", title, description, variant)
    }
    return { toast }
}

export { useToast as useToastHook }
