'use client';

import { UserProfile } from '@/lib/types';
import { Trophy, Flame, Star } from 'lucide-react';

interface UserProgressProps {
    user: UserProfile;
}

export function UserProgress({ user }: UserProgressProps) {
    // Level = floor(XP / 100) + 1
    // Progress to next level: (XP % 100) / 100
    const progressPercent = (user.xp % 100);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">

            {/* Level Badge */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-yellow-200">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                        {user.level}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Niveau</div>
                    <div className="font-bold text-gray-900">Apprenti Citoyen</div>
                </div>
            </div>

            {/* XP Bar */}
            <div className="flex-1 max-w-xs hidden md:block">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-blue-600">{user.xp} XP</span>
                    <span className="text-gray-400">{(Math.floor(user.xp / 100) + 1) * 100} XP</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500 relative" style={{ width: `${progressPercent}%` }}>
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                <Flame className={`w-5 h-5 ${user.current_streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                <span className="font-bold text-orange-700">{user.current_streak}</span>
                <span className="text-xs text-orange-400 uppercase font-bold hidden sm:inline">Jours</span>
            </div>
        </div>
    );
}
