'use server';

import { createClient } from '@/lib/supabase/server';
import { Flashcard } from '@/lib/data/types';

// Leitner System Intervals (in days)
const BOX_INTERVALS: Record<number, number> = {
    1: 1,
    2: 3,
    3: 7,
    4: 14,
    5: 30
};

export async function getDueFlashcards(limit: number = 20) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('user_flashcards')
        .select(`
            *,
            question:questions(*)
        `)
        .eq('user_id', user.id)
        .lte('next_review_at', now)
        .order('next_review_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error fetching due flashcards:', error);
        return [];
    }

    return data as Flashcard[];
}

export async function updateFlashcard(questionId: string, success: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Get current flashcard state (or create if not exists)
    const { data: existingCard } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .single();

    let newBox = 1;
    if (existingCard) {
        if (success) {
            // Move up a box, max 5
            newBox = Math.min(existingCard.box + 1, 5);
        } else {
            // Reset to box 1 on failure
            newBox = 1;
        }
    } else {
        // New card starts at box 1 (if success) or stays at 0/1 logic?
        // Usually if we answer correctly for the first time, it goes to box 2?
        // Let's say default is Box 1 interval.
        newBox = success ? 2 : 1;
    }

    // Calculate next review date
    const intervalDays = BOX_INTERVALS[newBox] || 1;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);

    const matchData = {
        user_id: user.id,
        question_id: questionId
    };

    const updateData = {
        box: newBox,
        next_review_at: nextReview.toISOString(),
        last_reviewed_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('user_flashcards')
        .upsert({ ...matchData, ...updateData });

    if (error) {
        console.error('Error updating flashcard:', error);
        throw error;
    }

    return { newBox, nextReview };
}
