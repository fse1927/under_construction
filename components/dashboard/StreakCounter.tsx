'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getDailyStreak } from '@/lib/actions/user-progress';
import { cn } from '@/lib/utils';

export default function StreakCounter() {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        getDailyStreak().then(setStreak);
    }, []);

    if (streak === 0) return null;

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm",
            streak >= 3 ? "bg-orange-100 text-orange-600 border border-orange-200" : "bg-gray-100 text-gray-500 border border-gray-200"
        )} title={`${streak} jours consécutifs !`}>
            <Flame className={cn("w-3.5 h-3.5", streak >= 3 ? "fill-orange-500 text-orange-600 animate-pulse" : "text-gray-400")} />
            <span>{streak}</span>
        </div>
    );
}
