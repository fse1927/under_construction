
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateOptions() {
    console.log('Fetching interview questions...');

    // Fetch all interview questions that have no options (or empty array)
    // Actually fetches ALL to build the pool of answers
    const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('*');

    if (error || !allQuestions) {
        console.error('Error fetching questions:', error);
        return;
    }

    const interviewQuestions = allQuestions.filter(q => q.type === 'interview');
    console.log(`Found ${interviewQuestions.length} interview questions.`);

    for (const q of interviewQuestions) {
        // Skip if already populated properly (e.g. has 4 options)
        if (q.options && q.options.length >= 4) continue;

        const normalize = (s: string) => s.trim().toLowerCase();

        // Generate options logical
        // 1. Current Answer
        // 2. 3 Distractors from other questions (preferably same theme)

        const potentialDistractors = allQuestions
            .filter(other => other.id !== q.id && normalize(other.answer) !== normalize(q.answer))
            .map(d => d.answer);

        const uniqueDistractors = Array.from(new Set(potentialDistractors));

        const sameThemeDistractors = uniqueDistractors.filter(ans => {
            const org = allQuestions.find(d => d.answer === ans);
            return org?.theme === q.theme;
        });

        let selectedDistractors = [];
        if (sameThemeDistractors.length >= 3) {
            selectedDistractors = sameThemeDistractors.sort(() => 0.5 - Math.random()).slice(0, 3);
        } else {
            const remaining = 3 - sameThemeDistractors.length;
            const others = uniqueDistractors.filter(d => !sameThemeDistractors.includes(d));
            selectedDistractors = [
                ...sameThemeDistractors,
                ...others.sort(() => 0.5 - Math.random()).slice(0, remaining)
            ];
        }

        // Fillers if needed
        const fillers = ["Je ne sais pas", "Aucune des réponses", "Autre réponse"];
        let fIdx = 0;
        while (selectedDistractors.length < 3) {
            const filler = fillers[fIdx % fillers.length];
            if (!selectedDistractors.includes(filler)) selectedDistractors.push(filler);
            fIdx++;
        }

        // Combine
        const finalOptions = [q.answer, ...selectedDistractors].sort(() => 0.5 - Math.random());

        // Update DB
        const { error: updateError } = await supabase
            .from('questions')
            .update({ options: finalOptions })
            .eq('id', q.id);

        if (updateError) {
            console.error(`Failed to update ${q.id}:`, updateError);
        } else {
            console.log(`Updated question ${q.id} with ${finalOptions.length} options.`);
        }
    }
    console.log('Done.');
}

populateOptions();
