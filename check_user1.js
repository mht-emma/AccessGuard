const { runRead } = require('./nosql_project/services/neo4j.service');

async function checkUser(username) {
    try {
        const cypher = `
      MATCH (u:User {username: $username})-[:HAS_ROLE]->(r:Role)
      OPTIONAL MATCH (r)-[:GRANTS]->(p:Permission)
      RETURN u.username, r.name as role, collect(p.name) as permissions
    `;
        const result = await runRead(cypher, { username });
        if (result.records.length === 0) {
            console.log(`User ${username} not found`);
            return;
        }
        result.records.forEach(record => {
            console.log(`User: ${record.get('u.username')}`);
            console.log(`Role: ${record.get('role')}`);
            console.log(`Permissions: ${JSON.stringify(record.get('permissions'))}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkUser('user1');
