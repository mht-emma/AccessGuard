const { closeDriver } = require('../config/neo4j');
const { config } = require('../config/neo4j');
const neo4j = require('neo4j-driver');

async function inspectStats() {
    const driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password), { encrypted: 'ENCRYPTION_OFF' });
    const session = driver.session({ database: config.database });

    try {
        const cypher = `
      MATCH (a:AccessAttempt)
      RETURN a.status as status, count(a) as count
      ORDER BY count DESC
    `;
        const result = await session.run(cypher);
        console.log('📊 STATUS DISTRIBUTION:');
        result.records.forEach(r => {
            console.log(`- ${r.get('status')}: ${r.get('count')}`);
        });

        console.log('\n🔗 RELATIONSHIP CHECKS:');
        const queries = [
            { name: 'User Links', cypher: 'MATCH (a:AccessAttempt) WHERE NOT (:User)-[:TRIED_TO_ACCESS]->(a) RETURN a.status, count(a)' },
            { name: 'IP Links', cypher: 'MATCH (a:AccessAttempt) WHERE NOT (a)-[:FROM_IP]->(:IP) RETURN a.status, count(a)' },
            { name: 'Resource Links', cypher: 'MATCH (a:AccessAttempt) WHERE NOT (a)-[:TARGET]->(:Resource) RETURN a.status, count(a)' }
        ];

        for (const q of queries) {
            const res = await session.run(q.cypher);
            console.log(`\nMissing ${q.name}:`);
            if (res.records.length === 0) console.log("  None (All good)");
            res.records.forEach(r => {
                console.log(`  ${r.get('a.status')}: ${r.get('count(a)')} missing link`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await session.close();
        await driver.close();
    }
}

inspectStats();
