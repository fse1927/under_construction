'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Actually I checked components/ui and Table was NOT there. I should check again or build it.
// Checking Step 73, only button, card, input.
// I will build a simple Table structure using Tailwind directly to avoid dependency issues if I can't find it.
// But "DataTable" usually implies more features.
// I'll stick to standard HTML table with Tailwind classes for now to be safe.

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash,
    MoreHorizontal,
    Plus
} from 'lucide-react';
import { Question } from '@/lib/data/types';
import { deleteQuestion } from '@/app/admin/questions/actions';
import { QuestionSheet } from './QuestionSheet';

interface QuestionTableProps {
    questions: Question[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    editingQuestion?: Question | null;
}

export function QuestionTable({
    questions,
    totalCount,
    currentPage,
    pageSize,
    editingQuestion
}: QuestionTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
    const [isSheetOpen, setIsSheetOpen] = useState(!!editingQuestion);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(editingQuestion || null);

    // Sync state when editingQuestion prop changes (e.g. from URL navigation)
    useEffect(() => {
        if (editingQuestion) {
            setSelectedQuestion(editingQuestion);
            setIsSheetOpen(true);
        } else {
            // Optional: If URL param removed, close sheet? 
            // Usually if we navigate away from ?edit=ID, editingQuestion becomes null.
            // But we might want to keep it open if user is just creating new?
            // Let's strictly follow the prop for "edit mode".
            // If editingQuestion becomes null, it means we are not in "edit link" mode.
            // But user might have just closed it.
            // Logic: Only force open if editingQuestion is present. 
            // If it becomes null, we don't necessarily close it because user might be manually adding.
        }
    }, [editingQuestion]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        params.set('page', '1'); // Reset to page 1
        router.push(`?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const handleEdit = (question: Question) => {
        setSelectedQuestion(question);
        setIsSheetOpen(true);
    };

    const handleAddNew = () => {
        setSelectedQuestion(null);
        setIsSheetOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;

        try {
            const res = await deleteQuestion(id);
            if (res.error) {
                alert('Erreur lors de la suppression');
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('Erreur inattendue');
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Search Bar - Full width on mobile/tablet, 4 columns on desktop */}
                    <div className="lg:col-span-4 relative">
                        <Input
                            placeholder="Rechercher une question..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Filters - Stack on mobile, inline on desktop */}
                    <div className="lg:col-span-8 flex flex-col sm:flex-row gap-3 items-center justify-between flex-wrap">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap">
                            <select
                                className="h-10 w-full sm:w-40 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams);
                                    if (e.target.value) params.set('theme', e.target.value);
                                    else params.delete('theme');
                                    params.set('page', '1');
                                    router.push(`?${params.toString()}`);
                                }}
                                defaultValue={searchParams.get('theme') || ''}
                            >
                                <option value="">Tous les thèmes</option>
                                <option value="Histoire">Histoire</option>
                                <option value="Institutions">Institutions</option>
                                <option value="Valeurs">Valeurs</option>
                                <option value="Géographie">Géographie</option>
                            </select>

                            <select
                                className="h-10 w-full sm:w-40 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams);
                                    if (e.target.value) params.set('type', e.target.value);
                                    else params.delete('type');
                                    params.set('page', '1');
                                    router.push(`?${params.toString()}`);
                                }}
                                defaultValue={searchParams.get('type') || ''}
                            >
                                <option value="">Tous les types</option>
                                <option value="quiz">Quiz QCM</option>
                                <option value="interview">Entretien</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 w-full sm:w-auto">
                            <label className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-gray-100 h-10 px-4 py-2 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-white">
                                <span>Import CSV</span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const text = await file.text();
                                        try {
                                            const { parseCSV } = await import('@/lib/admin/csv-import');
                                            const { importQuestions } = await import('@/app/admin/questions/actions');

                                            const data = parseCSV(text);
                                            if (data.length === 0) {
                                                alert('Aucune question trouvée dans le CSV.');
                                                return;
                                            }

                                            if (confirm(`Importer ${data.length} questions ?`)) {
                                                await importQuestions(data);
                                                alert('Import réussi !');
                                                router.refresh();
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert('Erreur lors de l\'import.');
                                        }
                                        e.target.value = '';
                                    }}
                                />
                            </label>

                            <Button onClick={handleAddNew} className="flex-1 sm:flex-none whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Ajouter</span>
                                <span className="sm:hidden">Ajouter</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 font-medium">Question</th>
                                <th className="px-4 py-3 font-medium w-32">Thème</th>
                                <th className="px-4 py-3 font-medium w-24">Difficile</th>
                                <th className="px-4 py-3 font-medium w-24">Type</th>
                                <th className="px-4 py-3 font-medium w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {questions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        Aucune question trouvée.
                                    </td>
                                </tr>
                            ) : questions.map((q) => (
                                <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-md truncate" title={q.question}>
                                        {q.question}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                                            {q.theme}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        {q.difficulty && (
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                                                ${q.difficulty === 'facile' ? 'bg-green-100 text-green-700' :
                                                    q.difficulty === 'moyen' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                                {q.difficulty}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        <span className="font-mono text-xs text-slate-500">
                                            {q.type === 'interview' ? 'Entretien' : 'Quiz'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => handleEdit(q)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                                onClick={() => handleDelete(q.id)}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                    {questions.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Aucune question trouvée.
                        </div>
                    ) : questions.map((q) => (
                        <div key={q.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize mb-2
                                    ${q.difficulty === 'facile' ? 'bg-green-100 text-green-700' :
                                        q.difficulty === 'moyen' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'}`}>
                                    {q.difficulty || 'moyen'}
                                </span>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600" onClick={() => handleEdit(q)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-red-600" onClick={() => handleDelete(q.id)}>
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="font-medium text-gray-900 dark:text-white text-base">
                                {q.question}
                            </h3>

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-800">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                                    {q.theme}
                                </span>
                                <span className="uppercase tracking-wider font-semibold">
                                    {q.type === 'interview' ? 'Entretien' : 'Quiz'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage {questions.length} sur {totalCount}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Précédent
                        </Button>
                        <span className="text-sm font-medium mx-2">
                            Page {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Suivant
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Sheet Component (Placeholder for now) */}
            <QuestionSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                question={selectedQuestion}
            />
        </div>
    );
}
