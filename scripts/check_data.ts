
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkInterviews() {
    const { count, error } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error checking interviews:', error);
    } else {
        console.log(`Total rows in 'interviews' (Admin Check): ${count}`);
    }
}

checkInterviews();
