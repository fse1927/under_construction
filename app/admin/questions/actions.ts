'use server'

import { createClient } from '@/lib/supabase/server';
import { Question } from '@/lib/data/types';
import { revalidatePath } from 'next/cache';

export async function importQuestions(data: any[]) {
    const supabase = await createClient();

    // Map CSV columns to DB columns
    // CSV headers expected: question, answer, theme, difficulty, options (pipe separated?)

    const questionsToInsert = data.map(row => {
        // Parse options if string "A|B|C" or similar
        let options: string[] = [];
        if (row.options) {
            options = row.options.split('|').map((o: string) => o.trim());
        } else if (row.option1 && row.option2) {
            // Handle case where options are separate columns
            options = [row.option1, row.option2, row.option3, row.option4].filter(Boolean);
        }

        return {
            question: row.question,
            answer: row.answer,
            theme: row.theme || 'Divers',
            difficulty: row.difficulty || 'moyen',
            options: options.length > 0 ? options : [row.answer, 'Autre'], // Fallback
            explanation: row.explanation || '',
            type: 'quiz', // Default
            source: 'import-csv'
        };
    });

    const { error } = await supabase.from('questions').insert(questionsToInsert);

    if (error) {
        console.error('Import error:', error);
        throw new Error('Failed to import questions');
    }

    revalidatePath('/admin/questions');
    return { success: true, count: questionsToInsert.length };
}

export async function upsertQuestion(question: Partial<Question>) {
    const supabase = await createClient();

    const payload: any = { ...question };
    delete payload.created_at; // distinct from editable fields

    let error;
    if (question.id) {
        // Update
        const { error: updateError } = await supabase
            .from('questions')
            .update(payload)
            .eq('id', question.id);
        error = updateError;
    } else {
        // Insert
        const { error: insertError } = await supabase
            .from('questions')
            .insert(payload);
        error = insertError;
    }

    if (error) {
        console.error('Upsert error:', error);
        return { error: 'Failed to save question' };
    }

    revalidatePath('/admin/questions');
    return { success: true };
}

export async function deleteQuestion(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

    if (error) {
        return { error: 'Failed to delete' };
    }

    revalidatePath('/admin/questions');
    return { success: true };
}
