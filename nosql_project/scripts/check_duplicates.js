const { closeDriver } = require('../config/neo4j');
const { config } = require('../config/neo4j');
const neo4j = require('neo4j-driver');

async function checkDuplicates() {
    const driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password), { encrypted: 'ENCRYPTION_OFF' });
    const session = driver.session({ database: config.database });

    try {
        const cypher = `
      MATCH (a:AccessAttempt)
      WITH a.id as id, count(a) as count
      WHERE count > 1
      RETURN id, count, collect(id(a)) as nodeIds
      LIMIT 10
    `;
        const result = await session.run(cypher);

        if (result.records.length === 0) {
            console.log('✅ No duplicates found based on a.id');
        } else {
            console.log('❌ DUPLICATES FOUND!');
            result.records.forEach(r => {
                console.log(`ID: ${r.get('id')} - Count: ${r.get('count').toNumber()}`);
            });
        }

        const countNodes = await session.run('MATCH (a:AccessAttempt) RETURN count(a) as totalNodes');
        const countIds = await session.run('MATCH (a:AccessAttempt) RETURN count(DISTINCT a.id) as totalIds');

        console.log(`Total Nodes: ${countNodes.records[0].get('totalNodes')}`);
        console.log(`Unique IDs: ${countIds.records[0].get('totalIds')}`);

    } catch (err) {
        console.error(err);
    } finally {
        await session.close();
        await driver.close();
    }
}

checkDuplicates();
