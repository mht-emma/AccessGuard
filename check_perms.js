const { runRead } = require('./nosql_project/services/neo4j.service');

async function checkPermissions() {
    try {
        const cypher = `
      MATCH (p:Permission)
      OPTIONAL MATCH (p)-[r:ACCESS_TO]->(res:Resource)
      RETURN p.name as name, res.path as resourcePath
    `;
        const result = await runRead(cypher);
        result.records.forEach(record => {
            console.log(`Permission: ${record.get('name')}, Resource: ${record.get('resourcePath') || 'NONE'}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkPermissions();
