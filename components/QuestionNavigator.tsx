'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuestionNavigatorProps {
    currentId: string;
    prevId: string | null;
    nextId: string | null;
    totalQuestions: number;
    currentPosition: number;
    children: React.ReactNode;
}

export default function QuestionNavigator({
    currentId,
    prevId,
    nextId,
    totalQuestions,
    currentPosition,
    children
}: QuestionNavigatorProps) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    // Motion values for swipe
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

    const SWIPE_THRESHOLD = 80;

    // Handle swipe navigation
    const handleSwipeNavigate = useCallback((targetId: string) => {
        if (isNavigating) return;
        setIsNavigating(true);
        // Use window.location for reliable full page navigation
        window.location.href = `/apprendre/${targetId}`;
    }, [isNavigating]);

    const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info;

        // Determine if swipe was significant enough
        const swipeThreshold = SWIPE_THRESHOLD;
        const velocityThreshold = 500;

        if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
            // Swiped left -> next question
            if (nextId) {
                handleSwipeNavigate(nextId);
            }
        } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
            // Swiped right -> previous question
            if (prevId) {
                handleSwipeNavigate(prevId);
            }
        }
    }, [nextId, prevId, handleSwipeNavigate]);

    return (
        <div className="relative">
            {/* Position indicator */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500 font-medium">
                    Question <span className="text-primary font-bold">{currentPosition}</span> sur <span className="font-bold">{totalQuestions}</span>
                </div>

                {/* Desktop navigation buttons - using Link for proper SSR */}
                <div className="flex items-center gap-2">
                    {prevId ? (
                        <Link
                            href={`/apprendre/${prevId}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg
                                transition-all duration-200
                                bg-white border border-gray-200 text-gray-700 
                                hover:bg-gray-50 hover:border-gray-300 active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Précédent</span>
                        </Link>
                    ) : (
                        <span className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg
                            bg-white border border-gray-200 text-gray-400 opacity-40 cursor-not-allowed">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Précédent</span>
                        </span>
                    )}

                    {nextId ? (
                        <Link
                            href={`/apprendre/${nextId}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg
                                transition-all duration-200
                                bg-primary text-white
                                hover:bg-primary/90 active:scale-95"
                        >
                            <span className="hidden sm:inline">Suivant</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <span className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg
                            bg-primary text-white opacity-40 cursor-not-allowed">
                            <span className="hidden sm:inline">Suivant</span>
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentPosition / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            {/* Swipeable card container */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{ x, rotate, opacity }}
                className="cursor-grab active:cursor-grabbing touch-pan-y"
                whileTap={{ cursor: "grabbing" }}
            >
                {/* Page shadow effect for notebook feel */}
                <div className="relative">
                    {/* Left page shadow (previous) */}
                    {prevId && (
                        <div className="absolute -left-2 top-4 bottom-4 w-4 bg-gradient-to-r from-transparent to-gray-200/50 rounded-l-lg pointer-events-none" />
                    )}

                    {/* Main content card */}
                    <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Notebook binding effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30" />

                        <div className="pl-4">
                            {children}
                        </div>
                    </div>

                    {/* Right page shadow (next) */}
                    {nextId && (
                        <div className="absolute -right-2 top-4 bottom-4 w-4 bg-gradient-to-l from-transparent to-gray-200/50 rounded-r-lg pointer-events-none" />
                    )}
                </div>
            </motion.div>

            {/* Swipe hint for mobile */}
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400 sm:hidden">
                {prevId && (
                    <div className="flex items-center gap-1 animate-pulse">
                        <ChevronLeft className="w-3 h-3" />
                        <span>Glisser pour précédent</span>
                    </div>
                )}
                {nextId && (
                    <div className="flex items-center gap-1 animate-pulse">
                        <span>Glisser pour suivant</span>
                        <ChevronRight className="w-3 h-3" />
                    </div>
                )}
            </div>

            {/* Navigation dots for visual feedback */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
                {Array.from({ length: Math.min(5, totalQuestions) }, (_, i) => {
                    // Show dots around current position
                    const startIndex = Math.max(0, currentPosition - 3);
                    const dotPosition = startIndex + i + 1;
                    if (dotPosition > totalQuestions) return null;

                    const isActive = dotPosition === currentPosition;
                    return (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-300 ${isActive
                                    ? 'w-6 h-2 bg-primary'
                                    : 'w-2 h-2 bg-gray-300'
                                }`}
                        />
                    );
                })}
                {currentPosition < totalQuestions - 2 && totalQuestions > 5 && (
                    <span className="text-xs text-gray-400 ml-1">...</span>
                )}
            </div>
        </div>
    );
}
