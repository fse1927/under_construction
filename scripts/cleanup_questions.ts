
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupQuestions() {
    console.log('Starting cleanup of migrated interview questions...');

    // Delete questions where type = 'interview' from 'questions' table
    const { data, error, count } = await supabase
        .from('questions')
        .delete({ count: 'exact' })
        .eq('type', 'interview');

    if (error) {
        console.error('Error deleting questions:', error);
        return;
    }

    console.log(`Successfully deleted ${count} interview questions from 'questions' table.`);
}

cleanupQuestions();
