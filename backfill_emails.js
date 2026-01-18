const { runWrite } = require('./nosql_project/services/neo4j.service');

async function backfillEmails() {
    try {
        const users = [
            { username: 'admin1', email: 'admin@accessguard.com' },
            { username: 'user1', email: 'user1@accessguard.com' },
            { username: 'user5', email: 'user5@accessguard.com' },
            { username: 'uu6', email: 'uu6@accessguard.com' }
        ];

        for (const u of users) {
            const cypher = `MATCH (usr:User {username: $username}) SET usr.email = $email RETURN usr`;
            await runWrite(cypher, u);
            console.log(`Updated email for ${u.username}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

backfillEmails();
