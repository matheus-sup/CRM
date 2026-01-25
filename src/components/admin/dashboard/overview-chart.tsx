"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
    { name: "Seg", total: Math.floor(Math.random() * 500) + 100 },
    { name: "Ter", total: Math.floor(Math.random() * 1000) + 200 },
    { name: "Qua", total: Math.floor(Math.random() * 800) + 100 },
    { name: "Qui", total: Math.floor(Math.random() * 1200) + 300 },
    { name: "Sex", total: Math.floor(Math.random() * 1500) + 400 },
    { name: "Sab", total: Math.floor(Math.random() * 2000) + 500 },
    { name: "Dom", total: Math.floor(Math.random() * 1000) + 300 },
];

export function OverviewChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
