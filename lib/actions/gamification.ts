'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserProfile } from '@/lib/data/types';

const XP_PER_LEVEL_BASE = 100;

export async function getUserStats(): Promise<UserProfile | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        // If user not found in table but authenticated, maybe create?
        // For now, return null.
        return null;
    }

    return data as UserProfile;
}

export async function addXp(amount: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch current stats
    const { data: currentStats } = await supabase
        .from('utilisateurs')
        .select('xp, level')
        .eq('id', user.id)
        .single();

    if (!currentStats) return;

    const newXp = (currentStats.xp || 0) + amount;
    const newLevel = currentStats.level || 1;

    // Simple Level Up Logic: Level * 100 XP required for next level
    // e.g. Lvl 1 -> 100xp -> Lvl 2. Lvl 2 -> 200xp -> Lvl 3.
    // Cumulative? Or reset? Let's do Cumulative Total XP for simplicity in DB, 
    // but calculated thresholds.
    // Threshold for Level N = 100 * N * (N-1) / 2 ? No, simpler.
    // Let's say: Level = floor(sqrt(XP / 25))? 
    // Or constant steps: Level = floor(XP / 100) + 1.

    // Let's use: Level = Math.floor(newXp / 100) + 1;
    const calculatedLevel = Math.floor(newXp / 100) + 1;

    // Check Streak
    // Logic: If last_activity_date < today - 1 day, reset streak.
    // If last_activity_date == today - 1 day, increment.
    // If last_activity_date == today, do nothing.
    // We update last_activity_date to today.

    // We handle streak update in a separate function or here?
    // Let's do it here since earning XP implies activity.

    const updateData = {
        xp: newXp,
        level: calculatedLevel,
        last_activity_date: new Date().toISOString()
    };

    await supabase
        .from('utilisateurs')
        .update(updateData)
        .eq('id', user.id);

    revalidatePath('/dashboard');
    revalidatePath('/apprendre');

    return {
        newXp,
        newLevel,
        leveledUp: calculatedLevel > newLevel
    };
}

export async function toggleFavorite(questionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { isFavorite: false };

    // Check if exists
    const { data: existing } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .single();

    if (existing) {
        await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('question_id', questionId);
        return { isFavorite: false };
    } else {
        await supabase
            .from('favorites')
            .insert({ user_id: user.id, question_id: questionId });
        return { isFavorite: true };
    }
}

export async function getFavorites() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from('favorites')
        .select('question_id');

    return (data || []).map(f => f.question_id);
}
