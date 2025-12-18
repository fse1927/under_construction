import Link from "next/link";
import { ArrowRight, BookOpen, Flag, GraduationCap, CheckCircle2, Star, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil | Réussite France Citoyen",
  description: "L'application n°1 pour préparer et réussir votre entretien de naturalisation française. Quiz, cours et simulations gratuits.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">

      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 opacity-70"></div>

      {/* Hero Section */}
      <div className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="container px-4 mx-auto text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-in slide-in-from-top-4 fade-in duration-700 shadow-sm">
            <Flag className="w-4 h-4" />
            <span>La référence pour la naturalisation 2025</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1] max-w-5xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
            Votre passeport français <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent px-2">
              se prépare ici.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg lg:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 text-balance">
            Maîtrisez l&apos;entretien, apprenez l&apos;histoire de France et validez vos connaissances avec notre méthode interactive.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
            <Link href="/apprendre" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 text-lg rounded-full shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white transition-all hover:scale-105 hover:shadow-blue-600/30">
                <BookOpen className="mr-2 h-5 w-5" />
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full h-14 text-lg rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 dark:text-slate-300 transition-colors">
                Se connecter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 pt-8 flex flex-wrap justify-center gap-x-12 gap-y-6 text-slate-500 dark:text-slate-500 animate-in fade-in delay-500 border-t border-slate-100 dark:border-slate-900 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">2,000+ Apprenants</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">98% de Réussite</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Quiz Officiels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container px-4 mx-auto pb-32">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-7 h-7 text-amber-600 dark:text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Apprentissage Guidé</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Ne perdez plus de temps avec des PDF obsolètes. Nos fiches de révision sont structurées et mises à jour pour le livret citoyen 2025.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Quiz Intelligents</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Plus de 200 questions interactives. Notre algorithme identifie vos lacunes et vous propose des révisions ciblées pour progresser vite.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-7 h-7 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Simulateur d&apos;Entretien</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Entraînez-vous en conditions réelles. Répondez aux questions pièges des agents de préfecture et gagnez en aisance à l&apos;oral.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pb-8 pt-8 border-t border-slate-100 dark:border-slate-900 text-sm text-slate-400 dark:text-slate-600">
        <p>© 2025 France Citoyen. Conçu avec passion pour votre réussite.</p>
      </div>
    </div>
  );
}
