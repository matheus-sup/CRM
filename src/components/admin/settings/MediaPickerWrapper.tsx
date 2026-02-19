"use client";

import { useState } from "react";
import { ImagePicker } from "@/components/admin/media/ImagePicker";

interface MediaPickerWrapperProps {
    defaultValue: string;
    name: string;
    label: string;
}

export function MediaPickerWrapper({ defaultValue, name, label }: MediaPickerWrapperProps) {
    const [value, setValue] = useState(defaultValue);

    return (
        <>
            <input type="hidden" name={name} value={value} />
            <ImagePicker
                value={value}
                onChange={setValue}
                label={label}
            />
        </>
    );
}
