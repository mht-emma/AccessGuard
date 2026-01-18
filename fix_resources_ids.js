const { runRead, runWrite } = require('./nosql_project/services/neo4j.service');
const { v4: uuidv4 } = require('uuid');

async function fixResources() {
    try {
        const cypher = `
      MATCH (r:Resource)
      WHERE r.id IS NULL
      RETURN r.path AS path
    `;
        const result = await runRead(cypher);

        console.log(`Found ${result.records.length} resources without IDs.`);

        for (const record of result.records) {
            const path = record.get('path');
            const id = uuidv4();

            const updateCypher = `
        MATCH (r:Resource {path: $path})
        SET r.id = $id
        RETURN r
      `;
            await runWrite(updateCypher, { path, id });
            console.log(`Fixed Resource: ${path} -> ${id}`);
        }

        console.log("All missing resource IDs have been backfilled.");
    } catch (err) {
        console.error("Error during resource fix:", err);
    } finally {
        process.exit(0);
    }
}

fixResources();
