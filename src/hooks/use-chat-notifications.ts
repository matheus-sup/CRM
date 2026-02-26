"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface Conversation {
    id: string;
    phoneNumber: string;
    name: string | null;
    lastMessage: string | null;
    updatedAt: string;
}

export function useChatNotifications(
    enabled: boolean = true,
    onNewMessage?: (conversation: Conversation) => void
) {
    const lastCheckRef = useRef<Date>(new Date());
    const seenMessagesRef = useRef<Set<string>>(new Set());
    const audioContextRef = useRef<AudioContext | null>(null);

    const playSound = useCallback(() => {
        try {
            // Create audio context if not exists
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // WhatsApp-like notification sound
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) {
            // Ignore audio errors
        }
    }, []);

    const checkNewMessages = useCallback(async () => {
        try {
            const response = await fetch("/api/chat/notifications");
            if (!response.ok) return;

            const data = await response.json();

            if (data.newMessages && data.newMessages.length > 0) {
                let hasNewMessage = false;

                for (const msg of data.newMessages) {
                    // Skip if already seen
                    if (seenMessagesRef.current.has(msg.id)) continue;
                    seenMessagesRef.current.add(msg.id);
                    hasNewMessage = true;

                    // Show toast notification
                    toast.info(`Nova mensagem de ${msg.name || msg.phoneNumber}`, {
                        description: msg.content?.substring(0, 50) + (msg.content?.length > 50 ? "..." : ""),
                        duration: 5000,
                    });

                    // Browser notification
                    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                        new Notification(`Nova mensagem - ${msg.name || msg.phoneNumber}`, {
                            body: msg.content?.substring(0, 100),
                            icon: "/favicon.ico",
                        });
                    }

                    // Callback
                    if (onNewMessage) {
                        onNewMessage(msg);
                    }
                }

                // Play sound once if there are new messages
                if (hasNewMessage) {
                    playSound();
                }

                // Keep only recent messages in seen set (prevent memory leak)
                if (seenMessagesRef.current.size > 100) {
                    const arr = Array.from(seenMessagesRef.current);
                    seenMessagesRef.current = new Set(arr.slice(-50));
                }
            }

            lastCheckRef.current = new Date();
        } catch (error) {
            console.error("Error checking notifications:", error);
        }
    }, [playSound, onNewMessage]);

    // Request notification permission on mount
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission();
            }
        }
    }, []);

    // Poll for new messages
    useEffect(() => {
        if (!enabled) return;

        // Initial check
        checkNewMessages();

        // Poll every 3 seconds for faster notifications
        const interval = setInterval(checkNewMessages, 3000);

        return () => clearInterval(interval);
    }, [enabled, checkNewMessages]);

    return { checkNewMessages, playSound };
}
