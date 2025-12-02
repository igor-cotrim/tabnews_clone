import useSWR from "swr";

import { fetchApi } from "infra/services/fetch";

export default function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 1000 * 60, // 1 minute
  });
  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <p>Última atualização: {updatedAtText}</p>;
}
