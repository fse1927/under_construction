'use server';

import { createClient } from '@/lib/supabase/server';
import { Question } from '@/lib/data/types';

export type QuestionsFilter = {
    theme?: string;
    chapter?: string; // For Info Cards
    search?: string;
    difficulty?: string;
};

export async function getQuestions(
    filter: QuestionsFilter = {},
    page: number = 1,
    limit: number = 20
) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('questions')
            .select('*', { count: 'exact' })
            .eq('type', 'quiz');

        if (filter.theme) {
            query = query.eq('theme', filter.theme);
        }

        if (filter.difficulty) {
            query = query.eq('difficulty', filter.difficulty);
        }

        if (filter.chapter) {
            query = query.eq('info_cards_chapter', filter.chapter);
        }

        // Simple search on question text
        if (filter.search) {
            query = query.ilike('question', `%${filter.search}%`);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await query
            .range(from, to)
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching questions:', error);
            return {
                questions: [],
                total: 0,
                page,
                totalPages: 0
            };
        }

        return {
            questions: data as any[], // Cast to Question type after fixing types
            total: count || 0,
            page,
            totalPages: count ? Math.ceil(count / limit) : 0
        };
    } catch (e) {
        console.error('getQuestions error:', e);
        return {
            questions: [],
            total: 0,
            page,
            totalPages: 0
        };
    }
}

export async function getInterviewQuestions(userSituation?: string) {
    const supabase = await createClient();

    const { data: questions, error } = await supabase
        .from('interviews')
        .select('*');

    if (error) {
        console.error('Error fetching interview questions:', error);
        return [];
    }

    if (!userSituation) {
        return questions;
    }

    // Weighting/Sorting Logic
    // Prioritize questions where metadata->required_for contains userSituation
    const sortedDetails = questions.sort((a, b) => {
        const requiredA = (a.metadata as any)?.required_for || [];
        const requiredB = (b.metadata as any)?.required_for || [];

        const aMatches = requiredA.includes(userSituation.toLowerCase());
        const bMatches = requiredB.includes(userSituation.toLowerCase());

        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
    });

    return sortedDetails;
}

