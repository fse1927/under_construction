'use client';

import { Award, Star, Trophy, Zap, BookOpen, Crown, Medal, Target } from 'lucide-react';
import { UserProfile, UserStats } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgesSectionProps {
    user: UserProfile;
    stats: UserStats;
}

export function BadgesSection({ user, stats }: BadgesSectionProps) {
    const hasPerfectScore = stats.history?.some(h => h.score_pourcentage === 100);

    const badges = [
        {
            id: 'debutant',
            label: 'Débutant',
            description: 'Avoir terminé au moins 1 test',
            icon: <BookOpen className="w-8 h-8" />,
            unlocked: stats.totalTests >= 1,
            color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
            borderColor: 'border-green-200 dark:border-green-800'
        },
        {
            id: 'apprenti',
            label: 'Apprenti',
            description: 'Avoir terminé 5 tests',
            icon: <Star className="w-8 h-8" />,
            unlocked: stats.totalTests >= 5,
            color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
            borderColor: 'border-blue-200 dark:border-blue-800'
        },
        {
            id: 'assidu',
            label: 'Assidu',
            description: 'Avoir terminé 10 tests',
            icon: <Zap className="w-8 h-8" />,
            unlocked: stats.totalTests >= 10,
            color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
            borderColor: 'border-yellow-200 dark:border-yellow-800'
        },
        {
            id: 'expert',
            label: 'Expert',
            description: 'Score moyen supérieur à 80%',
            icon: <Medal className="w-8 h-8" />,
            unlocked: stats.avgScore >= 80 && stats.totalTests >= 5,
            color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
            borderColor: 'border-purple-200 dark:border-purple-800'
        },
        {
            id: 'perfectionniste',
            label: 'Perfectionniste',
            description: 'Obtenir 100% à un test',
            icon: <Target className="w-8 h-8" />,
            unlocked: !!hasPerfectScore,
            color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
            borderColor: 'border-red-200 dark:border-red-800'
        },
        {
            id: 'veteran',
            label: 'Vétéran',
            description: 'Atteindre le niveau 10',
            icon: <Crown className="w-8 h-8" />,
            unlocked: user.level >= 10,
            color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
            borderColor: 'border-amber-200 dark:border-amber-800'
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 dark:text-white">
                <Award className="w-5 h-5 text-yellow-500" />
                Mes Badges
                <span className="text-xs font-normal text-gray-400 ml-auto">
                    {badges.filter(b => b.unlocked).length} / {badges.length} débloqués
                </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <TooltipProvider delayDuration={0}>
                    {badges.map((badge) => (
                        <Tooltip key={badge.id}>
                            <TooltipTrigger asChild>
                                <div
                                    className={`
                                        group relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300
                                        ${badge.unlocked
                                            ? `${badge.color} ${badge.borderColor} shadow-sm scale-100`
                                            : 'bg-gray-50 border-gray-100 grayscale opacity-60 dark:bg-slate-800/50 dark:border-slate-800 hover:opacity-80'
                                        }
                                    `}
                                >
                                    <div className={`p-2 rounded-full bg-white/50 backdrop-blur-sm dark:bg-black/10 transition-transform duration-500 group-hover:scale-110`}>
                                        {badge.icon}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold truncate w-full">{badge.label}</p>
                                        {!badge.unlocked && (
                                            <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">Verrouillé</p>
                                        )}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="dark:bg-slate-800 dark:text-white">
                                <p className="font-semibold">{badge.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
        </div>
    );
}
