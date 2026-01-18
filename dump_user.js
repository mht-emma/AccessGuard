const { runRead } = require('./nosql_project/services/neo4j.service');

async function checkUser(username) {
    try {
        const cypher = `MATCH (u:User {username: $username}) RETURN u`;
        const result = await runRead(cypher, { username });
        if (result.records.length > 0) {
            console.log(JSON.stringify(result.records[0].get('u').properties, null, 2));
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkUser('uu6');
