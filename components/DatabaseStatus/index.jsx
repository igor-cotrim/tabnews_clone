import useSWR from "swr";

import { fetchApi } from "services/fetch";

export default function DatabaseStatus() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 1000 * 60, // 1 minute
  });
  let databaseStatusInformation = "Carregando...";

  if (!isLoading && data) {
    databaseStatusInformation = (
      <>
        <div>Status: {data.dependencies.database.status}</div>
        <div>Versão: {data.dependencies.database.version}</div>
        <div>
          Conexões abertas: {data.dependencies.database.opened_connections}
        </div>
        <div>
          Conexões máximas: {data.dependencies.database.max_connections}
        </div>
      </>
    );
  }
  return (
    <div>
      <h2>Banco de Dados</h2>
      {databaseStatusInformation}
    </div>
  );
}
