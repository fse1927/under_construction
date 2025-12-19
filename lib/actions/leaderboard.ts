'use server'

import { createClient } from '@/lib/supabase/server'

export type LeaderboardEntry = {
    id: string;
    surnom: string;
    xp: number;
    level: number;
    rank: number;
    avatar_url?: string;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('utilisateurs')
        .select('id, surnom, xp, level')
        .order('xp', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching leaderboard:', error)
        return []
    }

    // Add rank (1-based index) and handle anonymous users
    return data.map((user, index) => ({
        id: user.id,
        surnom: user.surnom || `Citoyen #${user.id.slice(0, 4)}`,
        xp: user.xp || 0,
        level: user.level || 1,
        rank: index + 1
    }))
}
