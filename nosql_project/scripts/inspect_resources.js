const { runRead, closeDriver } = require('../services/neo4j.service');
const { config } = require('../config/neo4j');
const neo4j = require('neo4j-driver');

async function inspectResources() {
    const driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password), { encrypted: 'ENCRYPTION_OFF' });
    const session = driver.session({ database: config.database });

    try {
        const cypher = `
      MATCH (r:Resource)
      OPTIONAL MATCH (p:Permission)-[:ACCESS_TO]->(r)
      RETURN r.id AS id, r.path AS path, r.description AS description, p
      ORDER BY r.path
    `;
        const result = await session.run(cypher);
        console.log(`Found ${result.records.length} resources via Controller Query.`);
        result.records.forEach((record, i) => {
            const id = record.get('id');
            const path = record.get('path');
            const p = record.get('p');
            console.log(`Resource ${i}: ID=${id} (${typeof id}), Path=${path}, Permission=${p ? p.properties.name : 'None'}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await session.close();
        await driver.close();
    }
}

inspectResources();
