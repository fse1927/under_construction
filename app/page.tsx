'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
    const [timeLeft, setTimeLeft] = useState({
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
    });

    useEffect(() => {
        const launchDate = new Date('2026-05-22T00:00:00');

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = launchDate.getTime() - now;

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft({
                    days: days.toString().padStart(2, '0'),
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0'),
                });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen py-20 lg:py-32 flex flex-col items-center justify-center bg-gradient-to-br from-[#fafbfc] to-[#ffffff]">
            <div className="max-w-4xl mx-auto px-6 text-center">
                {/* Logo et branding */}
                <div className="mb-20">
                    <div className="flex items-center justify-center space-x-5 logo-container transition-transform duration-200 hover:scale-105">
                        <div className="flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <Image
                                src="/images/logo.png"
                                alt="Udrive.ma Logo"
                                width={44}
                                height={44}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="text-left">
                            <h2 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-violet-500">
                                Udrive.ma
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Icône principale */}
                <div className="mb-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 shadow-xl shadow-blue-500/20">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                    </div>
                </div>

                {/* Contenu principal */}
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                    Site en construction
                </h1>

                <p className="text-xl lg:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed font-normal">
                    Nous travaillons actuellement sur un projet incroyable pour vous offrir
                    une solution innovante visant à améliorer la mobilité au Maroc.
                </p>

                {/* Compteur */}
                <div className="mb-12">
                    <p className="text-lg text-gray-500 mb-10 font-medium">
                        Lancement prévu dans :
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-lg mx-auto">
                        {['jours', 'heures', 'minutes', 'secondes'].map((label, idx) => {
                            const value =
                                idx === 0
                                    ? timeLeft.days
                                    : idx === 1
                                        ? timeLeft.hours
                                        : idx === 2
                                            ? timeLeft.minutes
                                            : timeLeft.seconds;
                            return (
                                <div key={label} className="countdown-item transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-6">
                                        <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                                            {value}
                                        </div>
                                        <div className="text-sm text-gray-500 font-medium mt-1">
                                            {label}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
