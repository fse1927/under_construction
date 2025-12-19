
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

    // 2. Insert into 'interviews' table
    // Note: Assuming 'interviews' table exists. 
    // Since I cannot execute SQL DDL directly via JS client easily without a stored procedure or SQL editor,
    // I will try to use the standard insert. If the table doesn't exist, this will fail.
    // Ideally, the user should run SQL. 
    // However, I can use the 'rpc' workaround if I had a function, or I rely on the user to have created the table.
    // Ref: "creer une table interview" -> Request to ME to create it.
    // I don't have direct SQL execution tool. 
    // BUT I can try to use Supabase Dashboard or asked user? 
    // Wait, the agent has 'run_command'. I can't run SQL via CLI unless I have psql installed.
    // I DO NOT have psql. 
    // WORKAROUND: I will assume I can't create the table precisely via script unless I have privileges.
    // But usually I can just create it if I had a 'migrations' folder or similar.
    // Since I don't have migration tool, I will instruct the USER (via notify or console log) OR
    // I can try to just insert and see.
    // ACTUALLY, I will use a clever trick: I'll use the 'questions' table structure as reference.

    // WAIT. I CANNOT create a table via the JS Client.
    // I must ask the user to create it OR if I have a mechanism.
    // The user asked ME "creer une table". 
    // Options:
    // A. I tell user "Please run this SQL query".
    // B. I assume it's already there (risky).

    // Let's look at `lib/supabase/admin.ts`.

    // I will CREATE A FILE `supabase/migrations/create_interviews_table.sql` and ask user to run it?
    // OR I can use the `postgres` library if installed? No.

    // Alternative: The user might have a `supabase` CLI setup?
    // Checking file list... No obvious `supabase/migrations`.

    // Decision: I will create a SQL file with the table definition and ask the user to execute it in their Supabase SQL Editor.
    // This is the standard safe way when direct DB access is limited.

    const migrationSQL = `
    CREATE TABLE IF NOT EXISTS public.interviews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        theme TEXT DEFAULT 'Divers',
        difficulty TEXT DEFAULT 'moyen',
        options TEXT[], -- Even interviews might have generated options? User said "supprime 4eme option" for interviews. So yes, keep options.
        explanation TEXT,
        importance INTEGER DEFAULT 1,
        source TEXT,
        metadata JSONB
    );

    -- Enable Row Level Security
    ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

    -- Create Policy for public read access
    CREATE POLICY "Public read access" ON public.interviews
        FOR SELECT TO anon USING (true);
        
    -- Create Policy for service role full access
    CREATE POLICY "Service role full access" ON public.interviews
        USING (auth.role() = 'service_role');
    `;

    console.log("----------------------------------------------------------------");
    console.log("PLEASE EXECUTE THE FOLLOWING SQL IN YOUR SUPABASE SQL EDITOR:");
    console.log("----------------------------------------------------------------");
    console.log(migrationSQL);
    console.log("----------------------------------------------------------------");

    // I will simulate the migration by writing the SQL to a file and notifying the user.
}

migrateInterviews();
