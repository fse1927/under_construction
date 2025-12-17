import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const diagnostics: Record<string, any> = {};

    // Check env vars exist (don't expose values)
    diagnostics.env = {
        SUPABASE_URL_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        // Show first few chars to verify it's not empty/wrong
        SUPABASE_URL_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    };

    try {
        const supabase = await createClient();

        // Test simple query
        const result = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true });

        diagnostics.supabase = {
            connected: !result.error,
            error: result.error ? JSON.stringify(result.error) : null,
            status: result.status,
            statusText: result.statusText,
            questionCount: result.count,
        };
    } catch (e: any) {
        diagnostics.supabase = {
            connected: false,
            caughtError: e.message,
            stack: e.stack?.substring(0, 500),
        };
    }

    return NextResponse.json(diagnostics);
}
