'use server';

import { createClient } from '@/lib/supabase/server';
import { UserStats } from '@/lib/types';

// ... (existing code: markModuleAsLearned, isModuleLearned, getUserStats, getUserProgressList, getGlobalProgress)

// New: wrapper for client-side marking of questions
export async function markQuestionAsLearned(questionId: string) {
    return markModuleAsLearned(questionId);
}

export async function getParcoursQuestions(level: string, limit: number = 10) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Get learned IDs first
    const learnedIds = await getUserProgressList();

    // V2: Robust Fetching Strategy
    // 1. Try to fetch questions for the specific level
    // 2. If not enough, fallback to 'moyen' (default) or 'facile' to ensure user has content

    // Helper to fetch questions with loose difficulty
    const fetchQuestions = async (targetLevel: string) => {
        const query = supabase
            .from('questions')
            .select('*')
            .eq('type', 'quiz');

        // If searching for facile but it's empty, we might want to return everything
        // But let's try strict first
        if (targetLevel !== 'any') {
            query.ilike('difficulty', targetLevel);
        }

        return query;
    };

    let { data: questions } = await fetchQuestions(level);

    // FALLBACK: If requested level is empty (e.g. 'facile' but all data is 'moyen' by default), fetch ANY quiz questions
    // This ensures the user is never blocked.
    if (!questions || questions.length === 0) {
        console.log(`Level ${level} empty, falling back to all questions`);
        const { data: allQuestions } = await supabase
            .from('questions')
            .select('*')
            .eq('type', 'quiz')
            .limit(50); // Fetch a batch to pick from
        questions = allQuestions;
    }

    if (!questions) return [];

    // Filter out learned ones
    // We check for reponse_correcte OR answer (some legacy data might vary)
    const unlearned = questions.filter(q =>
        !learnedIds.includes(q.id.toString())
    );

    // Fetch a pool of random answers to serve as distractors
    const { data: randomAnswers } = await supabase
        .from('questions')
        .select('reponse_correcte, answer')
        .limit(50);

    // Extract potential answers from either column
    const distractorPool = (randomAnswers?.map((r: any) => r.reponse_correcte || r.answer) || []).filter(Boolean);

    // Fallback pool hardcoded
    const backupDistractors = [
        "1789", "La Marseillaise", "Liberté, Égalité, Fraternité", "Marianne",
        "Le Président de la République", "L'Assemblée Nationale", "Le Sénat",
        "18 ans", "Bleu, Blanc, Rouge", "Le Premier Ministre",
        "La Déclaration des Droits de l'Homme", "Charles de Gaulle", "Le Coq",
        "Le 14 juillet", "La laïcité", "Victor Hugo", "Marie Curie"
    ];

    if (distractorPool.length < 10) {
        distractorPool.push(...backupDistractors);
    }

    // Shuffle and limit, then fill missing options
    const processedQuestions = unlearned.map(q => {
        // Normalize correct answer
        const correct = q.reponse_correcte || q.answer;

        // If still no correct answer, skip this question later
        if (!correct || correct.trim() === '') return null;

        let options = (q.autres_reponses_fausses || []);

        // Ensure options is an array
        if (!Array.isArray(options)) options = [];

        // Filter empty strings
        options = options.filter((o: any) => typeof o === 'string' && o.trim() !== '');

        const needed = 3;

        if (options.length < needed) {
            const potential = distractorPool.filter(a =>
                a !== correct &&
                !options.includes(a)
            );

            const shuffled = potential.sort(() => 0.5 - Math.random());
            options = [...options, ...shuffled.slice(0, needed - options.length)];
        }

        // Ensure strictly 3
        options = options.slice(0, needed);

        return {
            ...q,
            reponse_correcte: correct,
            autres_reponses_fausses: options
        };
    });

    // Remove nulls and return valid set
    return processedQuestions
        .filter(Boolean)
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
}

