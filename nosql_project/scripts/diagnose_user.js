
const { driver } = require('neo4j-driver');
const neo4j = require('neo4j-driver');
require('dotenv').config();

// Configuration manuelle si dotenv ne charge pas (adaptez si besoin)
const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

const driverInstance = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    disableLosslessIntegers: true,
    encrypted: 'ENCRYPTION_OFF', // Important pour local
});

async function diagnose() {
    const session = driverInstance.session();
    try {
        console.log('--- DIAGNOSTIC NEO4J ---');

        // 1. Chercher l'admin par son username pour voir ses propriétés
        console.log('\n1. Recherche de l\'utilisateur "admin1"...');
        const userRes = await session.run(`
            MATCH (u:User {username: 'admin1'})
            RETURN u, labels(u) as labels
        `);

        if (userRes.records.length === 0) {
            console.error('❌ Utilisateur "admin1" introuvable !');
        } else {
            const node = userRes.records[0].get('u');
            console.log('✅ Utilisateur trouvé. Propriétés :');
            console.log(JSON.stringify(node.properties, null, 2));

            // Vérifier quelle propriété contient le UUID
            if (node.properties.id) console.log('👉 Propriété "id" présente.');
            if (node.properties.userUuid) console.log('👉 Propriété "userUuid" présente.');
        }

        // 2. Vérifier le rôle ADMIN
        console.log('\n2. Vérification des relations Rôle...');
        const roleRes = await session.run(`
            MATCH (u:User {username: 'admin1'})-[r:HAS_ROLE]->(role:Role)
            RETURN role.name as roleName
        `);

        if (roleRes.records.length === 0) {
            console.warn('⚠️ Aucun rôle trouvé pour admin1 !');
        } else {
            roleRes.records.forEach(rec => {
                console.log(`✅ Rôle trouvé : ${rec.get('roleName')}`);
            });
        }

    } catch (error) {
        console.error('Erreur lors du diagnostic :', error);
    } finally {
        await session.close();
        await driverInstance.close();
    }
}

diagnose();
