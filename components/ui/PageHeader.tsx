'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string | ReactNode;
    description?: string | ReactNode;
    actions?: ReactNode;
    align?: 'left' | 'center';
    sticky?: boolean;
    className?: string;
    children?: ReactNode; // Allow custom content inside the header if needed (e.g. badges next to title moved to children or similar)
}

export function PageHeader({
    title,
    description,
    actions,
    align = 'left',
    sticky = true,
    className,
    children
}: PageHeaderProps) {
    return (
        <header
            className={cn(
                "w-full py-6 transition-all z-30",
                sticky && "sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50",
                // Adjust margins to match the container padding if sticky extends full width
                // For now, we assume it's used inside a container with padding, but we might negative margin it if we want full bleed sticky
                sticky && "-mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8",
                className
            )}
        >
            <div className={cn(
                "flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
                align === 'center' && "md:items-center text-center md:text-center"
            )}>
                <div className={cn("space-y-1.5", align === 'center' && "w-full")}>
                    <div className={cn("flex flex-wrap gap-3 items-center", align === 'center' && "justify-center")}>
                        {typeof title === 'string' ? (
                            <h1 className="text-3xl font-bold text-primary tracking-tight">
                                {title}
                            </h1>
                        ) : (
                            title
                        )}
                        {children}
                    </div>

                    {description && (
                        <div className={cn("text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl", align === 'center' && "mx-auto")}>
                            {description}
                        </div>
                    )}
                </div>

                {actions && (
                    <div className={cn(
                        "flex items-center gap-2 shrink-0",
                        align === 'center' && "justify-center mt-4 md:mt-0"
                    )}>
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}
