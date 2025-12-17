'use server';

import { createClient } from '@/lib/supabase/server';

export interface AdjacentQuestions {
    prevId: string | null;
    nextId: string | null;
    currentPosition: number;
    totalQuestions: number;
}

/**
 * Get the previous and next question IDs for navigation.
 * Questions are ordered by id (QAXXXXXX format) to maintain consistent ordering.
 */
export async function getAdjacentQuestions(currentId: string): Promise<AdjacentQuestions> {
    const supabase = await createClient();

    // Get all quiz question IDs ordered by id (same filter as list page)
    const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('id')
        .eq('type', 'quiz')
        .order('id', { ascending: true });

    if (error || !allQuestions || allQuestions.length === 0) {
        console.error('Error fetching question IDs:', error);
        return {
            prevId: null,
            nextId: null,
            currentPosition: 0,
            totalQuestions: 0
        };
    }

    // IDs are now strings (QAXXXXXX format)
    const ids = allQuestions.map(q => String(q.id));
    const currentIdStr = String(currentId);
    const currentIndex = ids.findIndex(id => id === currentIdStr);

    if (currentIndex === -1) {
        // If not found, fallback to first question
        console.log('Current ID not found:', currentIdStr, 'in list of', ids.length, 'questions');
        return {
            prevId: ids.length > 0 ? ids[0] : null,
            nextId: ids.length > 1 ? ids[1] : null,
            currentPosition: 1,
            totalQuestions: ids.length
        };
    }

    return {
        prevId: currentIndex > 0 ? ids[currentIndex - 1] : null,
        nextId: currentIndex < ids.length - 1 ? ids[currentIndex + 1] : null,
        currentPosition: currentIndex + 1,
        totalQuestions: ids.length
    };
}
