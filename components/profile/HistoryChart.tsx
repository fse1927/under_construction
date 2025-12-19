"use client";

import { Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface HistoryItem {
    score_pourcentage: number;
    date_test: string;
}

interface HistoryChartProps {
    history: HistoryItem[];
}

export function HistoryChart({ history }: HistoryChartProps) {
    if (!history || history.length === 0) return null;

    // Sort chronologically (Oldest -> Newest) for the chart
    const data = [...history]
        .sort((a, b) => new Date(a.date_test).getTime() - new Date(b.date_test).getTime())
        .map(item => ({
            ...item,
            date: new Date(item.date_test).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            fullDate: new Date(item.date_test).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        }));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-slate-900 dark:border-slate-800 transition-all hover:shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 dark:text-white">
                <Activity className="w-5 h-5 text-blue-500" />
                Historique de progression
            </h3>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '4 4' }}
                            formatter={(value: number | string | Array<number | string> | undefined) => [
                                <span className="font-bold text-blue-600">{Array.isArray(value) ? value[0] : (value ?? 0)}%</span>,
                                'Score'
                            ]}
                            labelFormatter={(label, payload) => {
                                if (payload && payload.length > 0 && payload[0].payload) {
                                    return <span className="text-xs font-medium text-gray-500 capitalize">{payload[0].payload.fullDate}</span>;
                                }
                                return label;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score_pourcentage"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                            activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff', fill: '#2563EB' }}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 mt-4 px-1">
                <span>{data[0]?.date || 'Début'}</span>
                <span>{data[data.length - 1]?.date || 'Aujourd\'hui'}</span>
            </div>
        </div>
    );
}
