
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// URL à surveiller (Exemple : Acquisition de la nationalité française)
const TARGET_URL = 'https://www.service-public.fr/particuliers/vosdroits/N111';
const DATA_FILE = path.join(__dirname, 'content_hash.json');

async function checkContentUpdate() {
    console.log(`🔍 Vérification des mises à jour sur : ${TARGET_URL}`);

    try {
        const { data } = await axios.get(TARGET_URL);
        const $ = cheerio.load(data);

        // Cibler le contenu principal (ex: #content)
        // Note: Le sélecteur dépend de la structure du site cible.
        // Sur service-public.fr, le contenu est souvent dans 'main' ou '#main'.
        const mainContent = $('main').text();

        // Nettoyage basique (espaces, sauts de ligne)
        const cleanContent = mainContent.replace(/\s+/g, ' ').trim();

        // Générer un hash simple (ou juste stocker la longueur/date)
        const currentHash = require('crypto').createHash('md5').update(cleanContent).digest('hex');

        console.log(`📝 Hash actuel : ${currentHash}`);

        let previousData = { hash: '', lastCheck: '' };
        if (fs.existsSync(DATA_FILE)) {
            previousData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        }

        if (previousData.hash && previousData.hash !== currentHash) {
            console.log('🚨 CHANGEMENT DÉTECTÉ ! Le contenu a été modifié depuis la dernière vérification.');
            console.log(`Dernière vérification : ${previousData.lastCheck}`);

            // TODO: Envoyer un email à l'admin ou créer une notif
        } else if (previousData.hash === currentHash) {
            console.log('✅ Aucun changement détecté.');
        } else {
            console.log('🆕 Première initialisation du suivi pour cette page.');
        }

        // Sauvegarder le nouvel état
        fs.writeFileSync(DATA_FILE, JSON.stringify({
            hash: currentHash,
            lastCheck: new Date().toISOString()
        }, null, 2));

    } catch (error) {
        console.error('❌ Erreur lors du scraping :', error);
    }
}

checkContentUpdate();
