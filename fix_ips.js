const { runRead, runWrite } = require('./nosql_project/services/neo4j.service');
const { v4: uuidv4 } = require('uuid');

async function fixIPs() {
    try {
        const cypher = `
      MATCH (ip:IP)
      WHERE ip.id IS NULL OR ip.isSuspicious IS NULL
      RETURN ip
    `;
        const result = await runRead(cypher);

        for (const record of result.records) {
            const ipNode = record.get('ip');
            const address = ipNode.properties.address;
            const id = ipNode.properties.id || uuidv4();
            const isSuspicious = ipNode.properties.isSuspicious || false;

            const updateCypher = `
        MATCH (ip:IP {address: $address})
        SET ip.id = $id, ip.isSuspicious = $isSuspicious
        RETURN ip
      `;
            await runWrite(updateCypher, { address, id, isSuspicious });
            console.log(`Fixed IP: ${address}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

fixIPs();
