'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Question } from '@/lib/data/types';
import { useEffect, useState } from 'react';
import { upsertQuestion } from '@/app/admin/questions/actions';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface QuestionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    question: Question | null;
}

export function QuestionSheet({ isOpen, onClose, question }: QuestionSheetProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Question>>({
        question: '',
        answer: '',
        theme: 'Histoire',
        difficulty: 'moyen',

        options: ['', '', ''],
        explanation: '',
        type: 'quiz'
    });

    useEffect(() => {
        if (question) {
            // Visualize only Distractors (exclude Answer)
            const normalize = (s: string) => s?.trim().toLowerCase();
            const answerRate = normalize(question.answer);

            const distractors = (question.options || [])
                .filter(opt => normalize(opt) !== answerRate);

            // Pad to 3 distractors
            const paddedDistractors = [...distractors, '', '', ''].slice(0, 3);

            setFormData({
                ...question,
                options: paddedDistractors
            });
        } else {
            setFormData({
                question: '',
                answer: '',
                theme: 'Histoire',
                difficulty: 'moyen',
                options: ['', '', ''],
                explanation: '',
                type: 'quiz'
            });
        }
    }, [question, isOpen]);

    const handleChange = (field: keyof Question, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || [])];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Combine Answer + Distractors for DB
            const distractors = formData.options?.filter(o => o.trim() !== '') || [];
            if (!formData.answer) {
                alert("La réponse correcte est requise.");
                setIsLoading(false);
                return;
            }

            // Ensure Answer is included in options, but shuffle? 
            // Or just store it. The quiz runner often shuffles.
            // Storing [Answer, ...Distractors] is standard.
            const fullOptions = [formData.answer, ...distractors];

            const payload = {
                ...formData,
                options: fullOptions
            };

            const result = await upsertQuestion(payload);

            if (result.error) {
                alert(result.error);
            } else {
                onClose();
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full sm:max-w-xl bg-white dark:bg-slate-950 shadow-2xl z-50 overflow-y-auto border-l border-gray-200 dark:border-slate-800"
                    >
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {question ? 'Modifier la question' : 'Nouvelle question'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {question ? 'Modifiez les détails ci-dessous.' : 'Créez une nouvelle fiche.'}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Question</label>
                                    <Input
                                        value={formData.question}
                                        onChange={e => handleChange('question', e.target.value)}
                                        required
                                        placeholder="Intitulé de la question"
                                        className="text-lg font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Thème</label>
                                        <select
                                            value={formData.theme}
                                            onChange={e => handleChange('theme', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                        >
                                            <option value="Histoire">Histoire</option>
                                            <option value="Institutions">Institutions</option>
                                            <option value="Valeurs">Valeurs</option>
                                            <option value="Géographie">Géographie</option>
                                            <option value="Divers">Divers</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Difficulté</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={e => handleChange('difficulty', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                        >
                                            <option value="facile">Facile</option>
                                            <option value="moyen">Moyen</option>
                                            <option value="difficile">Difficile</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Réponse Correcte</label>
                                    <Input
                                        value={formData.answer}
                                        onChange={e => handleChange('answer', e.target.value)}
                                        required
                                        placeholder="La bonne réponse"
                                        className="border-green-200 focus:border-green-500 bg-green-50/30 font-bold text-green-800"
                                    />
                                </div>

                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800">
                                    <label className="text-sm font-bold leading-none">Mauvaises réponses (Distracteurs)</label>
                                    {[0, 1, 2].map((i) => (
                                        <Input
                                            key={i}
                                            value={formData.options?.[i] || ''}
                                            onChange={e => handleOptionChange(i, e.target.value)}
                                            placeholder={`Mauvaise réponse ${i + 1}`}
                                            className="bg-white dark:bg-slate-950"
                                        />
                                    ))}
                                    <p className="text-xs text-gray-500">
                                        Saisissez les 3 choix incorrects. La réponse correcte sera ajoutée automatiquement aux options.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Explication</label>
                                    <textarea
                                        rows={4}
                                        value={formData.explanation || ''}
                                        onChange={e => handleChange('explanation', e.target.value)}
                                        placeholder="Pourquoi cette réponse est-elle correcte ?"
                                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => handleChange('type', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                    >
                                        <option value="quiz">Quiz QCM</option>
                                        <option value="interview">Entretien</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
