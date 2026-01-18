
const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    disableLosslessIntegers: true,
    encrypted: 'ENCRYPTION_OFF',
});

async function deepInspect() {
    const session = driver.session();
    try {
        const userId = 'b782e208-128c-4504-9234-1dbec263134f';
        console.log(`--- INSPECTION APPROFONDIE POUR ${userId} ---`);

        // 1. Lister l'utilisateur et ses labels
        console.log('\n1. Vérification du noeud User :');
        const userRes = await session.run(`MATCH (u:User {id: $userId}) RETURN u`, { userId }); // Using {id: ...} !
        if (userRes.records.length === 0) {
            console.error('❌ Noeud User introuvable avec {id: ...} ! Essaie userUuid ?');
            const uuidRes = await session.run(`MATCH (u:User {userUuid: $userId}) RETURN u`, { userId });
            if (uuidRes.records.length > 0) console.log('✅ Trouvé avec userUuid !');
            else console.error('❌ Introuvable avec userUuid non plus.');
        } else {
            console.log('✅ Noeud User trouvé avec {id: ...}.');
        }

        // 2. Lister TOUTES les relations sortantes
        console.log('\n2. Relations sortantes :');
        const relRes = await session.run(`
            MATCH (u:User {id: $userId})-[r]->(target)
            RETURN type(r) as type, labels(target) as targetLabels, target.name as targetName
        `, { userId });

        relRes.records.forEach(rec => {
            console.log(`- [: ${rec.get('type')}] -> (${rec.get('targetLabels')}) {name: ${rec.get('targetName')}}`);
        });

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

deepInspect();
