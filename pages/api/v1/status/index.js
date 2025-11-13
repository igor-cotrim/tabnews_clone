import database from "infra/database.js";

async function status(request, response) {
  const databaseName = process.env.POSTGRES_DB;
  const updatedAt = new Date().toISOString();
  const status = database ? "healthy" : "unhealthy";
  const version = await database
    .query({ text: "SHOW server_version;" })
    .then((res) => res.rows[0].server_version)
    .catch(() => "unknown");
  const maxConnections = await database
    .query({ text: "SHOW max_connections;" })
    .then((res) => parseInt(res.rows[0].max_connections, 10))
    .catch(() => -1);
  const openedConnections = await database
    .query({
      text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    })
    .then((res) => res.rows[0].count)
    .catch(() => -1);

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        status: status,
        version: version,
        max_connections: maxConnections,
        opened_connections: openedConnections,
      },
    },
  });
}

export default status;