export async function markModuleAsLearned(moduleId: string) {
    const supabase = await createClient();
    // Using simple auth check via supabase
    const { data: { user } = {} } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('user_progress')
        .upsert({
            user_id: user.id,
            module_id: moduleId,
            learned_at: new Date().toISOString()
        }, { onConflict: 'user_id, module_id' });

    if (error) {
        console.error('Error marking module as learned:', error);
        return { error: 'Failed to save progress' };
    }

    // STREAK LOGIC
    // Check if user already studied today
    const { count } = await supabase
        .from('user_activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('activity_date', new Date().toISOString().split('T')[0]);

    if (!count || count === 0) {
        // First activity of the day
        await supabase
            .from('user_activity_log')
            .insert({ user_id: user.id, activity_type: 'learning' });

        // Update streak
        // Simple implementation: fetch last streak update
        // (For MVP, we can rely on a dedicated streaks table or just count consecutive days in logs,
        // but let's assume a 'profiles' or 'user_progress_summary' table is best. 
        // For now, let's just log the activity to enable calculation.)
    }

    return { success: true };
}

export async function getDailyStreak() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Calculate streak from activity logs
    // efficient recursive CTE is best, but for MVP JS calculation:
    const { data: logs } = await supabase
        .from('user_activity_log')
        .select('activity_date')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(30);

    if (!logs || logs.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const uniqueDates = Array.from(new Set(logs.map(l => l.activity_date?.split('T')[0])));

    // Check if studied today
    if (uniqueDates.includes(today)) {
        streak = 1;
    }

    // Check backwards
    const currentCheck = new Date();
    if (streak === 1) {
        // If studied today, check from yesterday backwards
        currentCheck.setDate(currentCheck.getDate() - 1);
    }
    // If not studied today, streak is 0? Or do we allow "active streak" even if not done today yet?
    // Usually "current streak" implies consecutive days up to now. 
    // If I studied yesterday but not today, my streak is still alive but pending today.

    // Re-logic:
    // If last date is today: streak is at least 1 + backwards
    // If last date is yesterday: streak is backwards (alive)
    // If last date is older: streak is 0.

    const lastDate = uniqueDates[0]; // most recent because descending sort

    if (!lastDate) return 0;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const lastActivityDate = new Date(lastDate);
    lastActivityDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(todayDate.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return 0; // Streak broken

    // Count consecutive
    streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);

        const diff = (prev.getTime() - curr.getTime()) / (1000 * 3600 * 24);
        if (Math.round(diff) === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

export async function isModuleLearned(moduleId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

    return !!data;
}

export async function getUserStats(): Promise<UserStats> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            totalTests: 0,
            avgScore: 0,
            history: []
        };
    }

    // Fetch history
    const { data: history, error } = await supabase
        .from('historique_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('date_test', { ascending: false });

    if (error || !history) {
        return { totalTests: 0, avgScore: 0, history: [] };
    }

    const totalTests = history.length;
    const avgScore = totalTests > 0
        ? Math.round(history.reduce((acc, curr) => acc + curr.score_pourcentage, 0) / totalTests)
        : 0;

    return {
        totalTests,
        avgScore,
        history: history.map(h => ({
            score_pourcentage: h.score_pourcentage,
            date_test: h.date_test
        }))
    };
}

export async function getUserProgressList() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data } = await supabase
            .from('user_progress')
            .select('module_id')
            .eq('user_id', user.id);

        return (data || []).map(row => row.module_id);
    } catch (e) {
        console.error('getUserProgressList error:', e);
        return [];
    }
}

export async function getGlobalProgress() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Count learnt
    const { count: learntCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Count total (from questions/content)
    // Assuming 'questions' table holds the learning content
    const { count: totalCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'quiz'); // Only count quiz/learning items

    if (!totalCount) return 0;

    return Math.round(((learntCount || 0) / totalCount) * 100);
}
