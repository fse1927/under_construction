
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Erreur : Supabase URL ou Service Key manquante dans .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Regex simple pour CSV (ne sera plus la méthode principale)
const CSV_REGEX = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;

function parseLine(line: string): string[] {
    // Tentative de détection du séparateur : Tab vs Comma
    // On regarde si la ligne contient des tabs
    if (line.includes('\t')) {
        // Mode TSV (Tab Separated Values)
        // Les TSV sont souvent simples, mais attention aux quotes
        // On va assumer un split simple pour commencer, car les logs montraient des espaces "PROPRES" entre les champs
        return line.split('\t').map(c => c.trim());
    } else {
        // Mode CSV Legacy
        const values: string[] = [];
        let match;
        // Reset lastIndex si on réutilise une regex globale (mais ici recréée ou non globale)
        // Note: CSV_REGEX est globale, donc attention
        CSV_REGEX.lastIndex = 0;
        while ((match = CSV_REGEX.exec(line))) {
            let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
            values.push(val.trim());
        }
        return values;
    }
}

async function importQAF() {
    const filePath = path.join(__dirname, '../public/QAF.txt');
    console.log(`📂 Lecture du fichier : ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('❌ Fichier introuvable.');
        return;
    }

    // Lecture synchrone avec encodage utf16le car le fichier a été détecté comme tel
    // On lit tout le fichier en mémoire car fs.createReadStream avec encoding utf16le peut être délicat pour split les lignes
    // Pour 500kb ça va.
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf16le' });

    // Normalisation des fins de fichier
    const lines = fileContent.split(/\r?\n/);

    let success = 0;
    let errors = 0;

    console.log(`🔄 Début de l'import de ${lines.length} lignes potentielles...`);

    // 1. Loading all data in memory
    const parsedQuestions: any[] = [];

    console.log("📊 Parsing and computing complexity scores...");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip header
        if (i === 0 && line.toLowerCase().includes('id,theme')) continue;
        if (!line.trim()) continue;

        try {
            const cols = parseLine(line);
            if (cols.length < 5) continue;

            const id = cols[0];
            const theme = cols[1];
            const type = cols[2];
            const question = cols[3];
            const answer = cols[4];
            let optionsStr = cols[5] || '[]';
            const explanation = cols[6] || null;

            // Parsing Options
            let options: string[] = [];
            try {
                optionsStr = optionsStr.replace(/""/g, '"');
                if (optionsStr.startsWith('"') && optionsStr.endsWith('"')) {
                    optionsStr = optionsStr.slice(1, -1);
                }
                options = JSON.parse(optionsStr);
            } catch (e) { }

            // Compute Complexity Score (Heuristic for sorting only)
            // Length is a good proxy. Dates usually harder.
            let complexityScore = (question.length + (explanation?.length || 0));
            if (theme.toLowerCase().includes('date') || question.includes('Quand')) complexityScore += 50;
            if (question.includes('Pourquoi')) complexityScore += 30; // Conceptual questions usually harder

            parsedQuestions.push({
                id, theme, type, question, answer, options, explanation, complexityScore
            });

        } catch (err) {
            console.error(`Parsing error line ${i}`);
        }
    }

    // 2. Sort by Complexity ascending
    parsedQuestions.sort((a, b) => a.complexityScore - b.complexityScore);

    // 3. Assign Targets: 200 Faciles / 200 Moyens / 100 Difficiles
    // Total approx 500.
    // 0-199 -> Facile
    // 200-399 -> Moyen
    // 400+ -> Difficile

    console.log(`🧠 Re-evaluating difficulty for ${parsedQuestions.length} questions...`);

    const batchUpdates = parsedQuestions.map((q, index) => {
        let difficulty = 'difficile';
        let importance = 3;

        if (index < 200) {
            difficulty = 'facile';
            importance = 1;
        } else if (index < 400) {
            difficulty = 'moyen';
            importance = 2;
        }

        const info_cards_chapter = q.theme
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

        const metadata = {
            source_file: "QAF.txt",
            imported_at: new Date().toISOString(),
            version: "2.1 (Expert Difficulty)",
            keywords: q.theme.split(' '),
            complexity_score: q.complexityScore,
            rank_percentile: Math.round((index / parsedQuestions.length) * 100)
        };

        return {
            id: q.id,
            theme: q.theme,
            type: q.type,
            question: q.question,
            answer: q.answer,
            options: q.options,
            explanation: q.explanation,
            difficulty: difficulty,
            importance: importance,
            source: "Livret du Citoyen",
            info_cards_chapter: info_cards_chapter,
            metadata: metadata
        };
    });

    // 4. Batch Insert
    console.log("💾 Starting Upsert...");

    for (const q of batchUpdates) {
        const { error } = await supabase.from('questions').upsert(q);
        if (error) {
            console.error(`❌ Error ${q.id}:`, error.message);
            errors++;
        } else {
            success++;
            if (success % 50 === 0) process.stdout.write('.');
        }
    }

    console.log(`\n\n✅ Report:`);
    console.log(`📥 Total Lines Read: ${lines.length}`);
    console.log(`✅ Success Inserts: ${success}`);
    console.log(`❌ Errors: ${errors}`);
}

importQAF();
