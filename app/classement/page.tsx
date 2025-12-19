import { getLeaderboard } from '@/lib/actions/leaderboard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Medal, Crown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/PageHeader'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Classement | Réussite France Citoyen',
    description: 'Voir les meilleurs apprenants et votre position dans le classement.',
}

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) redirect('/login')

    const leaderboard = await getLeaderboard()
    const userRank = leaderboard.find(u => u.id === currentUser.id)

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50/50 dark:bg-gray-950 p-4 pb-24 max-w-2xl mx-auto space-y-6">
            <PageHeader
                title="Classement"
                description="Les 50 meilleurs citoyens en herbe"
            />

            {/* Current User Rank Card (Sticky or unique visual) */}
            {userRank && (
                <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-none shadow-lg p-4 flex items-center justify-between mb-6 transform scale-105">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold font-mono">#{userRank.rank}</div>
                        <div>
                            <div className="font-bold text-lg">Vous</div>
                            <div className="text-blue-100 text-sm">{userRank.xp} XP • Niveau {userRank.level}</div>
                        </div>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Crown className="w-6 h-6 text-yellow-300" />
                    </div>
                </Card>
            )}

            <div className="space-y-3">
                {leaderboard.map((entry) => {
                    const isCurrentUser = entry.id === currentUser.id
                    let RankIcon = null
                    let rankColor = "text-gray-500 bg-gray-100"

                    if (entry.rank === 1) {
                        RankIcon = <Crown className="w-5 h-5 text-yellow-500" />
                        rankColor = "bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50"
                    } else if (entry.rank === 2) {
                        RankIcon = <Medal className="w-5 h-5 text-gray-400" />
                        rankColor = "bg-gray-100 text-gray-700"
                    } else if (entry.rank === 3) {
                        RankIcon = <Medal className="w-5 h-5 text-orange-400" />
                        rankColor = "bg-orange-100 text-orange-800"
                    }

                    return (
                        <div
                            key={entry.id}
                            className={`
                                flex items-center gap-4 p-4 rounded-xl transition-all
                                ${isCurrentUser
                                    ? 'bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                    : 'bg-white border border-gray-100 dark:bg-slate-900 dark:border-slate-800'
                                }
                            `}
                        >
                            <div className={`
                                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0
                                ${rankColor}
                            `}>
                                {RankIcon || entry.rank}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className={`font-bold truncate ${isCurrentUser ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                    {entry.surnom}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <span className="font-semibold text-primary">{entry.xp} XP</span>
                                    <span>•</span>
                                    <span>Niveau {entry.level}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
