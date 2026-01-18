const { runWrite } = require('../services/neo4j.service');
const { closeDriver } = require('../config/neo4j');

async function fixResourceIds() {
    console.log('🔧 Starting Resource ID fix...');
    try {
        const cypher = `
      MATCH (r:Resource)
      WHERE r.id IS NULL
      SET r.id = randomUUID()
      RETURN count(r) as updatedCount
    `;

        const result = await runWrite(cypher);
        const count = result.records[0].get('updatedCount').low; // Assuming standard neo4j int

        console.log(`✅ Fixed ${count} resources with missing IDs.`);
    } catch (error) {
        console.error('❌ Error fixing resource IDs:', error);
    } finally {
        await closeDriver();
    }
}

fixResourceIds();
