
export type Difficulty = 'facile' | 'moyen' | 'difficile';
export type Importance = 1 | 2 | 3;
export type QuestionType = 'quiz' | 'interview';

export interface Question {
    id: string; // Corrected to string (varchar/uuid)
    question: string;
    answer: string;
    options: string[];
    theme: string;
    explanation?: string;
    difficulty?: Difficulty;
    importance?: Importance;
    source?: string;
    type: QuestionType;
    created_at?: string;
    metadata?: {
        tips?: string;
        answer_tips?: string;
        required_for?: string[];
        [key: string]: any;
    };
}

export interface LearningContent {
    id: string;
    title: string;
    content: string;
    theme: string;
    importance: Importance;
}

export interface UserProfile {
    id: string;
    email: string;
    nickname?: string;
    xp: number;
    level: number;
    current_streak: number;
    last_activity_date: string;
}

export interface Flashcard {
    id: string;
    user_id: string;
    question_id: string;
    box: number;
    next_review_at: string;
    last_reviewed_at?: string;
    question?: Question; // Join result
}
