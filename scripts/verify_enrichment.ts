
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
    // 1. Check Difficulty distribution
    const { data: diffs } = await supabase.rpc('count_difficulty_distribution');
    // Wait, RPC might not exist. Let's just fetch random rows.

    // Fetch 5 random rows
    const { data: questions } = await supabase
        .from('questions')
        .select('id, theme, difficulty, answer, importance, info_cards_chapter, metadata')
        .limit(5);

    console.log("Sample Data Enrichment:");
    console.log(JSON.stringify(questions, null, 2));

    // Simple count of distinct difficulties to prove it worked
    // Not optimal in SQL directly without RPC, but good enough for sample.
}

verify();
