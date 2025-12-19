
import InterviewSimulator from '@/components/InterviewSimulator';
import { MessageCircle } from 'lucide-react';
import { getUserProfile } from '@/app/profil/actions';
import { getInterviewQuestions } from '@/lib/actions/questions';
import { InterviewQuestion } from '@/components/interview/useInterview';
import { Question } from '@/lib/data/types';
import { PageHeader } from '@/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

export default async function EntretienPage() {
    const data = await getUserProfile();
    const userSituation = data?.user.profil_situation || 'salarié'; // Default if null

    // Fetch interview questions specific to user situation
    const rawQuestions = await getInterviewQuestions(userSituation);

    // Map to InterviewQuestion type
    const questions: InterviewQuestion[] = rawQuestions.map((q: Question) => ({
        id: q.id,
        question: q.question,
        category: q.theme,
        metadata: {
            answer_tips: `Réponse attendue : ${q.answer}\n\n${q.explanation || ''}`,
            required_for: q.metadata?.required_for || []
        },
        answer_tips: `Réponse attendue : ${q.answer}\n\n${q.explanation || ''}`
    }));

    return (
        <div className="p-4 pb-24 max-w-xl mx-auto space-y-6">
            <PageHeader
                title="Entretien"
                description="Simulez les questions posées par l'agent de préfecture."
            />

            <InterviewSimulator userSituation={userSituation} questions={questions} />
        </div>
    );
}
