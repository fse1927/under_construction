
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importQuestions() {
    const filePath = path.join(process.cwd(), 'public', 'QE.txt');

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    let currentTheme = 'Général';
    const questionsToInsert = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Detect Theme
        if (trimmedLine.startsWith('Thématique')) {
            // Extract theme name. Format: "Thématique 1 : Motivations et Intégration (20 questions)"
            // We want "Motivations et Intégration"
            const match = trimmedLine.match(/Thématique \d+ : (.+?) \(/);
            if (match && match[1]) {
                currentTheme = match[1].trim();
                console.log(`Detected Theme: ${currentTheme}`);
            } else {
                // Fallback if regex doesn't match perfectly, take everything after colon
                const parts = trimmedLine.split(':');
                if (parts.length > 1) {
                    currentTheme = parts[1].split('(')[0].trim();
                    console.log(`Detected Theme (fallback): ${currentTheme}`);
                }
            }
            continue;
        }

        // Detect Question
        // Format: "Question ? : Réponse."
        // We look for the first colon ":" which separates question and answer.
        // Some questions might have a colon inside? The format seems consistent with " : "
        const separatorIndex = trimmedLine.indexOf(' : ');

        if (separatorIndex !== -1) {
            const questionText = trimmedLine.substring(0, separatorIndex).trim();
            let answerText = trimmedLine.substring(separatorIndex + 3).trim();

            questionsToInsert.push({
                question: questionText,
                answer: answerText,
                theme: currentTheme,
                type: 'interview',  // Specified by user
                difficulty: 'moyen', // Default
                importance: 1,
                options: [], // Empty for interview
                source: 'QE.txt'
            });
        }
    }

    console.log(`Parsed ${questionsToInsert.length} questions.`);

    if (questionsToInsert.length === 0) {
        console.log('No questions found to insert.');
        return;
    }

    // Insert in batches
    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
        const batch = questionsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('questions').insert(batch);

        if (error) {
            console.error('Error inserting batch:', error);
        } else {
            insertedCount += batch.length;
            console.log(`Inserted ${insertedCount} / ${questionsToInsert.length} questions.`);
        }
    }

    console.log('Import completed.');
}

importQuestions().catch(console.error);
