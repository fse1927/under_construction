
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verify() {
    console.log('🔍 Checking database...');
    const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log(`✅ Total Questions in DB: ${count}`);
    }
}

verify();
