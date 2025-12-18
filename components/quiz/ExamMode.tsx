'use client'

import { useState, useEffect, useCallback } from 'react'
import { Question } from '@/lib/data/types'
import { submitExam } from '@/lib/actions/exam'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Timer, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'

interface ExamModeProps {
    questions: Question[]
}

export function ExamMode({ questions }: ExamModeProps) {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            // Convert answers map to array for server action
            const userAnswers = Object.entries(answers).map(([qId, opt]) => ({
                questionId: qId,
                selectedOption: opt
            }))

            const res = await submitExam(userAnswers)
            setResult(res)

            if (res.passed) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                })
            }
        } catch (error) {
            console.error('Exam submission failed:', error)
            alert("Une erreur est survenue lors de l'envoi de l'examen. Veuillez réessayer.")
            setIsSubmitting(false)
        }
    }, [answers, isSubmitting])

    // Timer Logic
    useEffect(() => {
        if (result) return // Stop timer if finished

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit() // Auto-submit
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [result])

    const handleOptionSelect = (option: string) => {
        setAnswers(prev => ({
            ...prev,
            [questions[currentIndex].id]: option
        }))
    }

    // Format Time 00:00
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const currentQuestion = questions[currentIndex]
    const isLastQuestion = currentIndex === questions.length - 1
    const progress = ((currentIndex + 1) / questions.length) * 100

    if (result) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="text-center p-8 bg-white dark:bg-slate-900 border-none shadow-xl">
                    <div className="flex flex-col items-center gap-4">
                        {result.passed ? (
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                        )}

                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            {result.passed ? 'Félicitations !' : 'Examen Non Validé'}
                        </h2>

                        <div className="text-5xl font-black text-primary my-4">
                            {result.score}%
                        </div>

                        <p className="text-gray-500 max-w-md">
                            Vous avez obtenu {result.correctCount} bonnes réponses sur {result.totalQuestions}.
                            {result.passed
                                ? " Vous avez les connaissances nécessaires pour réussir l'entretien !"
                                : " Il faut encore réviser un peu. Courage, la persévérance est la clé !"}
                        </p>

                        {result.passed && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 font-bold flex items-center gap-2">
                                <span>🏆 +{result.xpEarned} XP Gagnés</span>
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <Button onClick={() => router.push('/profil')} variant="outline">
                                Retour au profil
                            </Button>
                            <Button onClick={() => router.push('/apprendre')}>
                                Continuer à réviser
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto min-h-[80vh] flex flex-col justify-center">
            {/* Header: Timer & Progress */}
            <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-xl">
                    <Timer className="w-6 h-6" />
                    <span className={timeLeft < 60 ? 'animate-pulse' : ''}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-bold uppercase">Question</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                        {currentIndex + 1} / {questions.length}
                    </span>
                </div>
            </div>

            {/* Question Card */}
            <Card className="border-none shadow-lg overflow-hidden dark:bg-slate-900">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <CardContent className="p-6 sm:p-10 space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                        {currentQuestion.question}
                    </h2>

                    <div className="grid gap-3">
                        {currentQuestion.options.map((option, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleOptionSelect(option)}
                                className={`
                                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 group
                                    ${answers[currentQuestion.id] === option
                                        ? 'border-primary bg-blue-50/50 dark:border-primary dark:bg-blue-900/20'
                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'
                                    }
                                `}
                            >
                                <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors
                                    ${answers[currentQuestion.id] === option
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-gray-300 text-gray-300 group-hover:border-gray-400 group-hover:text-gray-400'
                                    }
                                `}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className={`font-medium ${answers[currentQuestion.id] === option ? 'text-primary dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {option}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 px-2">
                <Button
                    variant="ghost"
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0 || isSubmitting}
                    className="text-gray-400 hover:text-gray-600"
                >
                    Question précédente
                </Button>

                {isLastQuestion ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg shadow-lg shadow-green-200 dark:shadow-none"
                    >
                        {isSubmitting ? 'Envoi...' : 'Terminer l\'examen'}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={!answers[currentQuestion.id]} // Force answer? Maybe optional in standard exam but good for metrics
                        className="px-6 gap-2"
                    >
                        Suivante <ArrowRight className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Warning if unanswered */}
            {isLastQuestion && Object.keys(answers).length < questions.length && (
                <div className="mt-4 flex items-center justify-center gap-2 text-orange-500 text-sm bg-orange-50 p-2 rounded-lg border border-orange-100 max-w-md mx-auto">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Attention : Vous n&apos;avez pas répondu à toutes les questions.</span>
                </div>
            )}
        </div>
    )
}
