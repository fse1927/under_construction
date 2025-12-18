
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('Loaded keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
