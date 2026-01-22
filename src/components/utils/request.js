export default async function request(url, method, data = {}, auth = false) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (auth) {
    const token = localStorage.getItem("token");
    console.log("Token dans request:", token);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  const response = await fetch(url, {
    method,
    headers,
    body: method === "GET" ? null : JSON.stringify(data),
  });

  return { data: await response.json(), status: response.status };
}
