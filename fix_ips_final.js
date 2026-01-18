const { runWrite } = require('./nosql_project/services/neo4j.service');

async function fixIPs() {
    try {
        const cypher = `
      MATCH (ip:IP)
      WHERE ip.id IS NULL
      SET ip.id = apoc.create.uuid(), ip.isSuspicious = coalesce(ip.isSuspicious, false)
      RETURN count(ip) as count
    `;
        // If APOC is not available, use a simpler manual SET with a fallback logic
        const fallbackCypher = `
      MATCH (ip:IP)
      WHERE ip.id IS NULL
      SET ip.id = "ip_" + replace(ip.address, ".", "_"), ip.isSuspicious = coalesce(ip.isSuspicious, false)
      RETURN count(ip) as count
    `;

        try {
            const result = await runWrite(cypher);
            console.log(`Fixed ${result.records[0].get('count')} IPs using APOC.`);
        } catch (e) {
            console.log("APOC UUID failed, using fallback ID generation...");
            const result = await runWrite(fallbackCypher);
            console.log(`Fixed ${result.records[0].get('count')} IPs using fallback.`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

fixIPs();
