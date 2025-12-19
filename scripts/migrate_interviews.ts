
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateInterviews() {
    console.log('Starting migration of interview questions...');

    // 1. Fetch existing interview questions
    const { data: questions, error: fetchError } = await supabase
        .from('questions')
        .select('*')
        .eq('type', 'interview');

    if (fetchError) {
        console.error('Error fetching questions:', fetchError);
        return;
    }

    if (!questions || questions.length === 0) {
        console.log('No interview questions found to migrate.');
        return;
    }

    console.log(`Found ${questions.length} interview questions.`);

    // 2. Prepare data for 'interviews' table
    // Removing 'id' to let the new table generate new UUIDs, OR keeping them?
    // It's safer to let the new table generate IDs or keep same if strictly needed,
    // but usually moving to a new table implies new IDs is fine unless referenced elsewhere.
    // They are referenced in logical way (App page) but not by foreign key in this simple app likely.
    // I'll keep them if possible to preserve history, but `questions` table might have different ID sequence.
    // Let's copy relevant fields.

    // Note: The new table schema matches the fields we used.

    let successCount = 0;

    for (const q of questions) {
        const payload = {
            question: q.question,
            answer: q.answer,
            theme: q.theme,
            difficulty: q.difficulty,
            options: q.options || [],
            explanation: q.explanation,
            importance: q.importance || 1,
            source: q.source,
            metadata: q.metadata
        };

        const { error: insertError } = await supabase
            .from('interviews')
            .insert(payload);

        if (insertError) {
            console.error(`Failed to insert question ${q.id}:`, insertError);
        } else {
            successCount++;
        }
    }

    console.log(`Successfully migrated ${successCount} / ${questions.length} questions.`);

    // 3. Verify
    const { count } = await supabase.from('interviews').select('*', { count: 'exact', head: true });
    console.log(`Total rows in 'interviews' table: ${count}`);
}

migrateInterviews();
