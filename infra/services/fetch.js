export async function fetchApi(apiUrl) {
  const response = await fetch(apiUrl);
  const body = await response.json();

  return body;
}
