"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  return (
    <div className="h-72 rounded-3xl border border-black/10 bg-white p-3 shadow-sm md:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4A843" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#D4A843" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" stroke="#D4A843" fill="url(#revenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
