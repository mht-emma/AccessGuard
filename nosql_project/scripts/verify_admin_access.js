
const neo4j = require('neo4j-driver');
require('dotenv').config();

// Configuration manuelle
const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    disableLosslessIntegers: true,
    encrypted: 'ENCRYPTION_OFF',
});

// TEST AVEC LA BONNE DB
const DATABASE_NAME = 'loginaccess';

async function verifyQuery() {
    const session = driver.session({ database: DATABASE_NAME });
    try {
        console.log(`--- VERIFICATION REQUETE ADMIN (DB: ${DATABASE_NAME}) ---`);

        const userId = 'b782e208-128c-4504-9234-1dbec263134f';
        console.log(`Test avec userId : ${userId}`);

        const adminCypher = `
            MATCH (u:User {id: $userId})-[:HAS_ROLE]->(r:Role {name: 'ADMIN'})
            RETURN count(r) > 0 AS isAdmin
        `;

        console.log(`\nExécution de la requête :\n${adminCypher}`);

        const result = await session.run(adminCypher, { userId });

        if (result.records.length > 0) {
            const isAdmin = result.records[0].get('isAdmin');
            console.log(`\n✅ Résultat 'isAdmin' : ${isAdmin} (Type: ${typeof isAdmin})`);
        } else {
            console.error('\n❌ Aucun record retourné !');
        }

    } catch (error) {
        console.error('Erreur lors de la requête :', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

verifyQuery();
