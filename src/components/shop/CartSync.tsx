"use client";

import { useCart } from "@/lib/store/cart";
import { useEffect } from "react";

export function CartSync() {
    const syncWithUser = useCart(state => state.syncWithUser);

    useEffect(() => {
        // Attempt sync on mount (e.g. page refresh or new session)
        // ideally checking if we have a "session" cookie or similar indication before making the async call
        // but handling it inside syncWithUser (which calls server action that checks auth) is safe too.
        syncWithUser();
    }, [syncWithUser]);

    return null;
}
