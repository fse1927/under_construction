import { createClient } from '@/lib/supabase/server';
import { ContenuApprentissage } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TextToSpeech from '@/components/TextToSpeech';
import QuestionNavigator from '@/components/QuestionNavigator';
import { getAdjacentQuestions } from '@/lib/actions/getAdjacentQuestions';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Correctly type params as a Promise for Next.js 15+ async params
type PageParams = Promise<{ id: string }>;

interface PageProps {
    params: PageParams;
}

export default async function LearningDetailPage(props: PageProps) {
    // Await params before using them
    const params = await props.params;
    const { id } = params;

    const supabase = await createClient();

    // 1. Fetch from 'questions' table (unified)
    const { data: questionData } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();

    let content: ContenuApprentissage | null = null;

    if (questionData) {
        content = {
            id: questionData.id,
            titre: questionData.question,
            texte_synthese: `${questionData.answer}\n\n💡 ${questionData.explanation || ''}`,
            type_module: questionData.theme, // Map theme to module type
            created_at: questionData.created_at
        };
    }

    if (!content) {
        notFound();
    }

    // 2. Fetch adjacent questions for navigation
    const adjacentQuestions = await getAdjacentQuestions(id);

    const item = {
        title: questionData.question,
        theme: questionData.theme,
        difficulty: questionData.difficulty,
        answer: questionData.answer,
        explanation: questionData.explanation || "Aucune explication détaillée disponible pour le moment.",
        fullText: `${questionData.question}. Réponse : ${questionData.answer}. Explication : ${questionData.explanation || ''}`
    };

    return (
        <div className="p-4 pb-24 max-w-2xl mx-auto">
            <Link href="/apprendre" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Retour aux fiches
            </Link>

            <QuestionNavigator
                currentId={id}
                prevId={adjacentQuestions.prevId}
                nextId={adjacentQuestions.nextId}
                totalQuestions={adjacentQuestions.totalQuestions}
                currentPosition={adjacentQuestions.currentPosition}
            >
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Question */}
                    <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap mt-4">
                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm border border-blue-100">
                                {item.theme}
                            </span>
                            {item.difficulty && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm border
                                    ${item.difficulty === 'facile' ? 'bg-green-50 text-green-700 border-green-100' :
                                        item.difficulty === 'moyen' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                            'bg-red-50 text-red-700 border-red-100'}`}>
                                    {item.difficulty}
                                </span>
                            )}
                        </div>

                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight tracking-tight">
                            {item.title}
                        </h1>

                        <div className="flex items-center justify-between pt-2">
                            <div className="text-sm text-gray-500 font-medium">Écouter la fiche</div>
                            <TextToSpeech text={item.fullText} />
                        </div>
                    </div>

                    {/* Section Réponse (Mise en avant - Vert Clair) */}
                    <div className="relative overflow-hidden rounded-2xl bg-green-50 border border-green-200 text-green-900 shadow-sm">
                        <div className="relative p-6 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-200 rounded-xl shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-700"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wider">Réponse</h2>
                                    <p className="text-lg sm:text-2xl font-bold text-green-900 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Explication (Détails) */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 relative mb-4">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="shrink-0 flex sm:block justify-center">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl inline-block">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14.5v-3.5"></path><path d="M12 14v4"></path><path d="M8 14v3"></path><path d="M16 14v3"></path></svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                </div>
                            </div>
                            <div className="space-y-4 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Comprendre & Retenir
                                </h2>
                                <div className="prose prose-sm sm:prose-base prose-indigo max-w-none text-gray-600 leading-relaxed">
                                    <p>{item.explanation}</p>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </QuestionNavigator>
        </div>
    );
}
