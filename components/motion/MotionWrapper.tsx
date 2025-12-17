'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function MotionWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    const pathname = usePathname();

    // Use the base path for the key to avoid animation issues with dynamic routes
    // This means /apprendre/QA000001 and /apprendre/QA000002 share the same key
    // so they don't trigger exit animations that could block rendering
    const basePathKey = pathname.split('/').slice(0, 2).join('/');

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={basePathKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
