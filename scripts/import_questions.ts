
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Question } from '../lib/data/types';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST use Service Role for mass inserts/updates

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FILE_PATH = path.join(process.cwd(), 'public', 'QA_plus.txt');

interface CSVRow {
    id: string; // "QA000001" - we might ignore this if using serial, or store in metadata
    theme: string;
    type: string;
    question: string;
    answer: string;
    options: string; // JSON string
    explanation: string;
}

// Regex to parse detailed CSV line
// Matches: id, theme, type, question, answer, "options", "explanation" (explanation might be quoted)
// This regex is slightly fragile but tailored to the specific file format observed.
// Format observed: 
// QA000001,Symboles,quiz,Quelle est...,14 juillet,"[""A"",""B""]","La fête..."
const CSV_REGEX = /^([^,]+),([^,]+),([^,]+),(.+?),(.*?),("\[.*\]"),(".*"|.*)$/;

async function importQuestions() {
    console.log(`📖 Reading ${FILE_PATH}...`);

    try {
        const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
        const lines = fileContent.split('\n');
        const validQuestions: any[] = [];
        let skipped = 0;

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple split won't work due to commas in quotes.
            // Let's use a smarter regex or a simple parser state machine.
            // Since we don't have a library, let's try a split/rejoin approach or just match.

            // Actually, for this specific file, we can see "options" is always quoted JSON like "[""A"",""B""]".
            // Explanation is quoted.
            // Let's try to parse manually.

            const matches = parseCSVLine(line);

            if (!matches) {
                console.warn(`⚠️ Could not parse line ${i + 1}: ${line.substring(0, 50)}...`);
                skipped++;
                continue;
            }

            const [rawId, rawTheme, rawType, rawQuestion, rawAnswer, rawOptions, rawExplanation] = matches;

            try {
                // Fix double quotes in JSON string from CSV export (e.g. "[""A""]" -> ["A"])
                const cleanOptionsStr = rawOptions.replace(/^"|"$/g, '').replace(/""/g, '"');
                const options = JSON.parse(cleanOptionsStr);

                // Clean explanation
                let explanation = rawExplanation;
                if (explanation.startsWith('"') && explanation.endsWith('"')) {
                    explanation = explanation.slice(1, -1);
                }
                explanation = explanation.replace(/""/g, '"'); // Unescape quotes

                // Determine difficulty based on theme or random for now (default 'moyen')
                // We could analyze length or keywords, but let's stick to default.

                validQuestions.push({
                    question: rawQuestion,
                    answer: rawAnswer,
                    options: options, // This will map to 'other_answers_false' or 'options' column depending on schema
                    theme: rawTheme,
                    type: rawType,
                    explanation: explanation,
                    difficulty: 'moyen',
                    source: 'Antigravity Init',
                    metadata: { original_id: rawId }
                });

            } catch (err) {
                console.error(`❌ Error parsing row ${i + 1}:`, err);
                skipped++;
            }
        }

        console.log(`✅ Parsed ${validQuestions.length} questions. Skipped ${skipped}.`);

        if (validQuestions.length === 0) {
            console.error("❌ No valid questions found.");
            return;
        }

        // Batch insert
        // Note: we renamed columns in schema update to 'answer', 'options'
        const { error } = await supabase.from('questions').upsert(validQuestions, {
            onConflict: 'question', // Avoid duplicates based on question text
            ignoreDuplicates: false
        });

        if (error) {
            console.error('❌ Supabase Insert Error:', error);
            // Fallback: The column renaming might not have happened.
            console.log('🔄 Trying fallback with old column names (reponse_correcte)...');
            const fallbackQuestions = validQuestions.map(q => ({
                question: q.question,
                reponse_correcte: q.answer,
                autres_reponses_fausses: q.options,
                theme: q.theme,
                explanation: q.explanation // This column MUST exist
            }));
            const { error: error2 } = await supabase.from('questions').upsert(fallbackQuestions, { onConflict: 'question' });
            if (error2) console.error('❌ Fallback failed too:', error2);
            else console.log('✅ Fallback insert successful!');
        } else {
            console.log('✅ Batch insert successful into `questions` table.');
        }

    } catch (e) {
        console.error('❌ Script failed:', e);
    }
}

// Simple CSV Parser handling quoted segments
function parseCSVLine(text: string): string[] | null {
    const result: string[] = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            inQuote = !inQuote;
        }

        if (char === ',' && !inQuote) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    // We expect 7 columns: id, theme, type, question, answer, options, explanation
    if (result.length < 7) return null;
    return result;
}

importQuestions();
