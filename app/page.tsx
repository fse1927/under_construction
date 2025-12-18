import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageCircle, Trophy, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 -z-10" />
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-red-400/20 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Nouveau : Simulateur d&apos;entretien avec IA
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-5 delay-100">
                        Réussissez votre
                        <span className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent px-2">
                            Naturalisation
                        </span>
                        <br />
                        Française
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 delay-200">
                        La plateforme complète pour préparer votre dossier et réussir votre entretien. Quiz, fiches de révision et simulation d&apos;entretien intelliigente.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 delay-300 w-full sm:w-auto">
                        <Link href="/apprendre" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/20 transition-all hover:scale-105">
                                Commencer Gratuitement
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/entretien" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800">
                                <MessageCircle className="mr-2 w-5 h-5 text-gray-500" />
                                Tester le Simulateur
                            </Button>
                        </Link>
                    </div>

                    {/* Stats / Trust */}
                    <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in fade-in delay-300">
                        {[
                            { label: "Questions à jour", value: "500+" },
                            { label: "Utilisateurs aidés", value: "2k+" },
                            { label: "Taux de réussite", value: "98%" },
                            { label: "Contenu gratuit", value: "100%" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tout pour réussir votre décret</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Une méthode structurée pour maîtriser l&apos;histoire, la culture et les valeurs de la République.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FeatureCard
                            icon={BookOpen}
                            title="Apprentissage Guidé"
                            description="Fiches de révision claires et quiz progressifs pour mémoriser l'essentiel sans stress."
                            color="bg-blue-100 text-blue-600"
                            delay="0"
                        />
                        <FeatureCard
                            icon={MessageCircle}
                            title="Simulateur de Préfecture"
                            description="Entraînez-vous avec les 100 questions les plus posées par les agents de préfecture."
                            color="bg-red-100 text-red-600"
                            delay="100"
                        />
                        <FeatureCard
                            icon={Trophy}
                            title="Suivi de Progression"
                            description="Visualisez votre avancement et débloquez des niveaux au fur et à mesure de votre maîtrise."
                            color="bg-amber-100 text-amber-600"
                            delay="200"
                        />
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} France Citoyen. Fait avec ❤️ pour les futurs citoyens.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, color, delay }: any) {
    return (
        <div className={`bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${delay}ms` }}>
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6`}>
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

