const { runWrite } = require('./nosql_project/services/neo4j.service');

async function fixPermissions() {
    try {
        const cypher = `
      MATCH (p:Permission {name: "READ_GRAPH"})
      MERGE (res:Resource {path: "/graph"})
      ON CREATE SET res.name = "Graphes", res.type = "PAGE", res.id = randomUUID()
      MERGE (p)-[:ACCESS_TO]->(res)
      RETURN p, res
    `;
        const result = await runWrite(cypher);
        console.log(`Permission READ_GRAPH linked to /graph: ${result.records.length > 0}`);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

fixPermissions();
