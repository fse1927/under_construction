import { ExamMode } from '@/components/quiz/ExamMode'
import { getRandomQuizQuestions } from '@/lib/actions/questions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Examen Blanc | Réussite France Citoyen',
    description: 'Simulez l&apos;entretien officiel : 50 questions, 30 minutes, conditions réelles.',
}

export default async function ExamPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Exam Config: 50 Questions
    // We can tweak quotas here if needed (e.g., 20 Easy, 20 Medium, 10 Hard)
    // For now, let's use a standard mix.
    const questions = await getRandomQuizQuestions(50)

    // Fallback if not enough questions
    if (!questions || questions.length < 50) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Base de questions en cours de construction</h1>
                <p className="text-gray-500 mb-6 max-w-md">
                    Nous n&apos;avons pas encore assez de questions (50) pour générer un examen complet.
                    Revenez un peu plus tard !
                </p>
                <Link href="/apprendre">
                    <Button>Retour à l&apos;apprentissage</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200 uppercase">Mode Examen</span>
                        <h1 className="font-bold text-gray-900 dark:text-white hidden sm:block">Entretien de Naturalisation</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <ExamMode questions={questions} />
            </main>
        </div>
    )
}
