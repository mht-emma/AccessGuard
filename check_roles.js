const { runRead } = require('./nosql_project/services/neo4j.service');

async function checkRoles() {
    try {
        const cypher = `
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
      RETURN u.username, r.name
    `;
        const result = await runRead(cypher);
        result.records.forEach(record => {
            console.log(`User: ${record.get('u.username')}, Role: ${record.get('r.name')}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkRoles();
