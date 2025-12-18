
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Utiliser la clé Service Role pour l'écriture
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Erreur : Supabase URL ou Service Key manquante dans .env.local');
    process.exit(1);
}

if (!GEMINI_API_KEY) {
    console.error('❌ Erreur : GEMINI_API_KEY manquante dans .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Utilisation de gemini-pro (plus stable que flash sur certaines clés)
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function enrichExplanations() {
    console.log('🔄 Démarrage de l\'enrichissement des explications...');

    // On récupère un lot de questions pour vérifier celles qui ont besoin d'aide
    const { data: questions, error } = await supabase
        .from('questions')
        .select('id, question, answer, options, explanation')
        .range(0, 49); // On check les 50 premières pour commencer

    if (error) {
        console.error('❌ Erreur DB:', error);
        return;
    }

    if (!questions || questions.length === 0) {
        console.log('✅ Aucune question sans explication trouvée.');
        return;
    }

    console.log(`📝 ${questions.length} questions sans explication à traiter.`);

    for (const q of questions) {
        // Skip si l'explication est déjà substantielle (> 20 chars)
        if (q.explanation && q.explanation.length > 20) {
            console.log(`⏭️ Q${q.id} déjà expliquée. Skip.`);
            continue;
        }

        console.log(`🤖 Traitement Q${q.id}...`);

        try {
            const prompt = `
                Tu es un expert pédagogique.
                Question : "${q.question}"
                Réponse : "${q.answer}"
                Options : ${JSON.stringify(q.options)}

                Rédige une explication courte (max 30 mots) et claire expliquant pourquoi c'est la bonne réponse, pour un futur naturalisé français.
                Ne répète pas la question.
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();

            if (text) {
                const { error: updateError } = await supabase
                    .from('questions')
                    .update({ explanation: text })
                    .eq('id', q.id);

                if (updateError) console.error(`❌ Erreur update ${q.id}`, updateError);
                else console.log(`✅ Q${q.id} enrichie.`);
            }

            // Rate limit guard
            await new Promise(r => setTimeout(r, 1500));

        } catch (err: any) {
            console.error(`❌ Erreur IA pour Q${q.id}:`, err.message || err);
            // Si erreur 404/Auth, on arrête pour ne pas spammer
            if (err.status === 404 || err.status === 403) {
                console.error("🛑 Arrêt d'urgence : Problème d'API Key ou de Modèle.");
                break;
            }
        }
    }

    console.log('🎉 Script terminé.');
}

enrichExplanations();
