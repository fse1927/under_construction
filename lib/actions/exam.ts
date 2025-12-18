'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addXp } from './gamification'

type UserAnswer = {
    questionId: string;
    selectedOption: string;
}

export async function submitExam(userAnswers: UserAnswer[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // 1. Fetch correct answers securely
    const questionIds = userAnswers.map(a => a.questionId)
    const { data: questions, error } = await supabase
        .from('questions')
        .select('id, answer, theme')
        .in('id', questionIds)

    if (error || !questions) throw new Error('Failed to fetch questions')

    // 2. Calculate Score
    let correctCount = 0
    const mistakes: { id: string; question: string; correctAnswer: string; userAnswer: string }[] = []

    questions.forEach(q => {
        const userAnswer = userAnswers.find(a => a.questionId === q.id)
        if (userAnswer && userAnswer.selectedOption === q.answer) {
            correctCount++
        } else {
            // Store mistake for history/review (simplified for now as JSONB)
            mistakes.push({
                id: q.id,
                question: 'Question content not stored here', // Optim: Don't duplicate text in history
                correctAnswer: q.answer,
                userAnswer: userAnswer?.selectedOption || 'No answer'
            })
        }
    })

    const scorePercent = Math.round((correctCount / questions.length) * 100)
    const passed = scorePercent >= 70 // 35/50 for success

    // 3. Save Result
    const { error: insertError } = await supabase
        .from('historique_tests')
        .insert({
            user_id: user.id,
            score_pourcentage: scorePercent,
            date_test: new Date().toISOString(),
            questions_manquees: mistakes // Storing mistakes as JSONB for now
        })

    if (insertError) {
        console.error('Error saving exam result:', insertError)
        throw new Error('Failed to save exam result')
    }

    // 4. Award XP + Bonus if Passed
    // Base XP: 1 XP per correct answer
    // Bonus: 50 XP if passed
    let xpEarned = correctCount
    if (passed) {
        xpEarned += 50
    }

    // We can fire and forget this or wait for it
    await addXp(xpEarned)

    revalidatePath('/profil')

    return {
        success: true,
        score: scorePercent,
        passed,
        correctCount,
        totalQuestions: questions.length,
        xpEarned: xpEarned
    }
}