export async function getRandomQuizQuestions(limit: number = 10) {
    const supabase = await createClient();

    // Postgres 'random()' ordering via Supabase can be tricky without RPC.
    // A simple approach for small datasets is to fetch IDs, shuffle, then fetch details.
    // Or just fetch a larger chunk and shuffle in memory if dataset is small (<1000).
    // Our dataset is ~1000. Fetching all IDs is cheap.

    // 1. Fetch all IDs with their difficulty
    const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('id, difficulty')
        .in('type', ['quiz', 'interview']);

    if (error || !allQuestions || allQuestions.length === 0) {
        console.error('Error fetching question IDs:', error);
        return [];
    }

    // 2. Group by difficulty
    const buckets: Record<string, number[]> = {
        facile: [],
        moyen: [],
        difficile: []
    };

    allQuestions.forEach(q => {
        // Normalize difficulty to lower case and handle nulls/unknowns as 'moyen'
        const diff = (q.difficulty || 'moyen').toLowerCase();
        if (buckets[diff]) {
            buckets[diff].push(q.id);
        } else {
            buckets['moyen'].push(q.id);
        }
    });

    // 3. Define Quotas (approximate counts)
    const totalNeeded = limit;
    const quotas = {
        facile: Math.round(totalNeeded * 0.30),    // 30%
        moyen: Math.round(totalNeeded * 0.40),     // 40%
        difficile: Math.round(totalNeeded * 0.30)  // 30%
    };

    // Adjust quotas to make sure they sum exactly to totalNeeded
    const currentSum = quotas.facile + quotas.moyen + quotas.difficile;
    const diff = totalNeeded - currentSum;
    if (diff !== 0) {
        quotas.moyen += diff; // Dump remainder into medium
    }

    // 4. Select IDs
    let selectedIds: number[] = [];

    // Helper to pick random N items from an array
    const pickRandom = (arr: number[], n: number) => {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    };

    let deficiency = 0;
    const taken: Record<string, number[]> = {
        facile: [],
        moyen: [],
        difficile: []
    };

    (['facile', 'difficile', 'moyen'] as const).forEach(key => {
        const needed = quotas[key];
        const available = buckets[key];
        const picked = pickRandom(available, needed);
        taken[key] = picked;

        if (picked.length < needed) {
            deficiency += (needed - picked.length);
        }
    });

    if (deficiency > 0) {
        const allRemainingIds: number[] = [];
        (['facile', 'moyen', 'difficile'] as const).forEach(key => {
            const usedIds = new Set(taken[key]);
            const remaining = buckets[key].filter(id => !usedIds.has(id));
            allRemainingIds.push(...remaining);
        });

        const extras = pickRandom(allRemainingIds, deficiency);
        selectedIds = [
            ...taken.facile,
            ...taken.moyen,
            ...taken.difficile,
            ...extras
        ];
    } else {
        selectedIds = [
            ...taken.facile,
            ...taken.moyen,
            ...taken.difficile
        ];
    }

    // Shuffle final selected IDs
    selectedIds = selectedIds.sort(() => 0.5 - Math.random());

    // 5. Fetch full details
    const { data } = await supabase
        .from('questions')
        .select('*')
        .in('id', selectedIds);

    if (!data) return [];

    // 6. Post-process to ensure options exist (Generate distractors if needed)
    // Use the fetched data pool to source distractors
    const processedQuestions = data.map(q => {
        let currentOptions = Array.isArray(q.options) ? [...q.options] : [];
        const normalize = (s: string) => s.trim().toLowerCase();

        // 1. Identify existing distractors (exclude the correct answer)
        let existingDistractors = currentOptions.filter(opt => normalize(opt) !== normalize(q.answer));

        // Deduplicate existing distractors
        existingDistractors = Array.from(new Set(existingDistractors));

        // If we already have 3 or more distractors, pick 3 and we're done
        if (existingDistractors.length >= 3) {
            return {
                ...q,
                options: [q.answer, ...existingDistractors.slice(0, 3)]
            };
        }

        // 2. We need more distractors
        const needed = 3 - existingDistractors.length;

        // Generate candidates from other questions
        const potentialDistractors = data
            .filter(other => other.id !== q.id && normalize(other.answer) !== normalize(q.answer))
            .map(d => d.answer);

        // Filter out candidates that are already in existingDistractors
        const uniqueCandidates = Array.from(new Set(potentialDistractors))
            .filter(cand => !existingDistractors.some(ex => normalize(ex) === normalize(cand)));

        // Prefer same theme
        const sameThemeCandidates = uniqueCandidates.filter(ans => {
            const org = data.find(d => d.answer === ans);
            return org?.theme === q.theme;
        });

        let newDistractors = [];
        if (sameThemeCandidates.length >= needed) {
            newDistractors = sameThemeCandidates.sort(() => 0.5 - Math.random()).slice(0, needed);
        } else {
            // Fill with same theme first, then mixed
            const remainingNeeded = needed - sameThemeCandidates.length;
            const otherCandidates = uniqueCandidates.filter(c => !sameThemeCandidates.includes(c));

            newDistractors = [
                ...sameThemeCandidates,
                ...otherCandidates.sort(() => 0.5 - Math.random()).slice(0, remainingNeeded)
            ];
        }

        // If still not enough, use generic fillers
        const fillers = ["Je ne sais pas", "Aucune des réponses", "Autre réponse"];
        let fillerIdx = 0;
        while (newDistractors.length + existingDistractors.length < 3) {
            const filler = fillers[fillerIdx % fillers.length];
            if (!newDistractors.includes(filler) && !existingDistractors.includes(filler)) {
                newDistractors.push(filler);
            }
            fillerIdx++;
        }

        // 3. Combine everything
        return {
            ...q,
            options: [q.answer, ...existingDistractors, ...newDistractors]
        };
    });

    return processedQuestions.sort(() => 0.5 - Math.random());
}
